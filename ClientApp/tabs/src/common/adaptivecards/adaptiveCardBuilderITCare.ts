
import { IAdaptiveCardTemplateDataITCare } from "../types/adaptiveCardTemplateData";
import { getPriorityOptions } from "../utils/formVariables";
import { getBaseUrl } from "../utils/sharedFunctions";

import NewTicketRequestorCardTemplate from "./templates/newTicketRequestorCardTemplate.json"
import UpdatedTicketRequestorCardTemplate from "./templates/updatedTicketRequestorCardTemplate.json"
import NewTicketChannelCardTemplate from "./templates/newTicketChannelCardTemplate.json"
import UpdatedTicketChannelCardTemplate from "./templates/updatedTicketChannelCardTemplate.json"
import TicketAssignedCardTemplate from "./templates/ticketAssignedCardTemplate.json"
import UpdatedTicketAssignedCardTemplate from "./templates/updatedTicketAssignedCardTemplate.json"


const getAdaptiveCardAppId = () => {
    return process.env.REACT_APP_ITSUPPORT_APPID || 'ebb769ed-90ad-4008-a459-dcd4c4d10343';
}

const getAdaptiveCardPillImage = (status: number): string => {
    /*
        Opened = 0,
        In Progress = 1,
        Resolved = 2,
        Closed = 3
    */
    const baseUrl = getBaseUrl().replace('/#', '');
    switch (status)
    {
        case 1:
            return baseUrl + "/img/inprogress_pill.png";
        case 2:
            return baseUrl + "/img/resolved_pill.png";
        case 3:
            return baseUrl + "/img/closed_pill.png";
        default:
            return baseUrl + "/img/opened_pill.png";
        
    }
}

const setCategoryField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{Category\}/g, templateData.category);
}

const setPriorityTitleField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    const priorityText = getPriorityOptions().find(x => x.key === templateData.priority)?.header || 'Error';
    return adaptiveCardJson.replaceAll(/\$\{Priority\}/g, priorityText);
}

const setRequestTitleField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{RequestTitle\}/g, templateData.title);
}

const setStatusIconField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    const statusIcon = getAdaptiveCardPillImage(templateData.status);
    return adaptiveCardJson.replaceAll(/\$\{StatusImage\}/g, statusIcon);
}

const setTechnicianCommentField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{TechnicianComment\}/g, templateData.technicianComment || '');
}

const setReferenceField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{Reference\}/g, templateData.referenceNumber || '');
}

const setViewDetailField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    const viewUrl = encodeURIComponent(getBaseUrl() + `/me/it/view/${templateData.groupId}/${templateData.id}`);
    const deepLinkViewUrl = `https://teams.microsoft.com/l/task/${getAdaptiveCardAppId()}?url=${viewUrl}&height=medium&width=medium&title=Request`;
    return adaptiveCardJson.replaceAll(/\$\{ViewUrl\}/g, deepLinkViewUrl);
}

const setAssignField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    const viewUrl = encodeURIComponent(getBaseUrl() + `/me/it/assign/${templateData.groupId}/${templateData.id}`);
    const deepLinkViewUrl = `https://teams.microsoft.com/l/task/${getAdaptiveCardAppId()}?url=${viewUrl}&height=medium&width=medium&title=Request`;
    return adaptiveCardJson.replaceAll(/\$\{AssignUrl\}/g, deepLinkViewUrl);
}

const setOpenField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {
    const viewUrl = encodeURIComponent(getBaseUrl() + `/me/it/edit/${templateData.groupId}/${templateData.id}`);
    const deepLinkViewUrl = `https://teams.microsoft.com/l/task/${getAdaptiveCardAppId()}?url=${viewUrl}&height=medium&width=medium&title=Request`;
    return adaptiveCardJson.replaceAll(/\$\{OpenUrl\}/g, deepLinkViewUrl);
}

export const setAllFieldsField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataITCare): string => {

    // adaptiveCardJson = setCaseNumberField(adaptiveCardJson, templateData);
    // adaptiveCardJson = setRequestorField(adaptiveCardJson, templateData);
    // adaptiveCardJson = setAssignedToField(adaptiveCardJson, templateData);
    // adaptiveCardJson = setTypeField(adaptiveCardJson, templateData);
    adaptiveCardJson = setStatusIconField(adaptiveCardJson, templateData);
    adaptiveCardJson = setRequestTitleField(adaptiveCardJson, templateData);
    adaptiveCardJson = setPriorityTitleField(adaptiveCardJson, templateData);
    adaptiveCardJson = setCategoryField(adaptiveCardJson, templateData);
    adaptiveCardJson = setTechnicianCommentField(adaptiveCardJson, templateData);
    adaptiveCardJson = setReferenceField(adaptiveCardJson, templateData);

    adaptiveCardJson = setViewDetailField(adaptiveCardJson, templateData);
    adaptiveCardJson = setAssignField(adaptiveCardJson, templateData);
    adaptiveCardJson = setOpenField(adaptiveCardJson, templateData);
    

    return adaptiveCardJson;
}

export const buildNewTicketRequestorCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataITCare): string => {
    let adaptiveCardJson = JSON.stringify(NewTicketRequestorCardTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildUpdatedTicketRequestorCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataITCare): string => {
    let adaptiveCardJson = JSON.stringify(UpdatedTicketRequestorCardTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildNewTicketChannelCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataITCare): string => {
    let adaptiveCardJson = JSON.stringify(NewTicketChannelCardTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildUpdatedTicketChannelCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataITCare): string => {
    let adaptiveCardJson = JSON.stringify(UpdatedTicketChannelCardTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildUpdatedTicketAssignedCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataITCare): string => {
    let adaptiveCardJson = JSON.stringify(UpdatedTicketAssignedCardTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildTicketAssignedCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataITCare): string => {
    let adaptiveCardJson = JSON.stringify(TicketAssignedCardTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}