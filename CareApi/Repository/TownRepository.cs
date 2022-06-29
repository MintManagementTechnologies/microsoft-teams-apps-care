using Azure;
using Azure.Data.Tables;
using CareApi.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CareApi.Repository
{
    public class TownRepository : ITownRepository
    {
        // Use a static key for the Partition Key
        private const string PartitionKey = "dbe92660-56ab-4ed7-bc11-c2aa0e9ef0e5";
        private readonly Settings _settings;
        private readonly ILogger<TownRepository> _logger;
        private TableClient _tableClient;
        private readonly TableServiceClient _tableServiceClient;


        /// <summary>
        /// Azure Table Storage for Ticket Repository
        /// </summary>
        /// <param name="settings"></param>
        /// <param name="client"></param>
        /// <param name="logger"></param>
        public TownRepository(Settings settings,
            TableServiceClient client,
            ILogger<TownRepository> logger)
        {
            _settings = settings;
            _logger = logger;

            try
            {
                _tableServiceClient = client;
                InitRepository();
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex, "Unable to initialize Ticket Repository");
            }
        }

        public Task<List<TownDbEntity>> GetAll(string searchText = default)
        {
            try
            {
                var results = new List<TownDbEntity>();
                Pageable<TownDbEntity> dbResults = _tableClient.Query<TownDbEntity>();
                foreach (TownDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                if (!string.IsNullOrEmpty(searchText))
                {
                    results = results.Where(r =>
                        r.TownName.ToLower().Contains(searchText.ToLower()) ||
                        r.PostalCode.ToLower().Contains(searchText.ToLower())).ToList();
                }

                return Task.FromResult(results.OrderBy(t => t.TownName).ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to GetAll Towns");
                return null;
            }
        }

        public async Task<TownRepositoryResponseModel> Create(TownDbEntity town)
        {
            try
            {
                var entity = new TableEntity(PartitionKey, town.RowKey)
                {
                    { "TownName", town.TownName },
                    { "PostalCode", town.PostalCode },
                };

                var result = await _tableClient.AddEntityAsync(entity);
                
                return new TownRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = town
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TownRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error inserting into table[{_settings.TownTableName}]");

                return new TownRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<TownRepositoryResponseModel> Update(TownDbEntity town)
        {
            try
            {

                List<TownDbEntity> results = new List<TownDbEntity>();
                var result = await _tableClient.UpdateEntityAsync(town, ETag.All, TableUpdateMode.Merge);

                Pageable<TownDbEntity> dbResults = _tableClient.Query<TownDbEntity>(ent => ent.PartitionKey == town.PartitionKey && ent.RowKey == town.RowKey);
                foreach (TownDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return new TownRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = results.FirstOrDefault()
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TownRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Update Ticket | {town.PartitionKey} | {town.RowKey}");

                return new TownRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<TownRepositoryResponseModel> Delete(string id)
        {
            try
            {
                var result = await _tableClient.DeleteEntityAsync(PartitionKey, id);
                return new TownRepositoryResponseModel()
                {
                    Result = null,
                    Status = 200
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TownRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Delete Town | {PartitionKey} | {id}");

                return new TownRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }


        private void InitRepository()
        {
            _tableServiceClient.CreateTableIfNotExists(_settings.TownTableName);
            _tableClient = _tableServiceClient.GetTableClient(_settings.TownTableName);
        }

    }

    public class TownRepositoryResponseModel
    {
        public int Status { get; set; }
        public TownDbEntity Result { get; set; }
    }

    public interface ITownRepository
    {
        Task<TownRepositoryResponseModel> Create(TownDbEntity town);
        Task<TownRepositoryResponseModel> Delete(string dd);
        Task<List<TownDbEntity>> GetAll(string searchText = null);
        Task<TownRepositoryResponseModel> Update(TownDbEntity town);
    }
}
