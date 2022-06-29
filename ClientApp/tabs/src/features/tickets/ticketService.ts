import { IUpdateActionModel } from '../../components/common/actionLog/types';
import { baseApi } from '../../services';
import { ITicketModel } from './types';

export const ticketService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      createStatusAction: build.mutation<null, Partial<IUpdateActionModel> & { id: string, parentId: string }>({
         query(body) {
            const { parentId } = body;
            return {
               url: `/Ticket/Action/Add/${parentId}`,
               method: 'POST',
               body,
            };
         },
      }),
      updateTicketStatus: build.mutation<null, { id: string, groupId: string, state: number }>({ 
         query(body) {
            const { id, groupId } = body;
            return {
               url: `/Ticket/Edit/${groupId}/${id}`,
               method: 'PUT',
               body,
            };
         }
      }),
      updateTicketAssignment: build.mutation<null, ITicketModel>({
         query(body) {
            const { id, groupId } = body;
            return {
               url: `/Ticket/Edit/${groupId}/${id}`,
               method: 'PUT',
               body,
            };
         }
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: caseEndpoints,
   useCreateStatusActionMutation,
   useUpdateTicketStatusMutation,
   useUpdateTicketAssignmentMutation,
} = ticketService;