export interface ICaseModel {
   id: string;
   title: string,
   description: string,
   category: number,
   state: number,
   referenceNo: string,
   loggingMethod: string,
   assignToPersonUPN: string,
   requesterUPN: string,
   groupId: string,
   channelId: string,
   createdAt?: string,
   lastUpdate?: string
   updates?: IAction[],
   attachments?: string[]
}

export interface IAction {
   id: string,
   createdByUPN: string,
   message: string,
   state: number,
   timestamp: Date,
   referredTo: string
}

export interface ICaseViewModel {
   model: ICaseModel,
   isValid: boolean,
   isLoading?: boolean,
   formAction: string
}

export const blankCase: ICaseModel = {
   id: '',
   title: '',
   description: '',
   category: -1,
   state: 0,
   referenceNo: '',
   loggingMethod: '',
   assignToPersonUPN: '',
   requesterUPN: '',
   groupId: '',
   channelId: '',
   updates: [],
};