using Azure;
using Azure.Data.Tables;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CareApi.Models;
using System.Linq.Expressions;

namespace CareApi.Repository
{
    public class TicketRepository : ITicketRepository
    {
        private readonly Settings _settings;
        private readonly ILogger<TicketRepository> _logger;
        private TableClient _tableClient;
        private readonly TableServiceClient _tableServiceClient;

        /// <summary>
        /// Azure Table Storage for Ticket Repository
        /// </summary>
        /// <param name="settings"></param>
        /// <param name="client"></param>
        /// <param name="logger"></param>
        public TicketRepository(Settings settings,
            TableServiceClient client,
            ILogger<TicketRepository> logger)
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

        public async Task<List<TicketDbEntity>> GetAll()
        {
            try
            {
                List<TicketDbEntity> results = new List<TicketDbEntity>();

                Pageable<TicketDbEntity> dbResults = _tableClient.Query<TicketDbEntity>();
                foreach (TicketDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to GetAll Cases");
                return null;
            }
        }

        public async Task<List<TicketDbEntity>> GetAll(string partitionKey)
        {
            try
            {
                List<TicketDbEntity> results = new List<TicketDbEntity>();

                Pageable<TicketDbEntity> dbResults = _tableClient.Query<TicketDbEntity>(ent => ent.PartitionKey == partitionKey);
                foreach (TicketDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to GetAll Tickets");
                return null;
            }
        }

        public async Task<List<TicketDbEntity>> FilterBy(string partitionKey, TicketFilter filterOptions)
        {
            try
            {
                List<TicketDbEntity> results = new List<TicketDbEntity>();

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

                if (!string.IsNullOrEmpty(filterOptions.Category))
                {
                    querystring += $"and Category eq {filterOptions.Category} ";
                }

                Pageable<TicketDbEntity> dbResults = _tableClient.Query<TicketDbEntity>(querystring);
                foreach (TicketDbEntity e in dbResults)
                {
                    results.Add(e);
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to GetAll Tickets");
                return null;
            }
        }

        public async Task<TicketDbEntity> Get(string partitionKey, string rowKey)
        {
            try
            {
                List<TicketDbEntity> results = new List<TicketDbEntity>();

                Pageable<TicketDbEntity> dbResults = _tableClient.Query<TicketDbEntity>(ent => ent.PartitionKey == partitionKey && ent.RowKey == rowKey);
                foreach (TicketDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return results.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unable to Get Ticket");
                return null;
            }
        }

        public async Task<TicketRepositoryResponseModel> Create(TicketDbEntity ticket)
        {
            try
            {
                var entity = new TableEntity(ticket.PartitionKey, ticket.RowKey)
                {
                    { "CreatedTimestamp", ticket.CreatedTimestamp },
                    { "Title", ticket.Title },
                    { "Description", ticket.Description },
                    { "Category", ticket.Category },
                    { "ReferenceNo", ticket.ReferenceNo },
                    { "RequesterUPN", ticket.RequesterUPN },
                    { "TechnitionUPN", ticket.TechnitionUPN },
                   // { "Attachments", ticket.Attachments },
                    { "State", ticket.State },
                    { "Priority", ticket.Priority },
                    { "PriorityVisible", ticket.PriorityVisible }
                };

                var result = await _tableClient.AddEntityAsync(entity);

                return new TicketRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = ticket
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TicketRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error inserting into table[{_settings.TicketTableName}]");

                return new TicketRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<TicketRepositoryResponseModel> Update(TicketDbEntity ticket)
        {
            try
            {
                List<TicketDbEntity> results = new List<TicketDbEntity>();
                var result = await _tableClient.UpdateEntityAsync(ticket, ETag.All, TableUpdateMode.Merge);

                Pageable<TicketDbEntity> dbResults = _tableClient.Query<TicketDbEntity>(ent => ent.PartitionKey == ticket.PartitionKey && ent.RowKey == ticket.RowKey);
                foreach (TicketDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return new TicketRepositoryResponseModel()
                {
                    Status = result.Status,
                    Result = results.FirstOrDefault()
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TicketRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Update Ticket | {ticket.PartitionKey} | {ticket.RowKey}");

                return new TicketRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        public async Task<TicketRepositoryResponseModel> Delete(string partitionKey, string rowKey)
        {
            try
            {
                var result = await _tableClient.DeleteEntityAsync(partitionKey, rowKey);
                return new TicketRepositoryResponseModel()
                {
                    Result = null,
                    Status = 200
                };
            }
            catch (Azure.RequestFailedException ax)
            {
                _logger.LogError(ax, ax.Message);

                return new TicketRepositoryResponseModel()
                {
                    Status = ax.Status,
                    Result = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Delete Ticket | {partitionKey} | {rowKey}");

                return new TicketRepositoryResponseModel()
                {
                    Status = 500,
                    Result = null
                };
            }
        }

        private void InitRepository()
        {
            _tableServiceClient.CreateTableIfNotExists(_settings.TicketTableName);
            _tableClient = _tableServiceClient.GetTableClient(_settings.TicketTableName);
        }

        public async Task<List<TicketDbEntity>> GetByReferenceNo(string referenceNo)
        {
            try
            {
                List<TicketDbEntity> results = new List<TicketDbEntity>();

                Pageable<TicketDbEntity> dbResults = _tableClient.Query<TicketDbEntity>(ent => ent.ReferenceNo == referenceNo);
                foreach (TicketDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Get Ticket by ReferenceNo {referenceNo}");
                return null;
            }
        }

        public async Task<List<TicketDbEntity>> GetByTitle(string title)
        {
            try
            {
                List<TicketDbEntity> results = new List<TicketDbEntity>();

                Pageable<TicketDbEntity> dbResults = _tableClient.Query<TicketDbEntity>(ent => ent.Title == title);
                foreach (TicketDbEntity e in dbResults)
                {
                    results.Add(e);
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unable to Get Ticket by title {title}");
                return null;
            }
        }
    }

    public class TicketRepositoryResponseModel
    {
        public int Status { get; set; }
        public TicketDbEntity Result { get; set; }
    }

    public interface ITicketRepository
    {
        Task<List<TicketDbEntity>> GetAll();
        Task<List<TicketDbEntity>> GetAll(string partitionKey);
        Task<List<TicketDbEntity>> GetByReferenceNo(string referenceNo);
        Task<List<TicketDbEntity>> GetByTitle(string title);
        Task<List<TicketDbEntity>> FilterBy(string partitionKey, TicketFilter filterOptions);
        Task<TicketDbEntity> Get(string partitionKey, string rowKey);
        Task<TicketRepositoryResponseModel> Create(TicketDbEntity ticket);
        Task<TicketRepositoryResponseModel> Update(TicketDbEntity ticket);
        Task<TicketRepositoryResponseModel> Delete(string partitionKey, string rowKey);
    }
}
