// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
//
// Generated with Bot Builder V4 SDK Template for Visual Studio EchoBot v4.15.2

using AdaptiveCards.Templating;
using CareApi.Models;
using CareApi.Repository;
using CareApi.Services;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Builder.Teams;
using Microsoft.Bot.Schema;
using Microsoft.Bot.Schema.Teams;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EchoBot1.Bots
{
    public class EchoBot : TeamsActivityHandler
    {
        // Message to send to users when the bot receives a Conversation Update event
        private const string WelcomeMessage = "Welcome to the Care Bot ";
        
        // Dependency injected dictionary for storing ConversationReference objects used in NotifyController to proactively message users
        private readonly ConcurrentDictionary<string, ConversationReference> _conversationReferences;
        private readonly IConversationService _conversationService;
        private readonly IBotMessagingExtensionQueryService _botMessagingExtensionQueryService;
        private readonly IFAQService _faqService;
        public EchoBot(ConcurrentDictionary<string, ConversationReference> conversationReferences,
            IBotMessagingExtensionQueryService botMessagingExtensionQueryService,
            IConversationService conversationService,
            IFAQService faqService)
        {
            _conversationReferences = conversationReferences;
            _conversationService = conversationService;
            _faqService = faqService;
            _botMessagingExtensionQueryService = botMessagingExtensionQueryService;
        }

        /// <summary>
        /// Adds Conversation References to Azure table storage for context later
        /// </summary>
        /// <param name="activity"></param>
        /// <returns></returns>
        private async Task AddConversationReference(Activity activity)
        {
            var conversationReference = activity.GetConversationReference();

            await _conversationService.AddOrUpdate(conversationReference);


            var teamsChannelId = activity.TeamsGetChannelId();
            var jsonConversationReff = JsonConvert.SerializeObject(conversationReference);

            _conversationReferences.AddOrUpdate(conversationReference.User.Id, conversationReference, (key, newValue) => conversationReference);
        }

        protected override Task OnConversationUpdateActivityAsync(ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            AddConversationReference(turnContext.Activity as Activity);

            return base.OnConversationUpdateActivityAsync(turnContext, cancellationToken);
        }

        protected override async Task OnMembersAddedAsync(IList<ChannelAccount> membersAdded, ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            foreach (var member in membersAdded)
            {
                // Greet anyone that was not the target (recipient) of this message.
                if (member.Id != turnContext.Activity.Recipient.Id)
                {
                    await turnContext.SendActivityAsync(MessageFactory.Text(WelcomeMessage), cancellationToken);
                }
            }
        }

        /// <summary>
        /// When the bot is messaged. this is triggered
        /// </summary>
        /// <param name="turnContext"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        protected override async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
        {
            await AddConversationReference(turnContext.Activity as Activity);
            string qnaActionString = string.Empty;
            QNAButtonAction qNAButtonAction = null;
            try
            {
                qnaActionString = JsonConvert.SerializeObject(turnContext.Activity.Value);
                qNAButtonAction = JsonConvert.DeserializeObject<QNAButtonAction>(qnaActionString);
            }
            catch (Exception ex)
            {

            }

            string question = (qNAButtonAction!=null && !string.IsNullOrEmpty(qNAButtonAction.value)) ? qNAButtonAction.value : turnContext.Activity.Text;

            if (string.IsNullOrEmpty(question)) return;

            var faqResult = await _faqService.GetAnswer(question);
            if (faqResult != null && faqResult.answers.Count() > 0)
            {
                var orderedFAQResults = faqResult.answers.OrderByDescending(x => x.score).FirstOrDefault();
                var stringAnswer = orderedFAQResults.answer;

                var botReply = MessageFactory.Text($"");
                var attachment = await _faqService.BuildFAQCard(orderedFAQResults);

                botReply.Attachments.Add(attachment);
                await turnContext.SendActivityAsync(botReply, cancellationToken);
            }

            return;
            // Echo back what the user said
            await turnContext.SendActivityAsync(MessageFactory.Text($"You sent '{turnContext.Activity.Text}'"), cancellationToken);
        }

        /// <summary>
        /// When the Messaging extension is provided a text input. 
        /// this method is invoked
        /// </summary>
        /// <param name="turnContext"></param>
        /// <param name="query"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        protected override async Task<MessagingExtensionResponse> OnTeamsMessagingExtensionQueryAsync(ITurnContext<IInvokeActivity> turnContext, MessagingExtensionQuery query, CancellationToken cancellationToken)
        {
            // Handle different actions using switch
            var result = await _botMessagingExtensionQueryService.GetResponseForQuery(turnContext, query, cancellationToken);
            return result;
        }
    }
}