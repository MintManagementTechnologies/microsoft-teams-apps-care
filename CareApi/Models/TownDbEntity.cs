using Azure;
using Azure.Data.Tables;
using System;

namespace CareApi.Models
{
    public class TownDbEntity : ITableEntity
    {
        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public string TownName { get; set; }
        public string PostalCode { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
    }
}
