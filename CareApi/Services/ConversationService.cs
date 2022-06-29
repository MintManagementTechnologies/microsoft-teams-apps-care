using CareApi.Models;
using CareApi.Repository;
using Microsoft.Bot.Schema;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace CareApi.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly ILogger<ConversationService> _logger;
        /// <summary>
        /// Add Conversation References to Azure table storage
        /// this is used in a lookup later to reply/send message to a user
        /// </summary>
        /// <param name="conversationRepository"></param>
        /// <param name="logger"></param>
        public ConversationService(IConversationRepository conversationRepository,
            ILogger<ConversationService> logger)
        {
            _conversationRepository = conversationRepository;
            _logger = logger;
        }

        public async Task AddOrUpdate(ConversationReference con)
        {
            try
            {
                if (con.Conversation.ConversationType.Equals("personal"))
                {
                    var conversationEntity = new ConversationDbEntity()
                    {
                        ConversationId = con.Conversation.Id,
                        PartitionKey = con.Bot.Id,
                        RowKey = con.User.AadObjectId
                    };


                    var exists = await _conversationRepository.Get(con.Bot.Id, con.User.AadObjectId);
                    if (exists != null)
                    {
                        _logger.LogInformation("ConversationRef exists, updating");
                        await _conversationRepository.Update(conversationEntity);
                    }
                    else
                    {
                        _logger.LogInformation("Creating new ConversationRef");
                        await _conversationRepository.Create(conversationEntity);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "There was an Error with ConversationService");
            }
        }

        public async Task<ConversationDbEntity> Get(string userId)
        {
            try
            {
                var result = await _conversationRepository.Get(userId);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "There was an Error with ConversationService");
                return null;
            }
        }
    }

    public interface IConversationService
    {
        Task AddOrUpdate(ConversationReference con);
        Task<ConversationDbEntity> Get(string userId);
    }
}
