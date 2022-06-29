using Azure;
using Azure.Data.Tables;
using System;

namespace CareApi.Models
{
    public class TicketDbEntity : ITableEntity
    {
        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public DateTime? CreatedTimestamp { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ReferenceNo { get; set; }
        public string RequesterUPN { get; set; }
        public string TechnitionUPN { get; set; }
        // public string Attachments { get; set; }
        public int State { get; set; }
        public int Priority { get; set; }
        public bool PriorityVisible { get; set; }
        public Azure.ETag ETag { get; set; }
    }
}
