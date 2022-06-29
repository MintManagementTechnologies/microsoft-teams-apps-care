import { log } from "./customConsoleLog";
import { getBaseUrl } from "./sharedFunctions";

export const { graphScope } = { graphScope: ["User.Read", "User.ReadBasic.All", "Presence.Read.All", "Sites.ReadWrite.All", "Channel.ReadBasic.All"] };

export interface IModalDimensions {
   height: number,
   width: number,
};

export interface IModalProperties {
   height: number,
   width: number,
   title: string
};

export interface ISiteConfig {
   siteId: string;
   docLibRootQuery: string;
   newItemBaseQuery: string;
   newRequestFolderQuery: string;
}

export interface IConfig {
   appId: string;
   tabBaseUrl: string;
   spSite: ISiteConfig;
}

export const getAppConfig = (): IConfig => {
   const appId = '';
   const siteId = 'ajacsrsa1.sharepoint.com,0f1fc643-1ce8-42c1-a35e-a8e3aa33a5a7,0ded2799-54c0-44ec-9d58-87c114a7d13e';
   const driveId = 'b!Q8YfD-gcwUKjXqjjqjOlp5kn7Q3AVOxEnViHwRSn0T6eTlfAL-hfQa_tP0LisHDo';
   const docLibId = '014WE3SYV6Y2GOVW7725BZO354PWSELRRZ';

   const docLibRootQuery = `/drives/${driveId}/root:`
   const newItemBaseQuery = `/drives/${driveId}/items`;
   const newRequestFolderQuery = `${newItemBaseQuery}/${docLibId}/children`;

   return {
      appId: appId,
      tabBaseUrl: window.location.origin,
      spSite: {
         siteId: siteId,
         docLibRootQuery: docLibRootQuery,
         newItemBaseQuery: newItemBaseQuery,
         newRequestFolderQuery: newRequestFolderQuery,
      }
   };
}