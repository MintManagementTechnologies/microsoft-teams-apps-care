import { ITicketFilter } from '../../common/types/ticketFilter';
import { IUpdateActionModel } from '../../components/common/actionLog/types';
import { baseApi } from '../../services';
import { ITicketModel } from '../tickets/types';
import { IITTicketModel } from './types';

export const ticketsService = baseApi.injectEndpoints({ 
   endpoints: (build) => ({
      getTicket: build.query<IITTicketModel, {groupId: string, id: string}>({
         query: ({groupId, id}) => `/Ticket/Details/${groupId}/${id}`,
      }),
      getAllTickets: build.query<IITTicketModel[], void>({
         query: () => `/Ticket`,
      }),
      getAllTicketsFiltered: build.query<IITTicketModel[], { groupId: string, filter: ITicketFilter } >({
         query: ({ groupId, filter }) => {

            return {
               url: `/Ticket/Filter/${groupId}`,
               method: 'POST',
               body: filter
            }
         },
      }),
      createTicket: build.mutation<IITTicketModel, Partial<IITTicketModel> & {id: string}>({
         query(body) {
            let { id, groupId } = body;
            if (groupId == undefined || groupId === null || groupId === '') groupId = (process.env.REACT_APP_ITSUPPORT_GROUPID ?? '');
            return {
               url: `/Ticket/Add/${groupId}/${id}`,
               method: 'POST',
               body
            };
         },
         async onQueryStarted(_arg: Partial<IITTicketModel> & {groupId: string, id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
                ticketsService.util.updateQueryData('getTicket', {groupId: _arg.groupId, id: _arg.id}, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as IITTicketModel;
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
               url: `/Ticket/Action/Add/${parentId}`,
               method: 'POST',
               body,
            };
         },
         async onQueryStarted(statusAction: Partial<IUpdateActionModel> & {id: string, parentId: string, groupId: string}, { dispatch, queryFulfilled }) {
            const patchResult = dispatch(
                ticketsService.util.updateQueryData('getTicket', { id: statusAction.parentId, groupId: statusAction.groupId }, draftItem => {
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
      updateTicket: build.mutation<null, Partial<IITTicketModel> & {id: string}>({
         query(body) {
            const { id, groupId } = body;
            return {
               url: `/Ticket/Edit/${groupId}/${id}`,
               method: 'PUT',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<IITTicketModel> & {id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
                ticketsService.util.updateQueryData('getTicket', { id: _arg.id, groupId: _arg.groupId ?? '' }, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as IITTicketModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      deleteTicket: build.mutation<void, {groupId: string, id: string}>({
         query({groupId, id}) {
            return {
               url: `Delete/${groupId}/${id}`,
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
   useGetTicketQuery,
   useLazyGetTicketQuery,
   useGetAllTicketsQuery,
   useCreateTicketMutation,
   useCreateStatusActionMutation,
   useUpdateTicketMutation,
   useDeleteTicketMutation,
   useGetAllTicketsFilteredQuery,
   useLazyGetAllTicketsFilteredQuery
} = ticketsService;