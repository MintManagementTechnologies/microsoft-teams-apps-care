using AdaptiveCards.Templating;
using CareApi.Enums;
using CareApi.Models;
using CareApi.Repository;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Teams;
using Microsoft.Bot.Schema;
using Microsoft.Bot.Schema.Teams;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CareApi.Services
{
    public class BotMessagingExtensionQueryService : IBotMessagingExtensionQueryService
    {
        private readonly ILogger<BotMessagingExtensionQueryService> _logger;
        private readonly ITicketRepository _ticketRepository;
        private readonly ITicketCategoryService _ticketCategoryService;
        private readonly string[] _cards =
        {
            Path.Combine(".", "Resources", "AdaptiveCardNoButtons.json")
        };

        /// <summary>
        /// Bot Messaging Extension Service for Queries
        /// </summary>
        /// <param name="ticketRepository"></param>
        /// <param name="logger"></param>
        public BotMessagingExtensionQueryService(ITicketRepository ticketRepository,
            ITicketCategoryService ticketCategoryService,
            ILogger<BotMessagingExtensionQueryService> logger)
        {
            _ticketRepository = ticketRepository;
            _ticketCategoryService = ticketCategoryService;
            _logger = logger;
        }

        public async Task<MessagingExtensionResponse> GetResponseForQuery(ITurnContext<IInvokeActivity> turnContext, MessagingExtensionQuery query, CancellationToken cancellationToken)
        {
            try
            {
                switch (query.CommandId)
                {
                    case "searchITCare":
                        var text = query?.Parameters?[0]?.Value as string ?? string.Empty;
                        var resultsForQuery = new List<TicketDbEntity>();
                        var ticketsByRef = await _ticketRepository.GetByReferenceNo(text);
                        var ticketsByTitle = await _ticketRepository.GetByTitle(text);

                        if (ticketsByRef.Count > 0)
                        {
                            resultsForQuery.AddRange(ticketsByRef);
                        }

                        if (ticketsByTitle.Count > 0)
                        {
                            resultsForQuery.AddRange(ticketsByTitle);
                        }

                        if (resultsForQuery.Count <= 0) return null;
                        return GetAdaptiveCard(resultsForQuery);
                        break;
                    default:
                        return null;
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occured with GetResponseForAction");
                throw new System.NotImplementedException();
            }
        }

        public MessagingExtensionResponse GetAdaptiveCard(List<TicketDbEntity> items)
        {
            var attachments = new List<MessagingExtensionAttachment>();
            foreach (var item in items)
            {
                string filepath = Path.Combine(_cards[0]);
                var previewcard = new ThumbnailCard
                {
                    Title = $"{item.ReferenceNo}",
                    Text =  item.Title,
                };

                var adaptiveCardJson = File.ReadAllText(filepath);

                AdaptiveCardTemplate template = new AdaptiveCardTemplate(adaptiveCardJson);

                var ticketCategories = _ticketCategoryService.GetAll(null).Result;
                var categoryName = ticketCategories.FirstOrDefault(t => t.Id == item.Category)?.CategoryName ?? "Error";

                var factsResult = buildFacts(new Dictionary<string, string>()
                {
                    {"Priority", ((Priority)item.Priority).ToString() },
                    {"Category", categoryName },
                });

                string cardJson = template.Expand(new
                {
                    title = "IT Care Request",
                    subject = item.Title,
                    subtitle = item.Description,
                    footer = "",
                    factset = factsResult
                });


                var adaptiveCardAttachment = new Attachment
                {
                    ContentType = "application/vnd.microsoft.card.adaptive",
                    Content = JsonConvert.DeserializeObject(cardJson)
                };

                var attachment = new MessagingExtensionAttachment
                {
                    ContentType = "application/vnd.microsoft.card.adaptive",
                    Content = adaptiveCardAttachment.Content,
                    Preview = previewcard.ToAttachment()
                };

                attachments.Add(attachment);
            }

            return new MessagingExtensionResponse
            {
                ComposeExtension = new MessagingExtensionResult
                {
                    Type = "result",
                    AttachmentLayout = "list",
                    Attachments = attachments
                }
            };
        }

        static object buildFacts(Dictionary<string, string> facts)
        {
            var results = new List<object>();
            foreach (var fact in facts)
            {
                results.Add(new { title = fact.Key, value = fact.Value });
            }

            return results;
        }


    }

    public interface IBotMessagingExtensionQueryService
    {
        Task<MessagingExtensionResponse> GetResponseForQuery(ITurnContext<IInvokeActivity> turnContext, MessagingExtensionQuery query, CancellationToken cancellationToken);
    }
}
