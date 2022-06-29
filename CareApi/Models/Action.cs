using System;
using CareApi.Enums;

namespace CareApi.Models
{
    public class ActionRequest
    {
        public string CreatedByUPN { get; set; }
        public string Message { get; set; }
        public string ReferredTo { get; set; }
        public State State { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }

    public class ActionResponse 
    {
        public string Id { get; set; }
        public string CreatedByUPN { get; set; }
        public string Message { get; set; }
        public string ReferredTo { get; set; }
        public State State { get; set; }
        public DateTimeOffset? Timestamp { get; set; }
    }
}
