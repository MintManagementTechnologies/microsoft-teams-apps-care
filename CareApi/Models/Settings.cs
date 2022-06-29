using System.Collections.Generic;

namespace CareApi.Models
{
    public class Settings
    {
        public string CaseTableName { get; set; }
        public string TicketTableName { get; set; }
        public string ActionsTableName { get; set; }
        public string ConversationTableName { get; set; }
        public string TownTableName { get; set; }
        public string TicketCategoryTableName { get; set; }
        public List<string> APIKeys { get; set; }
        public FAQSettings FAQSettings { get; set; }
    }

    public class FAQSettings
    {
        public string Endpoint { get; set; }
        public string RequestPath { get; set; }
        public string AuthorizationKey { get; set; }
        public string ClientAppId { get; set; }
        public string CreateRequestViewUrl { get; set; }
    }
}
