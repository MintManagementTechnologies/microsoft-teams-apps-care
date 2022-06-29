using Microsoft.Extensions.Logging;
using CareApi.Repository;
using System.Threading.Tasks;
using System.Collections.Generic;
using CareApi.Models;
using CareApi.Extensions;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Linq;
using System;
using Newtonsoft.Json;

namespace CareApi.Services
{
    public class CaseService : ICaseService
    {
        private readonly ILogger<CaseService> _logger;
        private readonly ICaseRepository _caseRepository;
        private readonly IFileRepository _fileRepository;
        private readonly IActionRepository _ActionRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        /// <summary>
        /// Customer Care Case service
        /// </summary>
        /// <param name="caseRepository"></param>
        /// <param name="ActionRepository"></param>
        /// <param name="fileRepository"></param>
        /// <param name="httpContextAccessor"></param>
        /// <param name="logger"></param>
        public CaseService(ICaseRepository caseRepository,
            IActionRepository ActionRepository,
            IFileRepository fileRepository,
            IHttpContextAccessor httpContextAccessor,
            ILogger<CaseService> logger)
        {
            _caseRepository = caseRepository;
            _fileRepository = fileRepository;
            _ActionRepository = ActionRepository;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<Customer> GetCustomer(string customerId)
        {
            try
            {
                List<CaseResponseModel> results = new List<CaseResponseModel>();
                var dbResults = await _caseRepository.GetCustomer(customerId);
                if (dbResults.Count > 0)
                {
                    foreach (var dbResult in dbResults)
                    {
                        var item = dbResult.BuildCaseResponseModelFromDbEntity();
                        results.Add(item);
                    }
                }

                if (results.Count > 0)
                {
                    var orderedResults = results.OrderByDescending(x => x.CreatedAt);
                    if (orderedResults == null) return null;
                    var latestItem = orderedResults.FirstOrDefault();
                    return new Customer()
                    {
                        IdNo = latestItem.IDNo,
                        Name = latestItem.Name,
                        Surname = latestItem.Surname,
                        AlternativeNo = latestItem.AlternativeNo,
                        MobileNo = latestItem.MobileNo,
                        PhysicalAddress = latestItem.PhysicalAddress,
                        PostalCode = latestItem.PostalCode,
                        Town = latestItem.Town
                    };
                }
                else
                {
                    _httpContextAccessor.HttpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occured with GetCustomer");
                return null;
            }
        }

        public async Task<List<CaseResponseModel>> GetAll()
        {
            List<CaseResponseModel> results = new List<CaseResponseModel>();
            try
            {
                var dbResults = await _caseRepository.GetAll();
                foreach (var dbResult in dbResults)
                {
                    var item = dbResult.BuildCaseResponseModelFromDbEntity();
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

        public async Task<List<CaseResponseModel>> GetAll(string partitionKey)
        {
            List<CaseResponseModel> results = new List<CaseResponseModel>();
            try
            {
                var dbResults = await _caseRepository.GetAll(partitionKey);
                foreach (var dbResult in dbResults)
                {
                    var item = dbResult.BuildCaseResponseModelFromDbEntity();

                    results.Add(item);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with GetAll for {partitionKey}");
                return results;
            }
        }

        public async Task<CaseResponseModel> Get(string partitionKey, string rowKey)
        {
            try
            {
                List<string> cleanAttachments = new List<string>();
                var dbResult = await _caseRepository.Get(partitionKey, rowKey);
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

                var results = dbResult.BuildCaseResponseModelFromDbEntity(cleanAttachments);
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
                _logger.LogError(ex, $"An error occured with Get | partitionKey: {partitionKey} | rowKey: {rowKey}");
                return null;
            }
        }

        public async Task<List<CaseResponseModel>> FilterBy(string partitionKey, CaseFilter filterOptions)
        {
            List<CaseResponseModel> results = new List<CaseResponseModel>();

            try
            {
                var dbResults = await _caseRepository.FilterBy(partitionKey, filterOptions);
                if (dbResults == null) return null;
                foreach (var dbResult in dbResults)
                {
                    var item = dbResult.BuildCaseResponseModelFromDbEntity();
                    results.Add(item);
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with FilterBy | partitionKey: {partitionKey} | filterOptions: {JsonConvert.SerializeObject(filterOptions)}");
                return results;
            }
        }

        public async Task<CaseResponseModel> CreateCase(string partitionKey, string rowKey, CaseRequestModel req)
        {
            try
            {
                var time = DateTime.UtcNow;
                if (string.IsNullOrEmpty(req.ReferenceNo))
                    req.ReferenceNo = $"REF-{Guid.NewGuid().ToString().Replace("-", "")}".ToUpper();

                var ticketId = rowKey;
                var dbEntity = req.BuildCaseDbEntityFromRequest(partitionKey, ticketId);

                dbEntity.CreatedTimestamp = time;
                dbEntity.Timestamp = time;

                var repoResult = await _caseRepository.Create(dbEntity);
                if (repoResult.Result == null)
                {
                    _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;
                    return null;
                }
                var response = dbEntity.BuildCaseResponseModelFromDbEntity();
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with CreateCase | partitionKey: {partitionKey} | rowKey: {rowKey} | data: {JsonConvert.SerializeObject(req)}");
                return null;
            }
        }

        public async Task<string> UpdateCase(string partitionKey, string ticketId, CaseRequestModel req)
        {
            try
            {
                var dbEntity = req.BuildCaseDbEntityFromRequest(partitionKey, ticketId);
                var repoResult = await _caseRepository.Update(dbEntity);

                _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;
                if (repoResult.Result == null) return null;

                return "Successfully updated";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with UpdateCase | partitionKey: {partitionKey} | rowKey: {ticketId} | data: {JsonConvert.SerializeObject(req)}");
                return null;
            }
        }
        public async Task<string> DeleteCase(string partitionKey, string ticketId)
        {
            try
            {
                var result = await _caseRepository.Delete(partitionKey, ticketId);
                _httpContextAccessor.HttpContext.Response.StatusCode = (int)result.Status;
                if (result.Result == null) return null;

                return "Successfully deleted";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with DeleteCase | partitionKey: {partitionKey} | rowKey: {ticketId}");
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
                _logger.LogError(ex, $"An error occured with AddAction | partitionKey: {partitionKey} | data: {JsonConvert.SerializeObject(req)}");
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
                _logger.LogError(ex, $"An error occured with EditAction | partitionKey: {partitionKey} | rowKey: {actionId} | data: {JsonConvert.SerializeObject(req)}");
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
                _logger.LogError(ex, $"An error occured with DeleteAction | partitionKey: {partitionKey} | rowKey: {actionId}");
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
                _logger.LogError(ex, $"An error occured with GetActionsAsync | partitionKey: {id}");
                return null;
            }
        }
    }

    public interface ICaseService
    {
        Task<Customer> GetCustomer(string customerId);
        Task<List<CaseResponseModel>> GetAll();
        Task<List<CaseResponseModel>> GetAll(string partitionKey);
        Task<List<CaseResponseModel>> FilterBy(string partitionKey, CaseFilter filterOptions);
        Task<CaseResponseModel> Get(string partitionKey, string rowKey);
        Task<CaseResponseModel> CreateCase(string partitionKey, string rowKey, CaseRequestModel req);
        Task<string> UpdateCase(string partitionKey, string ticketId, CaseRequestModel req);
        Task<string> DeleteCase(string partitionKey, string ticketId);
        Task<string> AddAction(string partitionKey, ActionRequest req);
        Task<string> EditAction(string partitionKey, string actionId, ActionRequest req);
        Task<int> DeleteAction(string partitionKey, string actionId);
    }
}
