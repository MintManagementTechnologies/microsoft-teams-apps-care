using Azure.Data.Tables;
using Azure.Data.Tables.Models;
using Microsoft.Extensions.Logging;
using System;
using CareApi.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using Azure;
using System.Linq;
using System.Linq.Expressions;

namespace CareApi.Repository
{
    public class CaseRepository : ICaseRepository
    {
        private readonly Settings _settings;
        private readonly ILogger<CaseRepository> _logger;
        private readonly TableServiceClient _tableServiceClient;

        /// <summary>
        /// Azure Table Storage for Customer Care Case Repository
        /// </summary>
        /// <param name="settings"></param>
        /// <param name="client"></param>
        /// <param name="logger"></param>
        private TableClient _tableClient;
        public CaseRepository(Settings settings,
            TableServiceClient client,
            ILogger<CaseRepository> logger)
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
                _logger.LogCritical(ex, "Unable to initialize Case Repository");
            }
        }

        public async Task<List<CaseDbEntity>> GetCustomer(string customerId)
        {
            List<CaseDbEntity> results = new List<CaseDbEntity>();
            try
            {

                Pageable<CaseDbEntity> dbResults = _tableClient.Query<CaseDbEntity>(x => x.IDNo == customerId);
                foreach (CaseDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                return results;
            }
            catch (Exception ex)
            {
                return results;
            }
        }

        public async Task<List<CaseDbEntity>> GetAll()
        {
            List<CaseDbEntity> results = new List<CaseDbEntity>();

            try
            {
                Pageable<CaseDbEntity> dbResults = _tableClient.Query<CaseDbEntity>();
                foreach (CaseDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                return results;
            }
            catch (Exception ex)
            {
                return results;
            }
        }

        public async Task<List<CaseDbEntity>> GetAll(string partitionKey)
        {
            List<CaseDbEntity> results = new List<CaseDbEntity>();
            try
            {
                Pageable<CaseDbEntity> dbResults = _tableClient.Query<CaseDbEntity>(ent => ent.PartitionKey == partitionKey);
                foreach (CaseDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to GetAll Cases");
                return results;
            }
        }

        public async Task<CaseDbEntity> Get(string partitionKey, string rowKey)
        {
            List<CaseDbEntity> results = new List<CaseDbEntity>();
            try
            {
                Pageable<CaseDbEntity> dbResults = _tableClient.Query<CaseDbEntity>(ent => ent.PartitionKey == partitionKey && ent.RowKey == rowKey);
                foreach (CaseDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return results.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Get Case Details {partitionKey} {rowKey}");
                return results.FirstOrDefault();
            }
        }


        public async Task<List<CaseDbEntity>> FilterBy(string partitionKey, CaseFilter filterOptions)
        {
            List<CaseDbEntity> results = new List<CaseDbEntity>();
            try
            {
                string querystring = string.Empty;
                querystring = $"PartitionKey eq '{partitionKey}' ";
                if (filterOptions.From != null)
                {
                    querystring += $"and CreatedTimestamp ge datetime'{filterOptions.From.Value.ToUniversalTime().ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fff'Z'")}' ";
                }

                if (filterOptions.To != null)
                {
                    querystring += $"and CreatedTimestamp le datetime'{filterOptions.To.Value.ToUniversalTime().ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'fff'Z'")}' ";
                }

                if (filterOptions.Status != null)
                {
                    querystring += $"and State eq {filterOptions.Status} ";
                }

                if (!string.IsNullOrEmpty(filterOptions.ChannelId))
                {
                    querystring += $"and ChannelId eq '{filterOptions.ChannelId}' ";
                }

                if (filterOptions.Category != null)
                {
                    querystring += $"and Category eq {filterOptions.Category} ";
                }


                Pageable<CaseDbEntity> testResults = _tableClient.Query<CaseDbEntity>(querystring);
                foreach (CaseDbEntity e in testResults)
                {
                    results.Add(e);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occured with FilterBy Cases");
                return results;
            }
        }

        public async Task<CaseRepositoryResponseModel> Create(CaseDbEntity req)
        {
            try
            {
                var entity = new TableEntity(req.PartitionKey, req.RowKey)
                {
                    { "CreatedTimestamp", req.CreatedTimestamp },
                    { "Title", req.Title },
                    { "Description", req.Description },
                    { "Category", req.Category },
                    { "State", req.State },
                    { "ReferenceNo", req.ReferenceNo },
                    { "IDNo", req.IDNo },
                    { "Name", req.Name },
                    { "Surname", req.Surname },
                    { "MobileNo", req.MobileNo },
                    { "AlternativeNo", req.AlternativeNo },
                    { "PhysicalAddress", req.PhysicalAddress },
                    { "Town", req.Town },
                    { "PostalCode", req.PostalCode },
                    { "LoggingMethod", req.LoggingMethod },
                    { "RequesterUPN", req.RequesterUPN },
                    { "AssignedToPersonUPN", req.AssignedToPersonUPN },
                    { "ChannelId", req.ChannelId }
                };

                var result = await _tableClient.AddEntityAsync(entity);

                return new CaseRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = req
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new CaseRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error inserting into table[{_settings.TicketTableName}]");

                return new CaseRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<CaseRepositoryResponseModel> Update(CaseDbEntity req)
        {
            try
            {
                List<CaseDbEntity> results = new List<CaseDbEntity>();
                var result = await _tableClient.UpdateEntityAsync(req, ETag.All, TableUpdateMode.Merge);

                Pageable<CaseDbEntity> dbResults = _tableClient.Query<CaseDbEntity>(ent => ent.PartitionKey == req.PartitionKey && ent.RowKey == req.RowKey);
                foreach (CaseDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return new CaseRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = results.FirstOrDefault()
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new CaseRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Update Case | {req.PartitionKey} | {req.RowKey}");

                return new CaseRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<CaseRepositoryResponseModel> Delete(string partitionKey, string rowKey)
        {
            try
            {
                var result = await _tableClient.DeleteEntityAsync(partitionKey, rowKey);
                return new CaseRepositoryResponseModel()
                {
                    Result = null,
                    Status = 200
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new CaseRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Delete Case | {partitionKey} | {rowKey}");

                return new CaseRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }
        private void InitRepository()
        {
            _tableServiceClient.CreateTableIfNotExists(_settings.CaseTableName);
            _tableClient = _tableServiceClient.GetTableClient(_settings.CaseTableName);
        }
    }

    public class CaseRepositoryResponseModel
    {
        public int Status { get; set; }
        public CaseDbEntity Result { get; set; }
    }

    public interface ICaseRepository
    {
        Task<List<CaseDbEntity>> GetCustomer(string customerId);
        Task<List<CaseDbEntity>> GetAll();
        Task<List<CaseDbEntity>> GetAll(string partitionKey);
        Task<List<CaseDbEntity>> FilterBy(string partitionKey, CaseFilter filterOptions);
        Task<CaseDbEntity> Get(string partitionKey, string rowKey);
        Task<CaseRepositoryResponseModel> Create(CaseDbEntity req);
        Task<CaseRepositoryResponseModel> Update(CaseDbEntity req);
        Task<CaseRepositoryResponseModel> Delete(string partitionKey, string rowKey);
    }
}
