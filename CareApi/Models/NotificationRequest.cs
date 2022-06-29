using System.Collections.Generic;

namespace CareApi.Models
{
    public class NotificationRequest
    {
        public string title { get; set; }
        public string subject { get; set; }
        public string subtitle { get; set; }
        public string footer { get; set; }
        public NotificationAction[] actions { get; set; }
        public Dictionary<string, string> facts { get; set; }
        public string[] users { get; set; }
        public string[] channels { get; set; }
    }

    public class NotificationAction
    {
        public string text { get; set; }
        public string url { get; set; }
    }

    public class NotificationRequestJson
    {
        public string[] users { get; set; }
        public string[] channels { get; set; }
        public string adaptivecardjson { get; set; }

    }

}
