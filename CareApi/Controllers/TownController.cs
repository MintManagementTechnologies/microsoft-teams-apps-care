using CareApi.Models;
using CareApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace CareApi.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class TownController : Controller
    {

        private readonly ILogger<TownController> _logger;
        private readonly ITownService _townService;

        public TownController(
          ITownService townService,
          ILogger<TownController> logger)
        {
            _townService = townService;
            _logger = logger;
        }


        [HttpGet()]
        public async Task<ActionResult<List<TownResponseModel>>> GetAll(string searchText = default)
        {
            _logger.LogInformation($"GetAll for town");
            var response = await _townService.GetAll(searchText);
            return Ok(response);
        }

        [HttpPost()]
        public async Task<IActionResult> AddTown([FromBody] TownRequestModel request)
        {
            _logger.LogInformation($"Add Town ");
            var result = await _townService.Create(request);
            return Ok(result);
        }

        [HttpPut()]
        public async Task<IActionResult> UpdateTown([FromBody] TownRequestModel request)
        {
            _logger.LogInformation($"Update Town ");
            var result = await _townService.Update(request);
            return Ok(result);
        }

        [HttpDelete()]
        public async Task<IActionResult> DeleteTown(string townId)
        {
            _logger.LogInformation($"Delete Town ");
            await _townService.Delete(townId);
            return Ok();
        }

    }
}
