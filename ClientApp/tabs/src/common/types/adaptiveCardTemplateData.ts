export interface IAdaptiveCardTemplateDataCustomerCare {
    id: string,
    caseNumber: string,
    requestor: string,
    assignedTo: string,
    caseType: string,
    groupId: string,
    status: number,
    channelName: string 
    changedBy: string  
}

export interface IAdaptiveCardTemplateDataITCare {
    id: string,
    title: string,
    referenceNumber: string
    status: number,
    priority: number,
    category: string,
    technicianComment?: string,
    groupId: string
}