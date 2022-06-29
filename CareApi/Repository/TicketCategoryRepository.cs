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
   

    public class TicketCategoryRepository : ITicketCategoryRepository
    {
        // Use a static key for the Partition Key
        private const string PartitionKey = "dbe92660-56ab-4ed7-bc11-c2aa0e9ef0e5";
        private readonly Settings _settings;
        private readonly ILogger<TicketCategoryRepository> _logger;
        private TableClient _tableClient;
        private readonly TableServiceClient _tableServiceClient;


        /// <summary>
        /// Azure Table Storage for Ticket Repository
        /// </summary>
        /// <param name="settings"></param>
        /// <param name="client"></param>
        /// <param name="logger"></param>
        public TicketCategoryRepository(Settings settings,
            TableServiceClient client,
            ILogger<TicketCategoryRepository> logger)
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

        public Task<List<TicketCategoryDbEntity>> GetAll(string searchText = default)
        {
            try
            {
                var results = new List<TicketCategoryDbEntity>();
                Pageable<TicketCategoryDbEntity> dbResults = _tableClient.Query<TicketCategoryDbEntity>();
                foreach (TicketCategoryDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                if (!string.IsNullOrEmpty(searchText))
                {
                    results = results.Where(r =>
                        r.CategoryName.ToLower().Contains(searchText.ToLower())).ToList();
                }

                return Task.FromResult(results.OrderBy(t => t.CategoryName).ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to GetAll Towns");
                return null;
            }
        }

        public async Task<TicketCategoryRepositoryResponseModel> Create(TicketCategoryDbEntity model)
        {
            try
            {
                var entity = new TableEntity(PartitionKey, model.RowKey)
                {
                    { "CategoryName", model.CategoryName }
                };

                var result = await _tableClient.AddEntityAsync(entity);

                return new TicketCategoryRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = model
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TicketCategoryRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error inserting into table[{_settings.TicketCategoryTableName}]");

                return new TicketCategoryRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<TicketCategoryRepositoryResponseModel> Update(TicketCategoryDbEntity model)
        {
            try
            {

                List<TicketCategoryDbEntity> results = new List<TicketCategoryDbEntity>();
                var result = await _tableClient.UpdateEntityAsync(model, ETag.All, TableUpdateMode.Merge);

                Pageable<TicketCategoryDbEntity> dbResults = _tableClient.Query<TicketCategoryDbEntity>(ent => ent.PartitionKey == model.PartitionKey && ent.RowKey == model.RowKey);
                foreach (TicketCategoryDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return new TicketCategoryRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = results.FirstOrDefault()
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TicketCategoryRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Update Ticket Category | {model.PartitionKey} | {model.RowKey}");

                return new TicketCategoryRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<TicketCategoryRepositoryResponseModel> Delete(string id)
        {
            try
            {
                var result = await _tableClient.DeleteEntityAsync(PartitionKey, id);
                return new TicketCategoryRepositoryResponseModel()
                {
                    Result = null,
                    Status = 200
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TicketCategoryRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Delete Ticket Category | {PartitionKey} | {id}");

                return new TicketCategoryRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }


        private void InitRepository()
        {
            _tableServiceClient.CreateTableIfNotExists(_settings.TicketCategoryTableName);
            _tableClient = _tableServiceClient.GetTableClient(_settings.TicketCategoryTableName);
        }

    }

    public class TicketCategoryRepositoryResponseModel
    {
        public int Status { get; set; }
        public TicketCategoryDbEntity Result { get; set; }
    }

    public interface ITicketCategoryRepository
    {
        Task<TicketCategoryRepositoryResponseModel> Create(TicketCategoryDbEntity model);
        Task<TicketCategoryRepositoryResponseModel> Delete(string id);
        Task<List<TicketCategoryDbEntity>> GetAll(string searchText = null);
        Task<TicketCategoryRepositoryResponseModel> Update(TicketCategoryDbEntity model);
    }

}
