using CareApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;

namespace CareApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AppHealthController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private Settings _settings;

        /// <summary>
        /// Initializes a new instance of the <see cref="AppHealthController"/> class.
        /// </summary>
        /// <param name="configuration">IConfiguration instance.</param>
        /// <param name="httpClientFactory">IHttpClientFactory instance.</param>
        /// <param name="httpContextAccessor">IHttpContextAccessor instance.</param>
        public AppHealthController(
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            IHttpContextAccessor httpContextAccessor,
            Settings settings)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _settings = settings;
        }

        [HttpGet("Check")]
        public ActionResult<string> Check()
        {
            return Json(new
            {
                Message = "Ok",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            });
        }
    }
}
