
import { Client } from "@microsoft/microsoft-graph-client";
import { baseGraphApi } from "..";
import { IGraphUserResult, IGraphUserModel, IGraphBatchResult, IGraphError, IGraphResult, IGraphChannelMemberValue, IGraphChannelValue } from "../../common/types/graphApiResult";
import { IDetailedUserModel, ITeamChannelDetail, ITeamChannelMember } from "../../common/types/user";
import { defaultErrors } from "../../common/utils/commonVariables";
import { distinct } from "../../common/utils/sharedFunctions";
import { GraphClient } from "./graphClientService";


interface IDebugUsers {
   owners: ITeamChannelMember[],
   members: ITeamChannelMember[]

}

const dbgUsers : IDebugUsers = {
   owners: [
      { displayName: "Team Lead 1", id: "1234333", upn: "tl1@mintgroup.net" },
      { displayName: "Team Lead 2", id: "1334333", upn: "tl1@mintgroup.net" }
   ],
   members: [
      { displayName: "Team Lead 1", id: "1234333", upn: "tl1@mintgroup.net" },
      { displayName: "Team Lead 2", id: "1334333", upn: "tl1@mintgroup.net" },
      { displayName: "User 1 Member", id: "123456789", upn: "user1@mintgroup.net" },
      { displayName: "User 2 Member", id: "1333232", upn: "user2@mintgroup.net" },
      { displayName: "User 3 Member", id: "13332888", upn: "user3@mintgroup.net" }
   ]

};

const getBatchGraphUserPresenceAndPhotos =
   async (users: IGraphUserResult[], graph: Client)
      : Promise<IGraphUserModel[]> => {
      let batchRequest = {
         requests: users.filter((x: IGraphUserResult) => !x.userPrincipalName.includes('#')).map((x: IGraphUserResult, index: number) => (
            {
               id: x.id,
               method: "GET",
               url: `/users/${x.id}/photos/48x48/$value`,
               headers: {
                  "Content-Type": "image/jpg"
               }
            })) as any[]
      }
      let presencerequestBody = { ids: users.filter((x: IGraphUserResult) => !x.userPrincipalName.includes('#')).map((x: IGraphUserResult) => x.id) };
      batchRequest.requests.push({
         id: 'presenceRequest',
         method: "POST",
         url: `/communications/getPresencesByUserId`,
         body: presencerequestBody,
         headers: {
            "Content-Type": "application/json"
         }
      });

      let batchResults: IGraphBatchResult = await graph.api('/$batch').post(batchRequest).catch((error: any) => {
         console.error('GraphClient - getBatchUsersPhotoAndPresence - Batch Request');
         console.error(error.statusCode);
      });

      return users.map((x: IGraphUserResult) => {
         if (x.userPrincipalName.includes('#'))
            return x;
         const imageBatchResponse = batchResults.responses.find((y: any) => y.id === x.id);
         let hasImage = false;
         if (imageBatchResponse) hasImage = imageBatchResponse.status === 200;

         const blobUrl = imageBatchResponse && hasImage ? `data:image/jpg;base64,${imageBatchResponse.body}` : undefined;

         const presenceBatchResponse = batchResults.responses.find((y: any) => y.id === 'presenceRequest');
         const availability = presenceBatchResponse ?
            presenceBatchResponse.body.value.find((y: any) => y.id === x.id).availability
            : 'PresenceUnknown';

         return {
            activity: availability,
            availability: availability,
            image: blobUrl,
            ...x
         }
      })
   }

const transformGraphUserBatchResult = (rawData: IGraphUserModel[]): IDetailedUserModel[] => {
   return rawData.map((x: IGraphUserModel) => ({
      upn: x.userPrincipalName.toLowerCase(),
      firstName: x.givenName,
      lastName: x.surname,
      jobTitle: x.jobTitle,
      department: x.department,
      active: true,
      id: x.id,
      title: x.displayName,
      createdTimestamp: new Date().getTime(),
      modifiedTimestamp: new Date().getTime(),
      image: x.image,
      availability: x.availability,
      activity: x.activity
   })) as IDetailedUserModel[];
}

const transformBasicGraphUsersResult = (rawData: IGraphUserResult[]): IDetailedUserModel[] => {
   return rawData.map((x: IGraphUserResult) => ({
      upn: x.userPrincipalName.toLowerCase(),
      firstName: x.givenName,
      lastName: x.surname,
      jobTitle: x.jobTitle,
      department: x.department,
      active: true,
      id: x.id,
      title: x.displayName,
      createdTimestamp: new Date().getTime(),
      modifiedTimestamp: new Date().getTime()
   }));
}

export const graphApiService = baseGraphApi.injectEndpoints({
   endpoints: (build) => ({
      searchGraphUsers: build.query<IDetailedUserModel[], string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const selectedFields = `department,jobTitle,id,userPrincipalName,displayName,surname,givenName`;
               const searchQuery = `"displayName:${_arg}" OR "mail:${_arg}"`;
               const searchPath = `/users?$search=${searchQuery}&$select=${selectedFields}`;
               let searchResult = await graph.api(searchPath).header("ConsistencyLevel", "eventual").get();
               let usersResult = await getBatchGraphUserPresenceAndPhotos(searchResult.value as IGraphUserResult[], graph);
               const result = transformGraphUserBatchResult(usersResult);
               return result
                  ? { data: result.sort((x: any) => x.title) }
                  : defaultErrors.rtkApi.GRAPH.SEARCH_USERS
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }

            }
         },
      }),
      getGraphUser: build.query<IDetailedUserModel, string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let searchResult = await graph.api(`/users/${_arg}?$select=department,jobTitle,id,userPrincipalName,displayName,surname,givenName`).get();
               return searchResult
                  ? { data: transformBasicGraphUsersResult([searchResult])[0] }
                  : defaultErrors.rtkApi.GRAPH.SEARCH_USERS
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),
      getGraphUserWithPhoto: build.query<IDetailedUserModel, string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let searchResult = await graph.api(`/users/${_arg}?$select=department,jobTitle,id,userPrincipalName,displayName,surname,givenName`).get();
               let photoResult = await graph.api(`/users/${_arg}/photos/48x48/$value`).header("Content-Type", "image/jpg").get();
               let imgURL = URL.createObjectURL(photoResult);
               return searchResult
                  ? {
                     data: transformGraphUserBatchResult([{
                        ...searchResult,
                        image: imgURL
                     }])[0]
                  }
                  : defaultErrors.rtkApi.GRAPH.SEARCH_USERS
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),
      getManyGraphUsers: build.query<IDetailedUserModel[], string[]>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const distinctUsers = _arg.filter(distinct);
               const batchRequest = {
                  requests: distinctUsers.map((x, index) => (
                     {
                        id: (index + 1).toString(),
                        method: "GET",
                        url: '/users/' + x
                     }))
               }
               let usersBatchResult = await graph.api('/$batch').post(batchRequest).catch((error: IGraphError) => {
                  console.error('graphApiService - getGraphUsers - Batch Request');
                  console.error(error.statusCode);
               });
               let newBatch = usersBatchResult.responses.map((x: any) => x.body);
               let usersResult = await getBatchGraphUserPresenceAndPhotos(newBatch as IGraphUserResult[], graph);
               return usersResult
                  ? { data: transformGraphUserBatchResult(usersResult).sort((x: any) => x.title) }
                  : defaultErrors.rtkApi.GRAPH.SEARCH_USERS
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }

            }
         },
      }),
      getGraphUserManager: build.query<IDetailedUserModel, string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let result: IGraphUserResult = await graph.api(`/users/${_arg}/manager`).get() as IGraphUserResult;

               return result
                  ? { data: transformBasicGraphUsersResult([result]) }
                  : defaultErrors.rtkApi.GRAPH.SEARCH_USERS
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),
      getBatchGraphUserPresenceAndPhotos: build.query<any[], void>({
         query: () => `/`,
      }),
      getAllTeamChannels: build.query<IGraphChannelValue[], string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            const teamId = _arg || '5a927ff3-ba7e-4d6f-a6cd-7cc4982f4c91';
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let searchResult: IGraphResult = await graph.api(`/teams/${teamId}/channels`).get();
               return searchResult
                  ? { data: searchResult.value }
                  : defaultErrors.rtkApi.GRAPH.SEARCH_USERS
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),
      getAllChannelMembers: build.query<IGraphChannelMemberValue[], { teamId: string, channelId: string }>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            const { teamId, channelId } = _arg;
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let searchResult: IGraphResult = await graph.api(`/teams/${teamId}/channels/${channelId}/members`).get();
               return searchResult
                  ? { data: searchResult.value }
                  : defaultErrors.rtkApi.GRAPH.SEARCH_USERS
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),
      getTeamChannelData: build.query<ITeamChannelDetail[], string>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            const groupId = _arg || '5a927ff3-ba7e-4d6f-a6cd-7cc4982f4c91';
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               const result: ITeamChannelDetail[] = [];
               const searchChannelResult: IGraphResult = await graph.api(`/teams/${groupId}/channels`).get();
               const teamChannels = searchChannelResult.value || [];
               
               for (let channel of teamChannels) {

                  const searchChannelMemberResult: IGraphResult = await graph.api(`/teams/${groupId}/channels/${channel.id}/members`).get();
                  const channelMembers = searchChannelMemberResult.value as IGraphChannelMemberValue[];

                  const addDebugUsers = false;

                  const owners: ITeamChannelMember[] = addDebugUsers ? [...dbgUsers.owners] : [];
                  const members: ITeamChannelMember[] = addDebugUsers ? [...dbgUsers.members] : [];
                  
                  channelMembers.forEach(member => {
                     if (!!member.roles && member.roles?.indexOf('owner') >= 0) {
                        owners.push({ id: member!.userId, upn: member.email, displayName: member.displayName });
                     }
                     members.push({ id: member!.userId, upn: member.email, displayName: member.displayName });
                  });
                  const teamChannelDetail: ITeamChannelDetail = {
                     id : channel.id || '' , 
                     displayName : channel.displayName || '', 
                     owners: owners,
                     members: members,
                     actualName: channel.displayName
                  }
                  result.push(teamChannelDetail);
               }
               return { data: result } ;
              
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),
      getTeamMemberManager: build.query<ITeamChannelMember, { id: string}>({
         async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
            const { id } = _arg;
            try {
               const { graph } = GraphClient.getInstance();
               if (!graph)
                  throw new Error("No graph client defined");
               let searchResult: IGraphResult = await graph.api(`/users/${id}/manager`).get();
               let result: ITeamChannelMember | undefined;
               
               if (!!searchResult) {
                  result = {
                     //@ts-ignore
                     displayName : searchResult.displayName,
                     //@ts-ignore
                     id: searchResult.id || '',
                     //@ts-ignore
                     upn: searchResult.mail
                  }
               }

               return searchResult
                  ? { data: result }
                  : defaultErrors.rtkApi.GRAPH.SEARCH_USERS
            } catch (error: any) {
               return {
                  error: {
                     status: error.statusCode,
                     error: error.message
                  }
               }
            }
         },
      }),

   })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: graphApiEndpoints,
   useSearchGraphUsersQuery,
   useLazySearchGraphUsersQuery,
   useGetGraphUserQuery,
   useGetGraphUserWithPhotoQuery,
   useGetManyGraphUsersQuery,
   useLazyGetManyGraphUsersQuery,
   useGetGraphUserManagerQuery,
   useGetBatchGraphUserPresenceAndPhotosQuery,
   useGetAllTeamChannelsQuery,
   useLazyGetAllChannelMembersQuery,
   useGetTeamChannelDataQuery,
   useLazyGetTeamChannelDataQuery,
   useGetTeamMemberManagerQuery,
   useLazyGetTeamMemberManagerQuery
} = graphApiService
