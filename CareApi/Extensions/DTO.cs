using System;
using System.Collections.Generic;
using CareApi.Enums;
using CareApi.Models;

namespace CareApi.Extensions
{
    public static class DTO
    {
        public static CaseDbEntity BuildCaseDbEntityFromRequest(this CaseRequestModel req, string partitionKey, string rowKey)
        {
            return new CaseDbEntity()
            {
                PartitionKey = partitionKey,
                RowKey = rowKey,
                State = (int)req.State,
                ReferenceNo = req.ReferenceNo,
                RequesterUPN = req.RequesterUPN,
                Title = req.Title,
                Category = (int)req.Category,
                Description = req.Description,
                IDNo = req.IDNo,
                Name = req.Name,
                Surname = req.Surname,
                MobileNo = req.MobileNo,
                AlternativeNo = req.AlternativeNo,
                Town = req.Town,
                PostalCode = req.PostalCode,
                PhysicalAddress = req.PhysicalAddress,
                LoggingMethod = req.LoggingMethod,
                ChannelId = req.ChannelId,
                AssignedToPersonUPN = req.AssignToPersonUPN
            };
        }

        public static CaseResponseModel BuildCaseResponseModelFromDbEntity(this CaseDbEntity db, List<string> attachments = null)
        {
            return new CaseResponseModel()
            {
                GroupId = db.PartitionKey,
                Id = db.RowKey,
                ReferenceNo = db.ReferenceNo,
                Title = db.Title,
                Category = (CaseCategory)db.Category,
                State = (State)db.State, 
                LoggingMethod = db.LoggingMethod,
                Description = db.Description,
                RequesterUPN = db.RequesterUPN,
                IDNo = db.IDNo,
                Name = db.Name,
                Surname = db.Surname,
                MobileNo = db.MobileNo,
                AlternativeNo = db.AlternativeNo,
                Town = db.Town,
                PhysicalAddress = db.PhysicalAddress,
                PostalCode = db.PostalCode,
                Attachments = attachments,
                CreatedAt = db.CreatedTimestamp,
                LastUpdate = db.Timestamp,
                AssignToPersonUPN = db.AssignedToPersonUPN,
                ChannelId = db.ChannelId
            };
        }

        public static TicketDbEntity BuildTicketDbEntityFromRequest(this TicketRequestModel req, string partitionKey, string rowKey)
        {
            return new TicketDbEntity()
            {
                PartitionKey = partitionKey,
                RowKey = rowKey,
                Title = req.Title,
                Description = req.Description,
                ReferenceNo = req.ReferenceNo,
                Category = req.Category,
                State = (int)req.State,
                Priority = (int)req.Priority,
                PriorityVisible = req.IsVisible,
                RequesterUPN = req.RequesterUPN,
                TechnitionUPN = req.AssignedToUPN,
                //Attachments = string.Empty
            };
        }

        public static TicketResponseModel BuildTicketResponseFromDBEntity(this TicketDbEntity db, List<string> attachments = null)
        {
            return new TicketResponseModel()
            {
                GroupId = db.PartitionKey,
                Id = db.RowKey,
                Title = db.Title,
                Description = db.Description,
                ReferenceNo = db.ReferenceNo,
                Priority = (Priority)db.Priority,
                State = (State)db.State,
                Category = db.Category,
                AssignedToUPN = db.TechnitionUPN,
                RequesterUPN = db.RequesterUPN,
                Attachments = attachments,
                Updates = null,
                CreatedAt = db.CreatedTimestamp,
                LastUpdate = db.Timestamp,
                IsVisible = db.PriorityVisible
            };
        }

        public static ActionDbEntity BuildActionDbEntityFromRequest(this ActionRequest req, string partitionKey, string rowKey)
        {
            return new ActionDbEntity()
            {
                PartitionKey = partitionKey,
                RowKey = rowKey,
                CreatedByUPN = req.CreatedByUPN,
                Message = req.Message,
                State = (int)req.State,
                ReferredTo = req.ReferredTo
            };
        }

        public static ActionResponse BuildActionFromDbEntity(this ActionDbEntity req)
        {
            return new ActionResponse()
            {
                Id = req.RowKey,
                Message = req.Message,
                State = (State)req.State,
                CreatedByUPN = req.CreatedByUPN,
                Timestamp = req.Timestamp,
                ReferredTo = req.ReferredTo
            };
        }

        public static TownResponseModel BuildTownModelFromDbEntity(this TownDbEntity req)
        {
            return new TownResponseModel()
            {
                Id = req.RowKey,
                TownName = req.TownName,
                PostalCode = req.PostalCode,
                
            };
        }

        public static TownDbEntity BuildTownDbEntityFromRequest(this TownRequestModel req)
        {
            return new TownDbEntity()
            {
                RowKey = req.Id,
                TownName = req.TownName,
                PostalCode = req.PostalCode,
            };
        }

        public static TicketCategoryResponseModel BuildTicketCategoryModelFromDbEntity(this TicketCategoryDbEntity req)
        {
            return new TicketCategoryResponseModel()
            {
                Id = req.RowKey,
                CategoryName = req.CategoryName,
                
            };
        }

        public static TicketCategoryDbEntity BuildTicketCategoryDbEntityFromRequest(this TicketCategoryRequestModel req)
        {
            return new TicketCategoryDbEntity()
            {
                RowKey = req.Id,
                CategoryName = req.CategoryName,
         
            };
        }

    }
}
