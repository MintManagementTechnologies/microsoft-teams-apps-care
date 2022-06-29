using AdaptiveCards.Templating;
using CareApi.Models;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CareApi.Services
{
    public class FAQService : IFAQService
    {
        private readonly ILogger<FAQService> _logger;
        private readonly Settings _settings;
        private readonly HttpClient _client;
        private readonly string[] _cards =
        {
            Path.Combine(".", "Resources", "AdaptiveCardFAQ.json")
        };

        /// <summary>
        /// QNA Maker integration
        /// </summary>
        /// <param name="settings"></param>
        /// <param name="logger"></param>
        public FAQService(Settings settings,
            ILogger<FAQService> logger)
        {
            _logger = logger;
            _settings = settings;
            try
            {
                _client = new HttpClient()
                {
                    BaseAddress = new Uri(_settings.FAQSettings.Endpoint),
                };
                _client.DefaultRequestHeaders.Add("Authorization", _settings.FAQSettings.AuthorizationKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An Error occured with FAQ service startup");
            }
        }


        /// <summary>
        /// Build Adaptive card for QNAMaker Responses to questions
        /// </summary>
        /// <param name="answers"></param>
        /// <returns></returns>
        public async Task<Attachment> BuildFAQCard(Answer answers)
        {
            try
            {
                //test
                var adaptiveCardJson = System.IO.File.ReadAllText(_cards[0]);
                AdaptiveCardTemplate template = new AdaptiveCardTemplate(adaptiveCardJson);

                var buttons = new List<object>();
                var promptButtons = new List<object>();
                var arrayActions = new List<object>();
                var urlTask = $"https://teams.microsoft.com/l/task/{_settings.FAQSettings.ClientAppId}?url=" + System.Net.WebUtility.UrlEncode($"{_settings.FAQSettings.CreateRequestViewUrl}") + "&height=500&width=500&title=Assign";
                if (answers.context != null && answers.context.prompts.Count() > 0)
                {
                    foreach (var prompt in answers.context.prompts)
                    {
                        arrayActions.Add(new { type = "Action.Submit",
                            title = prompt.displayText,
                            style = "positive",
                            data = new QNAButtonAction { value = prompt.displayText } 
                        });
                    }
                }

                arrayActions.Add(new
                {
                    type = "Action.OpenUrl",
                    title = "Create Request",
                    url = urlTask,
                    style = "positive"
                });

                promptButtons.Add(new
                {
                    type = "ActionSet",
                    actions = arrayActions.ToArray()
                });

                buttons.Add(new
                {
                    type = "Column",
                    width = "stretch",
                    items = promptButtons
                });


                string cardJson = template.Expand(new
                {
                    title = "",
                    content = answers.answer,
                    actionset = buttons
                });

                var adaptiveCardAttachment = new Attachment()
                {
                    ContentType = "application/vnd.microsoft.card.adaptive",
                    Content = JsonConvert.DeserializeObject(cardJson),
                };

                return adaptiveCardAttachment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An Error occured with FAQ service BuildFAQCard");
                return null;
            }
        }

        /// <summary>
        /// Call QNAMaker API for answer
        /// </summary>
        /// <param name="question"></param>
        /// <returns></returns>
        public async Task<QNAMakerResponseModel> GetAnswer(string question)
        {
            try
            {
                var data = new
                {
                    question = $"{question}"
                };

                HttpContent request = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");

                var result = await _client.PostAsync(new Uri($"{_settings.FAQSettings.Endpoint}{_settings.FAQSettings.RequestPath}"), request);
                var stringResult = await result.Content.ReadAsStringAsync();

                var QNAMakerObject = JsonConvert.DeserializeObject<QNAMakerResponseModel>(stringResult);
                return QNAMakerObject;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An Error occured with FAQ service GetAnswer");
                return null;
            }
        }

    }

    public interface IFAQService
    {
        public Task<QNAMakerResponseModel> GetAnswer(string question);
        public Task<Attachment> BuildFAQCard(Answer answers);
    }
}
