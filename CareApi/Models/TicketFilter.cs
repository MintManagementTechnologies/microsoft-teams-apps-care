using System;

namespace CareApi.Models
{
    public class TicketFilter
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public string Category { get; set; }
        public int? Status { get; set; }
    }
}
