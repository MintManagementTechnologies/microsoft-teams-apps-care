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
    public class ConversationRepository : IConversationRepository
    {
        private readonly Settings _settings;
        private readonly ILogger<ConversationRepository> _logger;
        private readonly TableServiceClient _tableServiceClient;
        private TableClient _tableClient;

        /// <summary>
        /// Azure Table storage for Conversation References
        /// </summary>
        /// <param name="settings"></param>
        /// <param name="client"></param>
        /// <param name="logger"></param>
        public ConversationRepository(Settings settings,
            TableServiceClient client,
            ILogger<ConversationRepository> logger)
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
                _logger.LogCritical(ex, "Unable to initialize Conversation Repository");
            }
        }

        public async Task Create(ConversationDbEntity req)
        {
            try
            {
                var entity = new TableEntity(req.PartitionKey, req.RowKey)
                {
                    { "ConversationId", req.ConversationId }
                };

                var result = await _tableClient.AddEntityAsync(entity);
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error inserting into table[{_settings.TicketTableName}]");
            }
        }

        public async Task Update(ConversationDbEntity req)
        {
            try
            {
                var result = await _tableClient.UpdateEntityAsync(req, ETag.All, TableUpdateMode.Merge);
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Update Conversation | {req.PartitionKey} | {req.RowKey}");
            }
        }

        public async Task<ConversationDbEntity> Get(string partitionKey, string rowKey)
        {
            try
            {
                List<ConversationDbEntity> results = new List<ConversationDbEntity>();

                Pageable<ConversationDbEntity> dbResults = _tableClient.Query<ConversationDbEntity>(ent => ent.PartitionKey == partitionKey && ent.RowKey == rowKey);
                foreach (ConversationDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return results.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Get Conversation Details {partitionKey} {rowKey}");
                return null;
            }
        }

        public async Task<ConversationDbEntity> Get(string rowKey)
        {
            try
            {
                List<ConversationDbEntity> results = new List<ConversationDbEntity>();

                Pageable<ConversationDbEntity> dbResults = _tableClient.Query<ConversationDbEntity>(ent =>  ent.RowKey == rowKey);
                foreach (ConversationDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return results.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Get Conversation Details {rowKey}");
                return null;
            }
        }

        private void InitRepository()
        {
            _tableServiceClient.CreateTableIfNotExists(_settings.ConversationTableName);
            _tableClient = _tableServiceClient.GetTableClient(_settings.ConversationTableName);
        }
    }

    public interface IConversationRepository
    {
        Task Create(ConversationDbEntity req);
        Task Update(ConversationDbEntity req);
        Task<ConversationDbEntity> Get(string partitionKey, string rowKey);
        Task<ConversationDbEntity> Get(string rowKey);
    }
}
