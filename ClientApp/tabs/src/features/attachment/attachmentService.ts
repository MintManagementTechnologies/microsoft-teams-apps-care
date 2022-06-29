import { baseApi } from '../../services';
import { IAttachmentModel } from './types';


export const attachmentService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      // getAttachment: build.query<IAttachmentModel, string>({
      //    query: () => `/Case/attachment/download/case/filename`,
      // }),
      uploadAttachment: build.mutation<IAttachmentModel, IAttachmentModel>({
         query: (body) => { 
            const { parentId } = body;
            // Build the form data to post
            const formData = new FormData();
            formData.append('file', body.file);
            formData.append('type', body.file.type);
            formData.append('name', body.file.name);

            return { 
               url: `/Case/attachment/add/${parentId}`,
               method: 'POST',
               body: formData
            }
         },
      }),
      deleteAttachment: build.mutation<boolean, { caseId: string, fileName: string }>({
         query: ({caseId, fileName}) => {
            return {
               url: `/Case/attachment/delete/${caseId}/${fileName}`,
               method: 'DELETE'
            }
         } 
      }),
   }),
});

// export const attachmentService = baseGraphApi.injectEndpoints({
//    endpoints: (build) => ({
//       getAttachment: build.query<IFile, string>({
//          async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
//             let result: any;
//             const folderName = _arg;
//             try {
//                const { graph, siteConfig } = GraphClient.getInstance();
//                if (!graph)
//                   throw new Error("No graph client defined");
//                let folderExists = true;
//                let files = await graph.api(siteConfig.docLibRootQuery + '/' + folderName + ':/children').get().catch((error: IGraphError) => {
//                   if (error.statusCode === 404) {
//                      folderExists = false
//                   }
//                });
//                if (!folderExists)
//                   files = { value: [] };
//                const allAttachments = transformFileResult(files, folderName);
//                result = allAttachments.length > 0 ? allAttachments[0] : undefined;
//                return { data: result };
//             } catch (error: any) {
//                return {
//                   error: {
//                      status: error.statusCode,
//                      error: error.message
//                   }
//                }
//             }
//          },
//          providesTags: ['Attachment'],
//       }),
//       getAllAttachments: build.query<IFile[], string>({
//          async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
//             let result: any;
//             const folderName = _arg;
//             tmpArg = folderName;
//             try {
//                const { graph, siteConfig } = GraphClient.getInstance();
//                if (!graph)
//                   throw new Error("No graph client defined");
//                let folderExists = true;
//                let files = await graph.api(siteConfig.docLibRootQuery + '/' + folderName + ':/children').get().catch((error: IGraphError) => {
//                   if (error.statusCode === 404) {
//                      folderExists = false
//                   }
//                });
//                if (!folderExists)
//                   files = { value: [] };
//                result = transformFileResult(files, folderName);
//                return { data: result };
//             } catch (error: any) {
//                return {
//                   error: {
//                      status: error.statusCode,
//                      error: error.message
//                   }
//                }
//             }
//          },
//          providesTags: cacher.providesList("Attachments"),
//       }),
//       getAttachments: build.query<IFile[], string>({
//          async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
//             let result: any;
//             const folderName = _arg;
//             try {
//                const { graph, siteConfig } = GraphClient.getInstance();
//                if (!graph)
//                   throw new Error("No graph client defined");
//                let folderExists = true;
//                let files = await graph.api(siteConfig.docLibRootQuery + '/' + folderName + ':/children').get().catch((error: IGraphError) => {
//                   if (error.statusCode === 404) {
//                      folderExists = false
//                   }
//                });
//                if (!folderExists)
//                   files = { value: [] };
//                result = transformFileResult(files, folderName);
//                return { data: result };
//             } catch (error: any) {
//                return {
//                   error: {
//                      status: error.statusCode,
//                      error: error.message
//                   }
//                }
//             }
//          },
//          providesTags: cacher.providesList("Attachments"),
//       }),
//       uploadAttachment: build.mutation<IFile, IFile>({
//          async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
//             let result: IFile;
//             const { id, file, parentId, docType } = _arg;
//             try {
//                if (!file)
//                   throw new Error('attachmentService.uploadAttachment -> File Control is null!');

//                const folderPath = await GraphClient.getDocLibPath(parentId || id);
//                if (folderPath === 'notFound') {
//                   throw new Error('attachmentService.uploadAttachment -> Could not find folderPath!');
//                }

//                const largeFileUploadSessionUrl = `${folderPath}:/${file.name}:/createUploadSession`;

//                const largeFileUpload = await GraphClient.uploadLargeFile(file, largeFileUploadSessionUrl);

//                let fileObj: IFile = {
//                   uploaded: true,
//                   progress: 0,
//                   parentId: _arg.parentId,
//                   docType: _arg.docType,
//                   id: _arg.id,
//                   title: _arg.title,
//                   file: { name: file.name, size: file.size } as any,
//                   fileId: (largeFileUpload.responseBody as any).id,
//                   downloadUrl: (largeFileUpload.responseBody as any)["@content.downloadUrl"],
//                   webUrl: (largeFileUpload.responseBody as any).webUrl,
//                   createdTimestamp: new Date((largeFileUpload.responseBody as any).lastModifiedDateTime).getTime(),
//                   modifiedTimestamp: new Date((largeFileUpload.responseBody as any).lastModifiedDateTime).getTime(),
//                   active: true
//                }

//                return { data: fileObj };
//             } catch (error: any) {
//                return {
//                   error: {
//                      status: error.statusCode,
//                      error: error.message
//                   }
//                }
//             }
//          },
//          async onQueryStarted(_arg: IFile, { dispatch, queryFulfilled }) {
//             // `updateQueryData` requires the endpoint name and cache key arguments,
//             // so it knows which piece of cache state to update
//             const patchResult = dispatch(
//                attachmentService.util.updateQueryData('getAllAttachments', _arg.parentId, draftItems => {
//                   draftItems.push({
//                      ..._arg,
//                      file: { name: _arg.file.name, size: _arg.file.size } as any,
//                   });
//                })
//             )
//             try {
//                await queryFulfilled
//             } catch {
//                patchResult.undo()
//             }
//          },
//          invalidatesTags: ['Attachments']
//       }),
//       deleteAttachment: build.mutation<boolean, { requestId: string, fileId: string }>({
//          async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
//             try {
//                const { graph, siteConfig } = GraphClient.getInstance();
//                await graph.api(siteConfig.newItemBaseQuery + '/' + _arg.fileId).delete();
//                return { data: true }
//             } catch (error: any) {
//                return {
//                   error: {
//                      status: error.statusCode,
//                      error: error.message
//                   }
//                }
//             }
//          },
//          async onQueryStarted(_arg: { requestId: string, fileId: string }, { dispatch, queryFulfilled }) {
//             // `updateQueryData` requires the endpoint name and cache key arguments,
//             // so it knows which piece of cache state to update
//             const patchResult = dispatch(
//                attachmentService.util.updateQueryData('getAllAttachments', _arg.requestId, draftItems => {
//                   // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
//                   const draftIndex = draftItems.findIndex((x: IFile) => x.fileId === _arg.fileId);
//                   //delete draftItems[draftIndex];
//                   if (draftIndex > -1) {
//                      draftItems.splice(draftIndex, 1);
//                   }
//                })
//             )
//             try {
//                await queryFulfilled
//             } catch {
//                patchResult.undo()
//             }
//          },
//          //invalidatesTags: ['Attachments']
//       }),
//    }),
// });

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: attachmentEndpoints,
   //useGetAttachmentQuery,
   useUploadAttachmentMutation,
   useDeleteAttachmentMutation
} = attachmentService

