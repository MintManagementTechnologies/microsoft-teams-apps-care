using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CareApi.Models;
using CareApi.Repository;
using CareApi.Extensions;
using Microsoft.AspNetCore.Http;
using System.Net;
using CareApi.Enums;
using System.Linq;
using Newtonsoft.Json;

namespace CareApi.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IActionRepository _ActionRepository;
        private readonly IFileRepository _fileRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TicketService> _logger;
       
        /// <summary>
        /// IT Care Ticket Service
        /// </summary>
        /// <param name="ticketRepository"></param>
        /// <param name="ActionRepository"></param>
        /// <param name="fileRepository"></param>
        /// <param name="httpContextAccessor"></param>
        /// <param name="logger"></param>
        public TicketService(ITicketRepository ticketRepository,
            IActionRepository ActionRepository,
            IFileRepository fileRepository,
            IHttpContextAccessor httpContextAccessor,
            ILogger<TicketService> logger)
        {
            _ticketRepository = ticketRepository;
            _ActionRepository = ActionRepository;
            _fileRepository = fileRepository;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<List<TicketResponseModel>> GetAll()
        {
            List<TicketResponseModel> results = new List<TicketResponseModel>();

            try
            {
                var dbResults = await _ticketRepository.GetAll();
                if (dbResults == null || dbResults.Count <= 0) return null;
                foreach (var dbResult in dbResults)
                {
                    var item = dbResult.BuildTicketResponseFromDBEntity();

                    results.Add(item);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occured with GetAll");
                return results;
            }
        }

        public async Task<List<TicketResponseModel>> GetAll(string partitionKey)
        {
            List<TicketResponseModel> results = new List<TicketResponseModel>();

            try
            {
                var dbResults = await _ticketRepository.GetAll(partitionKey);
                foreach (var dbResult in dbResults)
                {
                    var item = dbResult.BuildTicketResponseFromDBEntity();

                    results.Add(item);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with GetAll | paritionKey: {partitionKey}");
                return results;
            }
        }

        public async Task<List<TicketResponseModel>> FilterBy(string partitionKey, TicketFilter filterOptions)
        {
            List<TicketResponseModel> results = new List<TicketResponseModel>();

            try
            {
                var dbResults = await _ticketRepository.FilterBy(partitionKey, filterOptions);
                foreach (var dbResult in dbResults)
                {
                    var item = dbResult.BuildTicketResponseFromDBEntity();
                    results.Add(item);
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with FilterBy | paritionKey: {partitionKey} | data: {JsonConvert.SerializeObject(filterOptions)}");
                return results;
            }
        }

        public async Task<TicketResponseModel> Get(string partitionKey, string rowKey)
        {
            try
            {
                List<string> cleanAttachments = new List<string>();
                var dbResult = await _ticketRepository.Get(partitionKey, rowKey);
                if (dbResult == null)
                {
                    _httpContextAccessor.HttpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    return null;
                }

                var attachments = await _fileRepository.GetFilesAsync(dbResult.RowKey);
                if (attachments != null && attachments.Count > 0)
                {
                    cleanAttachments = attachments.Select(x => x.Replace($"{dbResult.RowKey}/", "")).ToList();
                }

                var results = dbResult.BuildTicketResponseFromDBEntity(cleanAttachments);
                var actions = await GetActionsAsync(dbResult.RowKey);

                if (actions != null)
                {
                    results.Updates = new List<ActionResponse>(actions);
                    results.Updates = results.Updates.OrderByDescending(x => x.Timestamp).ToList();
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with Get | paritionKey: {partitionKey} | rowKey: {rowKey}");
                return null;
            }
        }

        public async Task<TicketResponseModel> CreateTicket(string partitionKey, string rowKey, TicketRequestModel req)
        {
            try
            {
                var time = DateTime.UtcNow;
                if (string.IsNullOrEmpty(req.ReferenceNo))
                    req.ReferenceNo = $"REF-{Guid.NewGuid().ToString().Replace("-", "")}".ToUpper();

                var ticketId = rowKey;
                var ticketDbEntity = req.BuildTicketDbEntityFromRequest(partitionKey, ticketId);

                ticketDbEntity.CreatedTimestamp = time;
                ticketDbEntity.Timestamp = time;

                var repoResult = await _ticketRepository.Create(ticketDbEntity);
                if (repoResult.Result == null)
                {
                    _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;
                    return null;
                }
                var response = ticketDbEntity.BuildTicketResponseFromDBEntity();
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with CreateTicket | paritionKey: {partitionKey} | rowKey: {rowKey} | data: {JsonConvert.SerializeObject(req)}");
                return null;
            }
        }

        public async Task<string> UpdateTicket(string partitionKey, string ticketId, TicketRequestModel req)
        {
            try
            {
                var ticketDbEntity = req.BuildTicketDbEntityFromRequest(partitionKey, ticketId);
                var repoResult = await _ticketRepository.Update(ticketDbEntity);

                _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;
                if (repoResult.Result == null) return null;

                return "Successfully updated";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with UpdateTicket | paritionKey: {partitionKey} | rowKey: {ticketId} | data: {JsonConvert.SerializeObject(req)}");
                return null;
            }
        }

        public async Task<string> DeleteTicket(string partitionKey, string ticketId)
        {
            try
            {
                var result = await _ticketRepository.Delete(partitionKey, ticketId);
                _httpContextAccessor.HttpContext.Response.StatusCode = (int)result.Status;
                if (result.Result == null) return null;

                return "Successfully deleted";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with DeleteTicket | paritionKey: {partitionKey} | rowKey: {ticketId} ");
                return null;
            }
        }

        public async Task<string> AddAction(string partitionKey, ActionRequest req)
        {
            try
            {
                var ActionId = Guid.NewGuid().ToString();
                var ActionDbEntity = req.BuildActionDbEntityFromRequest(partitionKey, ActionId);
                ActionDbEntity.Timestamp = DateTime.UtcNow;

                var repoResult = await _ActionRepository.Create(ActionDbEntity);
                _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;

                if (repoResult.Result == null) return null;

                return "Action added";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with AddAction | paritionKey: {partitionKey} | data: {JsonConvert.SerializeObject(req)} ");
                return null;
            }
        }

        public async Task<string> EditAction(string partitionKey, string actionId, ActionRequest req)
        {
            try
            {
                var ActionDbEntity = req.BuildActionDbEntityFromRequest(partitionKey, actionId);
                var repoResult = await _ActionRepository.Update(ActionDbEntity);

                _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;

                if (repoResult.Result == null)
                {
                    return null;
                }

                return "Update Success";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with EditAction | paritionKey: {partitionKey} | rowKey: {actionId} | data: {JsonConvert.SerializeObject(req)} ");
                return null;
            }
        }

        public async Task<int> DeleteAction(string partitionKey, string actionId)
        {
            try
            {
                var result = await _ActionRepository.Delete(partitionKey, actionId);
                _httpContextAccessor.HttpContext.Response.StatusCode = (int)result.Status;
                return result.Status;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with DeleteAction | paritionKey: {partitionKey} | rowKey: {actionId} ");
                return 500;
            }
        }

        private async Task<List<ActionResponse>> GetActionsAsync(string id)
        {
            try
            {
                var ActionsResult = await _ActionRepository.GetAll(id);
                if (ActionsResult == null || ActionsResult.Count == 0) return null;

                List<ActionResponse> actions = new List<ActionResponse>();
                foreach (var action in ActionsResult)
                {
                    actions.Add(action.BuildActionFromDbEntity());
                }
                return actions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with DeleteAction | paritionKey: {id} ");
                return null;
            }
        }
    }

    public interface ITicketService
    {
        Task<List<TicketResponseModel>> GetAll();
        Task<List<TicketResponseModel>> GetAll(string partitionKey);
        Task<List<TicketResponseModel>> FilterBy(string partitionKey, TicketFilter filterOptions);
        Task<TicketResponseModel> Get(string partitionKey, string rowKey);
        Task<TicketResponseModel> CreateTicket(string partitionKey, string rowKey, TicketRequestModel req);
        Task<string> UpdateTicket(string partitionKey, string ticketId, TicketRequestModel req);
        Task<string> DeleteTicket(string partitionKey, string ticketId);
        Task<string> AddAction(string partitionKey, ActionRequest req);
        Task<string> EditAction(string partitionKey, string actionId, ActionRequest req);
        Task<int> DeleteAction(string partitionKey, string actionId);

    }
}
