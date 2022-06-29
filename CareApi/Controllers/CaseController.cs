// <copyright file="HomeController.cs" company="Microsoft">
// Copyright (c) Microsoft. All Rights Reserved.
// </copyright>

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Net.Http;
using CareApi.Models;
using CareApi.Services;
using System.Threading.Tasks;
using System;
using CareApi.Repository;
using System.Net;

namespace CareApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CaseController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICaseService _caseService;
        private readonly IFileRepository _fileRepository;
        private readonly ILogger<CaseController> _logger;
        public CaseController(
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            IHttpContextAccessor httpContextAccessor,
            ICaseService caseService,
            IFileRepository fileRepository,
            ILogger<CaseController> logger)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _caseService = caseService;
            _fileRepository = fileRepository;
            _logger = logger;
        }

        [HttpGet("Customer/{customerId}")]
        public async Task<ActionResult<Customer>> GetCustomer(string customerId)
        {
            _logger.LogInformation($"GetCustomer");
            var cases = await _caseService.GetCustomer(customerId);
            return Json(cases);
        }

        [HttpGet()]
        public async Task<ActionResult<List<CaseResponseModel>>> GetAll()
        {
            _logger.LogInformation($"GetEverything");
            var cases = await _caseService.GetAll();
            return Json(cases);
        }

        [HttpGet("{groupId}")]
        public async Task<ActionResult<List<CaseResponseModel>>> GetAll(string groupId)
        {
            _logger.LogInformation($"GetAll for group | {groupId}");
            var cases = await _caseService.GetAll(groupId);
            if (cases.Count <= 0) _httpContextAccessor.HttpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
            return Json(cases);
        }

        [HttpPost("Filter/{groupId}")]
        public async Task<ActionResult<List<CaseResponseModel>>> FilterBy(string groupId, [FromBody] CaseFilter request)
        {
            _logger.LogInformation($"FilterBy for group | {groupId}");
            var cases = await _caseService.FilterBy(groupId, request);
            if(cases.Count <= 0) _httpContextAccessor.HttpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
            return Json(cases);
        }

        [HttpGet("Details/{groupId}/{caseId}")]
        public async Task<ActionResult<CaseResponseModel>> Get(string groupId, string caseId)
        {
            _logger.LogInformation($"Get Details| {groupId} | {caseId}");
            var ticket = await _caseService.Get(groupId, caseId);
            return Json(ticket);
        }

        [HttpPost("Add/{groupId}/{caseId}")]
        public async Task<ActionResult<CaseResponseModel>> AddCase(string groupId, string caseId, [FromBody] CaseRequestModel request)
        {
            _logger.LogInformation($"AddTicket | {groupId} | {caseId} ");
            var result = await _caseService.CreateCase(groupId, caseId, request);
            return Json(result);
        }

        [HttpPut("Edit/{groupId}/{caseId}")]
        public async Task EditCase(string groupId, string caseId, [FromBody] CaseRequestModel request)
        {
            _logger.LogInformation($"EditTicket | {groupId} | {caseId}");
            var result = await _caseService.UpdateCase(groupId, caseId, request);
        }

        [HttpDelete("Delete/{groupId}/{caseId}")]
        public async Task DeleteCase(string groupId, string caseId)
        {
            _logger.LogInformation($"DeleteTicket | {groupId} | {caseId}");
            var result = await _caseService.DeleteCase(groupId, caseId);
        }

        [HttpPost("Action/Add/{caseId}")]
        public async Task AddAction(string caseId, [FromBody] ActionRequest request)
        {
            _logger.LogInformation($"AddAction | {caseId} ");
            var result = await _caseService.AddAction(caseId, request);
        }

        [HttpPut("Action/Edit/{caseId}/{ActionId}")]
        public async Task EditAction(string caseId, string ActionId, [FromBody] ActionRequest request)
        {
            _logger.LogInformation($"EditAction | {caseId} | {ActionId} ");
            var result = await _caseService.EditAction(caseId, ActionId, request);
        }

        [HttpDelete("Action/Delete/{caseId}/{ActionId}")]
        public async Task DeleteAction(string caseId, string ActionId)
        {
            _logger.LogInformation($"DeleteAction | {caseId} | {ActionId}");
            await _caseService.DeleteAction(caseId, ActionId);
        }

        [HttpPost("Attachment/Add/{caseId}")]

        public async Task<IActionResult> UploadFile(IFormFile file, string caseId)
        {
            if (file == null || file.FileName == null) return BadRequest();

            var response = await _fileRepository.AddFileAsync(caseId, file);
            return Json(new { Filename = file.FileName, Message = response });
        }

        [HttpDelete("Attachment/Delete/{caseId}/{fileName}")]

        public async Task<IActionResult> RemoveFile(string caseId, string fileName)
        {
            var result = await _fileRepository.RemoveFileAsync(caseId, fileName);
            return Json(new { Message = result });
        }

        [HttpGet("Attachment/Download/{caseId}/{fileName}")]

        public async Task<IActionResult> Download(string caseId, string fileName)
        {
            var response = await _fileRepository.DownloadFileAsync(caseId, fileName);
            if (response == null) return BadRequest();
            _httpContextAccessor.HttpContext.Response.Headers.Add("Content-Length", response.FileStream.Length.ToString());
            return File(response.FileStream, response.ContentType, fileName);
        }
    }
}
