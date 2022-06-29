import { IAdaptiveCardTemplateDataCustomerCare } from "../types/adaptiveCardTemplateData";
import { getBaseUrl } from "../utils/sharedFunctions";

import { getStatusOptions } from "../utils/formVariables";

import NewCustomerCaseTemplate from "./templates/newCustomerCaseTemplate.json"
import UpdatedCustomerCaseTemplate from "./templates/updatedCustomerCaseTemplate.json"
import StatusUpdateCustomerCardTemplate from "./templates/statusUpdateCustomerCardTemplate.json"
import CaseAssignedPersonTemplate from "./templates/caseAssignedPersonTemplate.json"
import CaseAssignedChannelTemplate from "./templates/caseAssignedChannelTemplate.json"
import CaseAssignedAllDirectoratesTemplate from "./templates/caseAssignedAllDirectoratesTemplate.json"
import CaseEscalatedTemplate from "./templates/caseEscalatedTemplate.json"


const getAdaptiveCardAppId = () => {
    return process.env.REACT_APP_CUSTOMERCARE_APPID || 'ebb769ed-90ad-4008-a459-dcd4c4d10343';
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

const setCaseNumberField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{CaseNo\}/g, templateData.caseNumber);
}

const setRequestorField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{Requestor\}/g, templateData.requestor);
}

const setAssignedToField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{AssignedTo\}/g, templateData.assignedTo);
}

const setTypeField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{Type\}/g, templateData.caseType);
}

const setAssignedByField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{AssignedBy\}/g, templateData.changedBy);
}

const setStatusIconField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    const statusIcon = getAdaptiveCardPillImage(templateData.status);
    return adaptiveCardJson.replaceAll(/\$\{StatusImage\}/g, statusIcon);
}

const setViewDetailField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    const viewUrl = encodeURIComponent(getBaseUrl() + `/me/customer/view/${templateData.groupId}/${templateData.id}`);
    const deepLinkViewUrl = `https://teams.microsoft.com/l/task/${getAdaptiveCardAppId()}?url=${viewUrl}&height=medium&width=medium&title=Customer Case`;
    return adaptiveCardJson.replaceAll(/\$\{ViewUrl\}/g, deepLinkViewUrl);
}

const setRespondField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    const viewUrl = encodeURIComponent(getBaseUrl() + `/me/customer/action/${templateData.groupId}/${templateData.id}`);
    const deepLinkViewUrl = `https://teams.microsoft.com/l/task/${getAdaptiveCardAppId()}?url=${viewUrl}&height=medium&width=medium&title=Customer Case`;
    return adaptiveCardJson.replaceAll(/\$\{RespondUrl\}/g, deepLinkViewUrl);
}

const setAssignField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    const assignUrl = encodeURIComponent(getBaseUrl() + `/team/customer/assign/${templateData.groupId}/${templateData.id}`);
    const assignLinkViewUrl = `https://teams.microsoft.com/l/task/${getAdaptiveCardAppId()}?url=${assignUrl}&height=medium&width=medium&title=Customer Case`;
    return adaptiveCardJson.replaceAll(/\$\{AssignUrl\}/g, assignLinkViewUrl);
}

const setStatusDescriptionField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    const statusDescription = getStatusOptions().find(i => i.status === templateData.status)?.label || "error";
    return adaptiveCardJson.replaceAll(/\$\{StatusDesc\}/g, statusDescription);
}

const setChannelNameField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    return adaptiveCardJson.replaceAll(/\$\{ChannelName\}/g, templateData.channelName);
}

const setAllFieldsField = (adaptiveCardJson: string, templateData: IAdaptiveCardTemplateDataCustomerCare): string => {
    adaptiveCardJson = setCaseNumberField(adaptiveCardJson, templateData);
    adaptiveCardJson = setRequestorField(adaptiveCardJson, templateData);
    adaptiveCardJson = setAssignedToField(adaptiveCardJson, templateData);
    adaptiveCardJson = setTypeField(adaptiveCardJson, templateData);
    adaptiveCardJson = setStatusIconField(adaptiveCardJson, templateData);
    adaptiveCardJson = setViewDetailField(adaptiveCardJson, templateData);
    adaptiveCardJson = setAssignField(adaptiveCardJson, templateData);
    adaptiveCardJson = setStatusDescriptionField(adaptiveCardJson, templateData);
    adaptiveCardJson = setRespondField(adaptiveCardJson, templateData);
    adaptiveCardJson = setAssignedByField(adaptiveCardJson, templateData);
    adaptiveCardJson = setChannelNameField(adaptiveCardJson, templateData);
    return adaptiveCardJson;
}


export const buildNewCustomerCaseCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataCustomerCare): string => {
    let adaptiveCardJson = JSON.stringify(NewCustomerCaseTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildUpdatedCustomerCaseCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataCustomerCare): string => {
    let adaptiveCardJson = JSON.stringify(UpdatedCustomerCaseTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildStatusChangeCustomerCaseCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataCustomerCare): string => {
    let adaptiveCardJson = JSON.stringify(StatusUpdateCustomerCardTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildCaseAssignedPersonCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataCustomerCare): string => {
    let adaptiveCardJson = JSON.stringify(CaseAssignedPersonTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildCaseEscalatedCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataCustomerCare): string => {
    let adaptiveCardJson = JSON.stringify(CaseEscalatedTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildCaseAssignedChannelCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataCustomerCare): string => {
    let adaptiveCardJson = JSON.stringify(CaseAssignedChannelTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}

export const buildCaseAssignedAllDirectoratesCard = (adaptiveCardDetail: IAdaptiveCardTemplateDataCustomerCare): string => {
    let adaptiveCardJson = JSON.stringify(CaseAssignedAllDirectoratesTemplate);
    adaptiveCardJson = setAllFieldsField(adaptiveCardJson, adaptiveCardDetail);
    return adaptiveCardJson;                                       
}