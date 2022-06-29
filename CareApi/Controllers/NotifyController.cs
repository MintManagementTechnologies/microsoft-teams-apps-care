using AdaptiveCards;
using AdaptiveCards.Templating;
using CareApi.Models;
using CareApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Integration.AspNet.Core;
using Microsoft.Bot.Builder.Teams;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace CareApi.Controllers
{
    [Route("api/notify")]
    [ApiController]
    public class NotifyController : ControllerBase
    {
        private readonly IBotFrameworkHttpAdapter _adapter;
        private readonly string _appId;
        private readonly ConcurrentDictionary<string, ConversationReference> _conversationReferences;
        private readonly IConversationService _conversationService;
        private readonly ILogger<NotifyController> _logger;
        // This array contains the file location of our adaptive cards
        private readonly string[] _cards =
        {
            Path.Combine(".", "Resources", "AdaptiveCard.json")
        };

        /// <summary>
        /// This controller is used to message adaptive cards to users/channels
        /// </summary>
        /// <param name="adapter"></param>
        /// <param name="configuration"></param>
        /// <param name="conversationReferences"></param>
        /// <param name="logger"></param>
        /// <param name="conversationService"></param>
        public NotifyController(IBotFrameworkHttpAdapter adapter,
            IConfiguration configuration,
            ConcurrentDictionary<string, ConversationReference> conversationReferences,
            ILogger<NotifyController> logger,
            IConversationService conversationService)
        {
            _adapter = adapter;
            _conversationReferences = conversationReferences;
            _conversationService = conversationService;
            _logger = logger;
            _appId = configuration["MicrosoftAppId"] ?? string.Empty;
        }

        [HttpPost()]
        public async Task<IActionResult> Post([FromBody] NotificationRequest request)
        {
            try
            {
                foreach (var user in request.users)
                {
                    var conRef = await _conversationService.Get(user);
                    if (conRef == null) continue;

                    var conv = new ConversationReference()
                    {
                        Conversation = new ConversationAccount(true, "personal", $"{conRef.ConversationId}"),
                        ServiceUrl = "https://smba.trafficmanager.net/za/"
                    };

                    await ((BotAdapter)_adapter).ContinueConversationAsync(_appId, conv, async (context, token) => await BotCallback(request, context, token), default(CancellationToken));
                }

                foreach (var channel in request.channels)
                {
                    var conv = new ConversationReference()
                    {
                        Conversation = new ConversationAccount(true, "channel", $"{channel}"),
                        ServiceUrl = "https://smba.trafficmanager.net/za/"
                    };

                    await ((BotAdapter)_adapter).ContinueConversationAsync(_appId, conv, async (context, token) => await BotCallback(request, context, token), default(CancellationToken));
                }

                // Let the caller know proactive messages have been sent
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occured with notifications");
                return null;
            }
        }


        [HttpPost("json")]
        public async Task<IActionResult> PostJson([FromBody] NotificationRequestJson request)
        {
            try
            {
                foreach (var user in request.users)
                {
                    var conRef = await _conversationService.Get(user);
                    if (conRef == null) continue;

                    var conv = new ConversationReference()
                    {
                        Conversation = new ConversationAccount(true, "personal", $"{conRef.ConversationId}"),
                        ServiceUrl = "https://smba.trafficmanager.net/za/"
                    };

                    await ((BotAdapter)_adapter).ContinueConversationAsync(_appId, conv, async (context, token) => await BotCallbackJson(request, context, token), default(CancellationToken));
                }

                foreach (var channel in request.channels)
                {
                    var conv = new ConversationReference()
                    {
                        Conversation = new ConversationAccount(true, "channel", $"{channel}"),
                        ServiceUrl = "https://smba.trafficmanager.net/za/"
                    };

                    await ((BotAdapter)_adapter).ContinueConversationAsync(_appId, conv, async (context, token) => await BotCallbackJson(request, context, token), default(CancellationToken));
                }

                // Let the caller know proactive messages have been sent
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occured with notifications");
                return null;
            }
        }

        private async Task BotCallback(NotificationRequest request, ITurnContext turnContext, CancellationToken cancellationToken)
        {
            try
            {
                var cardAttachment = CreateAdaptiveCardAttachment(_cards[0], request);
                await turnContext.SendActivityAsync(MessageFactory.Attachment(cardAttachment), cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "an exception was thrown in the bot callback");
            }
        }

        private async Task BotCallbackJson(NotificationRequestJson request, ITurnContext turnContext, CancellationToken cancellationToken)
        {
            try
            {
                var adaptiveCardAttachment = new Attachment()
                {
                    ContentType = "application/vnd.microsoft.card.adaptive",
                    Content = JsonConvert.DeserializeObject(request.adaptivecardjson),
                };

                await turnContext.SendActivityAsync(MessageFactory.Attachment(adaptiveCardAttachment), cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "an exception was thrown in the bot callback");
            }
        }

        private static Attachment CreateAdaptiveCardAttachment(string filePath, NotificationRequest request)
        {
            var adaptiveCardJson = System.IO.File.ReadAllText(filePath);
            AdaptiveCardTemplate template = new AdaptiveCardTemplate(adaptiveCardJson);

            var actionsetResult = buildAction(request.actions);
            var factsResult = buildFacts(request.facts);

            string cardJson = template.Expand(new
            {
                title = request.title,
                subject = request.subject,
                subtitle = request.subtitle,
                footer = request.footer,
                factset = factsResult,
                actionset = actionsetResult
            });

            var adaptiveCardAttachment = new Attachment()
            {
                ContentType = "application/vnd.microsoft.card.adaptive",
                Content = JsonConvert.DeserializeObject(cardJson),
            };
            return adaptiveCardAttachment;
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

        static object buildAction(NotificationAction[] actions)
        {
            var results = new List<object>();
            results.Add(new { type = "Column", width = "stretch" });

            foreach (var action in actions)
            {
                results.Add(new
                {
                    type = "Column",
                    width = "stretch",
                    items = new object[]
                    {
                        new {
                            type = "ActionSet",
                            actions = new object[]
                            {
                                new { type = "Action.OpenUrl", title = action.text, url = action.url }
                            }
                        }
                    }
                });
            }

            return results;
        }
    }
}
