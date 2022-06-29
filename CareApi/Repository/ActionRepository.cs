using Azure;
using Azure.Data.Tables;
using Azure.Data.Tables.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CareApi.Models;

namespace CareApi.Repository
{
    public class ActionRepository : IActionRepository
    {
        private readonly Settings _settings;
        private readonly ILogger<ActionRepository> _logger;
        private TableClient _tableClient;
        private readonly TableServiceClient _tableServiceClient;

        /// <summary>
        /// Azure table storage for Actions
        /// </summary>
        /// <param name="settings"></param>
        /// <param name="client"></param>
        /// <param name="logger"></param>
        public ActionRepository(Settings settings,
            TableServiceClient client,
            ILogger<ActionRepository> logger)
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
                _logger.LogCritical(ex, "Unable to initialize Comment Repository");
            }
        }

        public async Task<List<ActionDbEntity>> GetAll(string partitionKey)
        {
            try
            {
                List<ActionDbEntity> results = new List<ActionDbEntity>();

                Pageable<ActionDbEntity> dbResults = _tableClient.Query<ActionDbEntity>(ent => ent.PartitionKey == partitionKey);
                foreach (ActionDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to GetAll Actions for {partitionKey}");
                return null;
            }
        }

        public async Task<ActionRepositoryResponseModel> Create(ActionDbEntity action)
        {
            try
            {
                var entity = new TableEntity(action.PartitionKey, action.RowKey)
                {
                    { "CreatedByUPN", action.CreatedByUPN },
                    { "Message", action.Message },
                    { "State", action.State },
                    { "ReferredTo", action.ReferredTo }
                };

                var result = await _tableClient.AddEntityAsync(entity);

                return new ActionRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = action
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new ActionRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error inserting into table[{_settings.TicketTableName}]");

                return new ActionRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }
        public async Task<ActionRepositoryResponseModel> Update(ActionDbEntity action)
        {
            try
            {
                var result = await _tableClient.UpdateEntityAsync(action, ETag.All, TableUpdateMode.Merge);
                return new ActionRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = action
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);
                return new ActionRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Update Ticket | {action.PartitionKey} | {action.RowKey}");

                return new ActionRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<ActionRepositoryResponseModel> Delete(string partitionKey, string rowKey)
        {
            try
            {
                var result = await _tableClient.DeleteEntityAsync(partitionKey, rowKey);
                return new ActionRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = null
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);
                return new ActionRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Delete Action | {partitionKey} | {rowKey}");

                return new ActionRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        private void InitRepository()
        {
            //_tableServiceClient.CreateIfNotExists();
            _tableServiceClient.CreateTableIfNotExists(_settings.ActionsTableName);
            _tableClient = _tableServiceClient.GetTableClient(_settings.ActionsTableName);
        }
    }

    public class ActionRepositoryResponseModel
    {
        public int Status { get; set; }
        public ActionDbEntity Result { get; set; }
    }

    public interface IActionRepository
    {
        Task<List<ActionDbEntity>> GetAll(string partitionKey);
        Task<ActionRepositoryResponseModel> Create(ActionDbEntity ticket);
        Task<ActionRepositoryResponseModel> Update(ActionDbEntity ticket);
        Task<ActionRepositoryResponseModel> Delete(string partitionKey, string rowKey);
    }
}
