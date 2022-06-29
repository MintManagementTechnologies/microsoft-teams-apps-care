import { ICustomerCaseFilter } from '../../common/types/customerCaseFilter';
import { IUpdateActionModel } from '../../components/common/actionLog/types';
import { baseApi } from '../../services';
import { ICustomerCaseModel } from './types';

export const customerCaseService = baseApi.injectEndpoints({ 
   endpoints: (build) => ({
      getCustomerCase: build.query<ICustomerCaseModel, {groupId: string, id: string}>({
         query: ({groupId, id}) => `/Case/Details/${groupId}/${id}`,
      }),
      getAllCustomerCases: build.query<ICustomerCaseModel[], void>({
         query: () => `/Case`,
      }),
      getAllCustomerCasesFiltered: build.query<ICustomerCaseModel[], { groupId: string, filter: ICustomerCaseFilter } >({
         query: ({ groupId, filter }) => {

            return {
               url: `/Case/Filter/${groupId}`,
               method: 'POST',
               body: filter
            }
         },
      }),
      getCustomerCasesByActor: build.query<ICustomerCaseModel[], string>({
         query: (upn) => `customers`,
      }),
      createCustomerCase: build.mutation<ICustomerCaseModel, Partial<ICustomerCaseModel> & {id: string}>({
         query(body) {
            let { id, groupId } = body;
            if (groupId == undefined || groupId === null || groupId === '') groupId = (process.env.REACT_APP_CUSTOMERCARE_GROUPID ?? '');
            return {
               url: `/Case/Add/${groupId}/${id}`,
               method: 'POST',
               body
            };
         },
         async onQueryStarted(_arg: Partial<ICustomerCaseModel> & {groupId: string, id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               customerCaseService.util.updateQueryData('getCustomerCase', {groupId: _arg.groupId, id: _arg.id}, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as ICustomerCaseModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      createStatusAction: build.mutation<null, Partial<IUpdateActionModel> & {id: string, parentId: string, groupId: string}>({
         query(body) {
            const { parentId } = body;
            return {
               url: `/Case/Action/Add/${parentId}`,
               method: 'POST',
               body,
            };
         },
         async onQueryStarted(statusAction: Partial<IUpdateActionModel> & {id: string, parentId: string, groupId: string}, { dispatch, queryFulfilled }) {
            const patchResult = dispatch(
               customerCaseService.util.updateQueryData('getCustomerCase', { id: statusAction.parentId, groupId: statusAction.groupId }, draftItem => {
                  //draftItem.updates?.push(statusAction);
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      updateCustomerCase: build.mutation<null, Partial<ICustomerCaseModel> & {id: string}>({
         query(body) {
            const { id, groupId } = body;
            return {
               url: `/Case/Edit/${groupId}/${id}`,
               method: 'PUT',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<ICustomerCaseModel> & {id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               customerCaseService.util.updateQueryData('getCustomerCase', { id: _arg.id, groupId: _arg.groupId ?? '' }, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as ICustomerCaseModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      deleteCustomerCase: build.mutation<void, string>({
         query(id) {
            return {
               url: `customers/${id}`,
               method: 'DELETE',
            };
         }
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: customerCaseEndpoints,
   useGetCustomerCaseQuery,
   useLazyGetCustomerCaseQuery,
   useGetAllCustomerCasesQuery,
   useGetCustomerCasesByActorQuery,
   useCreateCustomerCaseMutation,
   useCreateStatusActionMutation,
   useUpdateCustomerCaseMutation,
   useDeleteCustomerCaseMutation,
   useGetAllCustomerCasesFilteredQuery,
   useLazyGetAllCustomerCasesFilteredQuery
} = customerCaseService;