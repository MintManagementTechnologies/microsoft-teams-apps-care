using System;
using System.Collections.Generic;
using CareApi.Enums;

namespace CareApi.Models
{
    public class TicketRequestModel 
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public State State { get; set; }
        public string ReferenceNo { get; set; }
        public string RequesterUPN { get; set; }
        public string AssignedToUPN { get; set; }
        public Priority Priority { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTimeOffset? LastUpdate { get; set; }
        public bool IsVisible { get; set; }
    }

    

    public class TicketResponseModel 
    {
        public string GroupId { get; set; }
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public State State { get; set; }
        public string ReferenceNo { get; set; }
        public string RequesterUPN { get; set; }
        public string AssignedToUPN { get; set; }
        public List<string> Attachments { get; set; }
        public Priority Priority { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTimeOffset? LastUpdate { get; set; }
        public bool IsVisible { get; set; }
        public List<ActionResponse> Updates { get; set; }
    }
}
