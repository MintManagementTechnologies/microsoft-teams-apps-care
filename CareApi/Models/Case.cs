using CareApi.Enums;
using System;
using System.Collections.Generic;

namespace CareApi.Models
{
    public class CaseRequestModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public CaseCategory Category { get; set; }
        public State State { get; set; }
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
        public string AssignToPersonUPN { get; set; }
        public string RequesterUPN { get; set; }
        public string ChannelId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTimeOffset? LastUpdate { get; set; }

    }

    public class CaseResponseModel 
    {
        public string GroupId { get; set; }
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public CaseCategory Category { get; set; }
        public State State { get; set; }
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
        public string AssignToPersonUPN { get; set; }
        public string RequesterUPN { get; set; }
        public string ChannelId { get; set; }
        public List<string> Attachments { get; set; }
        public List<ActionResponse> Updates { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTimeOffset? LastUpdate { get; set; }
    }

}
