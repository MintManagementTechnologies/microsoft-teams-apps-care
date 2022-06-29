export interface IGraphUserResult {
   businessPhones: any[];
   displayName: string;
   givenName: string;
   jobTitle: string;
   mail: string;
   mobilePhone: string;
   officeLocation: string;
   preferredLanguage: string;
   surname: string;
   userPrincipalName: string;
   id: string;
   department: string;
}

export interface IGraphPresenceResult {
   id: string;
   status: number;
   body: {
       value: {
           id: string;
           availability: string;
           activity: string;
       }[];
   };
}

export interface IGraphUserPhotoResult {
   id: string;
   status: number;
   body: string;
}

export interface IGraphBatchResult {
   responses: {
      id: string;
      status: number;
      body: any;
   }[]
}

export interface IGraphUserModel extends IGraphUserResult {
   image?: string,
   availability?: string,
   activity?: string,
}

export interface IGraphChannelValue {
   id: string;
   displayName: string;
}

export interface IGraphChannelMemberValue {
   id?: string;
   roles?: string[];
   displayName: string;
   userId: string;
   email: string;
}

export interface IGraphResult {
   "@odata.context": string;
   "@odata.count": number;
   value: IGraphChannelValue[] | IGraphChannelMemberValue[]
}

export interface IGraphError {
   statusCode: number
}
