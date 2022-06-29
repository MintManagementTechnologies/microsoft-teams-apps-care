using Azure;
using Azure.Data.Tables;
using System;

namespace CareApi.Models
{
    public class ActionDbEntity : ITableEntity
    {
        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public string CreatedByUPN { get; set; }
        public string Message { get; set; }
        public int State { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
        public string ReferredTo { get; set; }
    }
}
