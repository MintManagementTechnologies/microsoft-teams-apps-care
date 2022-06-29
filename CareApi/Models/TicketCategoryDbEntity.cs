using Azure;
using Azure.Data.Tables;
using System;

namespace CareApi.Models
{
    public class TicketCategoryDbEntity : ITableEntity
    {

        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public string CategoryName { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

    }
}
