// <copyright file="HomeController.cs" company="Microsoft">
// Copyright (c) Microsoft. All Rights Reserved.
// </copyright>

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using CareApi.Models;
using CareApi.Services;
using CareApi.Repository;
using CareApi.Middleware;

namespace CareApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TicketController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITicketService _ticketService;
        private readonly IFileRepository _fileRepository;
        private readonly ILogger<TicketController> _logger;

        public TicketController(
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            IHttpContextAccessor httpContextAccessor,
            ITicketService ticketService,
            IFileRepository fileRepository,
            ILogger<TicketController> logger)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
            _ticketService = ticketService;
            _fileRepository = fileRepository;
            _logger = logger;
        }

        [HttpGet()]
        public async Task<ActionResult<List<TicketResponseModel>>> GetAll()
        {
            _logger.LogInformation($"GetEverything");
            var tickets = await _ticketService.GetAll();
            return Json(tickets);
        }

        [HttpGet("{groupId}")]
        public async Task<ActionResult<List<TicketResponseModel>>> GetAll(string groupId)
        {
            _logger.LogInformation($"GetAll for group | {groupId}");
            var tickets = await _ticketService.GetAll(groupId);
            if (tickets.Count <= 0) _httpContextAccessor.HttpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
            return Json(tickets);
        }

        [HttpPost("Filter/{groupId}")]
        public async Task<ActionResult<List<TicketResponseModel>>> FilterBy(string groupId, [FromBody] TicketFilter request)
        {
            _logger.LogInformation($"GetAll | {groupId}");
            var tickets = await _ticketService.FilterBy(groupId, request);
            return Json(tickets);
        }

        [HttpGet("Details/{groupId}/{ticketId}")]
        public async Task<ActionResult<TicketResponseModel>> Get(string groupId, string ticketId)
        {
            _logger.LogInformation($"Get Details | {groupId} | {ticketId}");
            var ticket = await _ticketService.Get(groupId, ticketId);
            if(ticket == null) _httpContextAccessor.HttpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
            return Json(ticket);
        }

        [HttpPost("Add/{groupId}/{ticketId}")]
        public async Task<ActionResult<TicketResponseModel>> AddTicket(string groupId, string ticketId, [FromBody] TicketRequestModel request)
        {
            _logger.LogInformation($"AddTicket | {groupId} | {ticketId} ");
            var createTicket = await _ticketService.CreateTicket(groupId, ticketId, request);
            return Json(createTicket);
        }

        [HttpPut("Edit/{groupId}/{ticketId}")]
        public async Task EditTicket(string groupId, string ticketId, [FromBody] TicketRequestModel request)
        {
            _logger.LogInformation($"EditTicket | {groupId} | {ticketId}");
            var result = await _ticketService.UpdateTicket(groupId, ticketId, request);
        }

        [HttpDelete("Delete/{groupId}/{ticketId}")]
        public async Task DeleteTicket(string groupId, string ticketId)
        {
            _logger.LogInformation($"DeleteTicket | {groupId} | {ticketId}");
            var result = await _ticketService.DeleteTicket(groupId, ticketId);
        }

        [HttpPost("Action/Add/{ticketId}")]
        public async Task AddAction(string ticketId, [FromBody] ActionRequest request)
        {
            _logger.LogInformation($"AddAction | {ticketId} ");
            var result = await _ticketService.AddAction(ticketId, request);
        }

        [HttpPut("Action/Edit/{ticketId}/{ActionId}")]
        public async Task EditAction(string ticketId, string ActionId, [FromBody] ActionRequest request)
        {
            _logger.LogInformation($"EditAction | {ticketId} | {ActionId} ");
            var result = await _ticketService.EditAction(ticketId, ActionId, request);
        }

        [HttpDelete("Action/Delete/{ticketId}/{ActionId}")]
        public async Task DeleteAction(string ticketId, string ActionId)
        {
            _logger.LogInformation($"DeleteAction | {ticketId} | {ActionId}");
            await _ticketService.DeleteAction(ticketId, ActionId);
        }

        [HttpPost("Attachment/Add/{ticketId}")]

        public async Task<IActionResult> UploadFile(IFormFile file, string ticketId)
        {
            if (file == null || file.FileName == null) return BadRequest();

            var response = await _fileRepository.AddFileAsync(ticketId, file);
            return Json(new { Filename = file.FileName, Message = response });
        }

        [HttpDelete("Attachment/Delete/{ticketId}/{fileName}")]

        public async Task<IActionResult> RemoveFile(string ticketId, string fileName)
        {
            var result = await _fileRepository.RemoveFileAsync(ticketId, fileName);
            return Json(new { Message = result });
        }

        [HttpGet("Attachment/Download/{ticketId}/{fileName}")]

        public async Task<IActionResult> Download(string ticketId, string fileName)
        {
            var response = await _fileRepository.DownloadFileAsync(ticketId, fileName);
            if (response == null) return BadRequest();
            _httpContextAccessor.HttpContext.Response.Headers.Add("Content-Length", response.FileStream.Length.ToString());
            return File(response.FileStream, response.ContentType, fileName);
        }
    }
}
