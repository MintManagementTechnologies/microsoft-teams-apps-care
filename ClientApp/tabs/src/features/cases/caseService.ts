import { IUpdateActionModel } from '../../components/common/actionLog/types';
import { baseApi } from '../../services';
import { ICaseModel } from './types';

export const caseService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      createStatusAction: build.mutation<null, Partial<IUpdateActionModel> & { id: string, parentId: string }>({
         query(body) {
            const { parentId } = body;
            return {
               url: `/Case/Action/Add/${parentId}`,
               method: 'POST',
               body,
            };
         },
      }),
      updateCaseStatus: build.mutation<null, { id: string, groupId: string, state: number }>({ 
         query(body) {
            const { id, groupId } = body;
            return {
               url: `/Case/Edit/${groupId}/${id}`,
               method: 'PUT',
               body,
            };
         }
      }),
      updateCaseAssignment: build.mutation<null, ICaseModel>({
         query(body) {
            const { id, groupId } = body;
            return {
               url: `/Case/Edit/${groupId}/${id}`,
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
   useUpdateCaseStatusMutation,
   useUpdateCaseAssignmentMutation,
} = caseService;