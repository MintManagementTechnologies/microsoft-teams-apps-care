using System;

namespace CareApi.Models
{
    public class CaseFilter
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int? Category { get; set; }
        public int? Status { get; set; }
        public string ChannelId { get; set; } = string.Empty;
    }
}
