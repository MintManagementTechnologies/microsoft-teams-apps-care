using CareApi.Models;
using CareApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CareApi.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class TicketCategoryController : Controller
    {
        private readonly ILogger<TicketCategoryController> _logger;
        private readonly ITicketCategoryService _ticketCategoryService;

        public TicketCategoryController(
          ITicketCategoryService ticketCategoryService,
          ILogger<TicketCategoryController> logger)
        {
            _ticketCategoryService = ticketCategoryService;
            _logger = logger;
        }


        [HttpGet()]
        public async Task<ActionResult<List<TicketCategoryResponseModel>>> GetAll(string searchText = default)
        {
            _logger.LogInformation($"GetAll for Ticket Category");
            var response = await _ticketCategoryService.GetAll(searchText);
            return Ok(response);
        }

        [HttpPost()]
        public async Task<IActionResult> AddTown([FromBody] TicketCategoryRequestModel request)
        {
            _logger.LogInformation($"Add Ticket Category ");
            var result = await _ticketCategoryService.Create(request);
            return Ok(result);
        }

        [HttpPut()]
        public async Task<IActionResult> UpdateTown([FromBody] TicketCategoryRequestModel request)
        {
            _logger.LogInformation($"Update Ticket Category ");
            var result = await _ticketCategoryService.Update(request);
            return Ok(result);
        }

        [HttpDelete()]
        public async Task<IActionResult> DeleteTown(string ticketCategoryId)
        {
            _logger.LogInformation($"Delete Ticket Category ");
            await _ticketCategoryService.Delete(ticketCategoryId);
            return Ok();
        }
    }
}
