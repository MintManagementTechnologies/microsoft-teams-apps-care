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
    public class TownService : ITownService
    {

        private readonly ITownRepository _townRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TownService> _logger;

        public TownService(ITownRepository townRepository, IHttpContextAccessor httpContextAccessor, ILogger<TownService> logger)
        {
            _townRepository = townRepository ?? throw new ArgumentNullException(nameof(townRepository));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor)); 
            _logger = logger;
        }

        public async Task<TownResponseModel> Create(TownRequestModel town)
        {
            try
            {
                var townDbEntity = town.BuildTownDbEntityFromRequest();
                townDbEntity.RowKey = Guid.NewGuid().ToString();
                townDbEntity.Timestamp = DateTime.UtcNow;

                var repoResult = await _townRepository.Create(townDbEntity);
                if (repoResult.Result == null)
                {
                    _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;
                    return null;
                }
                var response = townDbEntity.BuildTownModelFromDbEntity();
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with CreateTown | data: {JsonConvert.SerializeObject(town)}");
                return null;
            }
        }

        public async Task<string> Delete(string rowKey)
        {
            try
            {
                var result = await _townRepository.Delete(rowKey);
                _httpContextAccessor.HttpContext.Response.StatusCode = (int)result.Status;
                if (result.Result == null) return null;

                return "Successfully deleted";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with DeleteTown rowKey: {rowKey} ");
                return null;
            }
        }

        public async Task<List<TownResponseModel>> GetAll(string searchText = null)
        {
            List<TownResponseModel> results = new List<TownResponseModel>();

            try
            {
                var dbResults = await _townRepository.GetAll(searchText);
                foreach (var dbResult in dbResults)
                {
                    var item = dbResult.BuildTownModelFromDbEntity();

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

        public async Task<TownResponseModel> Update(TownRequestModel town)
        {
            try
            {
                var townDbEntity = town.BuildTownDbEntityFromRequest();
                townDbEntity.Timestamp = DateTime.UtcNow;

                var repoResult = await _townRepository.Update(townDbEntity);
                if (repoResult.Result == null)
                {
                    _httpContextAccessor.HttpContext.Response.StatusCode = (int)repoResult.Status;
                    return null;
                }
                var response = townDbEntity.BuildTownModelFromDbEntity();
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occured with UpdateTown | data: {JsonConvert.SerializeObject(town)}");
                return null;
            }
        }
    }

    public interface ITownService
    {

        Task<TownResponseModel> Create(TownRequestModel town);

        Task<string> Delete(string rowKey);

        Task<List<TownResponseModel>> GetAll(string searchText = null);

        Task<TownResponseModel> Update(TownRequestModel town);

    }
}
