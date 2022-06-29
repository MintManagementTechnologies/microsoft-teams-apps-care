using Azure;
using Azure.Data.Tables;
using System;

namespace CareApi.Models
{
    public class CaseDbEntity : ITableEntity
    {
        public string PartitionKey { get; set; }
        public string RowKey { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
        public DateTime? CreatedTimestamp { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Category { get; set; }
        public int State { get; set; }
        public string ReferenceNo { get; set; }
        public string IDNo { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string MobileNo { get; set; }
        public string AlternativeNo { get; set; }
        public string PhysicalAddress { get; set; }
        public string Town { get; set; }
        public string PostalCode { get; set; }
        public string LoggingMethod { get; set; }
        public string RequesterUPN { get; set; }
        public string AssignedToPersonUPN { get; set; }
        public string ChannelId { get; set; }
        public Azure.ETag ETag { get; set; }
    }
}
