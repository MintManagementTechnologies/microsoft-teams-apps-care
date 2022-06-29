import { Client, FileUpload, LargeFileUploadTask, LargeFileUploadTaskOptions, UploadEventHandlers } from "@microsoft/microsoft-graph-client";
import { getAppConfig, ISiteConfig } from "../../common/utils/configVariables";

export class GraphClient {
   private static client: Client | any = null;
   private static spSiteConfig: ISiteConfig | any = null;

   public static setInstance(_client: Client) {
      if (!GraphClient.client && _client) {
         GraphClient.client = _client;
      } else {
         if (GraphClient.client)
            console.error("GraphClient.setInstance - already there, sjoe");
         else
            console.error("GraphClient.setInstance - whoops...");
      }
      if (!GraphClient.spSiteConfig) {
         const appConfig = getAppConfig();
         GraphClient.spSiteConfig = appConfig.spSite;
      }
   }

   public static getInstance(): { graph: Client, siteConfig: ISiteConfig } {
      if (!GraphClient.client)
         console.error('GraphClient.getInstance - Graph was not init');
      const graph = GraphClient.client;
      const siteConfig = GraphClient.spSiteConfig;
      return { graph, siteConfig };
   }

   public static async getDocLibPath(_folderName: string): Promise<string> {
      const config = GraphClient.spSiteConfig;
      console.log(`START => GraphClient.getDocLibPath - config`);
      console.log(config);
      console.log(`END => GraphClient.getDocLibPath - config`);
      if(!config){
         throw new Error('GraphClient.getDocLibPath -> Config not found!');
      }
      const folderExists = await this.doesFolderExist(_folderName);
      let folderId = 'notFound';
      try {
         if (!folderExists) {
            folderId = await (await this.createFolders(_folderName)).rootFolderId;
         } else {
            let folderResult = await this.client.api(config.docLibRootQuery + '/' + _folderName).get();
            folderId = folderResult.id;
         }
         if (folderId === 'notFound') {
            console.error('GraphClient.getDocLibPath -> Could not find or create folder!');
            return 'notFound';
         }
         return `${config.newItemBaseQuery}/${folderId}`;
      } catch (error: any) {
         return 'notFound';
      }
   }

   public static async doesFolderExist(_folderName: string): Promise<boolean> {
      const config = GraphClient.spSiteConfig;
      if(!config){
         throw new Error('GraphClient.doesFolderExist -> Config not found!');
      }

      let folderExists = true;
      try {
         let folderId = '';
         let tmp = await this.client.api(config.docLibRootQuery + '/' + _folderName).get().catch((error: any) => {
            if (error.statusCode === 404) {
               folderExists = false
            }
         });
         return folderExists;
      } catch (error: any) {
         console.log('GraphClient.doesFolderExist -> Does not exist');
         return false;
      }
   }

   public static async createFolders(_folderName: string): Promise<{ rootFolderId: string, supportingDocsFolderId: string }> {
      const config = GraphClient.spSiteConfig;

      let rootFolderId = 'notFound';
      let supportingDocsFolderId = 'notFound';
      try {

         await this.client.api(config.newRequestFolderQuery).post({
            "name": _folderName,
            "folder": {},
            "@microsoft.graph.conflictBehavior": "rename"
         }).then(async (requestfolderResult:any) => {
            rootFolderId = requestfolderResult ? requestfolderResult.id : 'notFound';
            console.log(`requestfolderResult`);
            console.log(requestfolderResult);
            let supportingDocsFolder = await this.client.api(`${config.newItemBaseQuery}/${rootFolderId}/children`).post({
               "name": 'supportingDocs',
               "folder": {},
               "@microsoft.graph.conflictBehavior": "rename"
            });
            supportingDocsFolderId = supportingDocsFolder ? supportingDocsFolder.id : 'notFound';
         });
         return { rootFolderId: rootFolderId, supportingDocsFolderId: supportingDocsFolderId };
      } catch (error: any) {
         console.error('GraphClient.createFolders -> Could not create folders!');
         return { rootFolderId: 'notFound', supportingDocsFolderId: 'notFound' };
      }
   }

   public static async uploadLargeFile(file: File, url: string, progressCallback?: (range?: Range | any, extraCallbackParam?: unknown) => void) {
      try {
         const payload = {
            item: {
               "@microsoft.graph.conflictBehavior": "replace",
               name: file.name,
            },
         };

         const defaultProgress = (range?: Range | any, extraCallbackParam?: unknown) => {
            // Implement the progress callback here

            console.log("uploading range: ", range);
            console.log(extraCallbackParam);
         };
         const progress = progressCallback ? progressCallback : defaultProgress;
         const uploadEventHandlers: UploadEventHandlers = {
            progress,
            extraCallbackParam: "any parameter needed by the callback implementation",
         };

         const options: LargeFileUploadTaskOptions = {
            rangeSize: 1024 * 1024,
            uploadEventHandlers,
         };


         const fileObject = new FileUpload(file, file.name, file.size);

         const uploadSession = await LargeFileUploadTask.createUploadSession(this.client, url, payload);
         const uploadTask = new LargeFileUploadTask(this.client, fileObject, uploadSession, options);
         const response = await uploadTask.upload();
         return response;

      } catch (error: any) {
         throw new Error(error);
      }
   }
}