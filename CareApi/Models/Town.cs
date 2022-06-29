using System;

namespace CareApi.Models
{
    public class TownRequestModel
    {
        public string Id { get; set; }
        public string TownName { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
    }

    public class TownResponseModel
    {
        public string Id { get; set; }
        public string TownName { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        
    }

}
