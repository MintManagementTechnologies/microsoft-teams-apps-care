using CareApi.Extensions;
using CareApi.Models;
using CareApi.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CareApi.Services
{
    public class TicketCategoryService : ITicketCategoryService
    {

        private readonly ITicketCategoryRepository _ticketCategoryRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TicketCategoryService> _logger;

        public TicketCategoryService(ITicketCategoryRepository ticketCategoryRepository, IHttpContextAccessor httpContextAccessor, ILogger<TicketCategoryService> logger)
        {
            _ticketCategoryRepository = ticketCategoryRepository ?? throw new ArgumentNullException(nameof(ticketCategoryRepository));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = logger;
        }

        public async Task<TicketCategoryResponseModel> Create(TicketCategoryRequestModel model)
        {
            try
            {
                var entity = model.BuildTicketCategoryDbEntityFromRequest();
                entity.RowKey = Guid.NewGuid().ToString();
                entity.Timestamp = DateTime.UtcNow;

                var repoResult = await _ticketCategoryRepository.Create(entity);
                if (repoResult.Result == null)
                {
                    _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;
                    return null;
                }
                var response = entity.BuildTicketCategoryModelFromDbEntity();
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with CreateTown | data: {JsonConvert.SerializeObject(model)}");
                return null;
            }
        }

        public async Task<string> Delete(string rowKey)
        {
            try
            {
                var result = await _ticketCategoryRepository.Delete(rowKey);
                _httpContextAccessor.HttpContext.Response.StatusCode = (int)result.Status;
                if (result.Result == null) return null;

                return "Successfully deleted";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with Delete TicketCategory rowKey: {rowKey} ");
                return null;
            }
        }

        public async Task<List<TicketCategoryResponseModel>> GetAll(string searchText = null)
        {
            List<TicketCategoryResponseModel> results = new List<TicketCategoryResponseModel>();

            try
            {
                var dbResults = await _ticketCategoryRepository.GetAll(searchText);
                foreach (var dbResult in dbResults)
                {
                    var item = dbResult.BuildTicketCategoryModelFromDbEntity();

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

        public async Task<TicketCategoryResponseModel> Update(TicketCategoryRequestModel model)
        {
            try
            {
                var entity = model.BuildTicketCategoryDbEntityFromRequest();
                entity.Timestamp = DateTime.UtcNow;

                var repoResult = await _ticketCategoryRepository.Update(entity);
                if (repoResult.Result == null)
                {
                    _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;
                    return null;
                }
                var response = entity.BuildTicketCategoryModelFromDbEntity();
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with Update Ticket Category | data: {JsonConvert.SerializeObject(model)}");
                return null;
            }
        }
    }

    public interface ITicketCategoryService
    {
        Task<TicketCategoryResponseModel> Create(TicketCategoryRequestModel model);
        Task<string> Delete(string rowKey);
        Task<List<TicketCategoryResponseModel>> GetAll(string searchText = null);
        Task<TicketCategoryResponseModel> Update(TicketCategoryRequestModel model);
    }

}
