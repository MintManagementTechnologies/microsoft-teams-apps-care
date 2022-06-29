
using Azure;
using Azure.Data.Tables;
using System;

namespace CareApi.Models
{
    public class ConversationDbEntity : ITableEntity
    {
        public string PartitionKey { get; set; } //bot identifier
        public string RowKey { get; set; } //user identifier
        public string ConversationId { get; set; } // conversation identifier
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
    }
}
