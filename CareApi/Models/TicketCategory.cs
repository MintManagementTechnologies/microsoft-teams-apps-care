namespace CareApi.Models
{
    public class TicketCategoryRequestModel
    {
        public string Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class TicketCategoryResponseModel
    {
        public string Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        
    }
}
