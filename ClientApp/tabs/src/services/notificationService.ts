import { baseApi } from ".";


export const notificationService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      sendNotification: build.mutation<null, { id: string, title: string, description: string, casenumber: string, requestor: string, assignedto: string, type: string}>({
         query(body) {
            const { id, title, description, casenumber, requestor, assignedto, type } = body;
            const queryParams = `id=${id}&title=${title}&description=${description}&casenumber=${casenumber}&requestor=${requestor}&assignedto=${assignedto}&type=${type}`
            return {
               url: `/api/notify/case?${queryParams}`,
               method: 'POST',
               body,
            };
         },
      }),
      sendNotificationJson: build.mutation<null, { adaptiveCardJson: string, users?: string[], channels? :string[] }>({
         query(body) {
            return {
               url: `/api/notify/json`,
               method: 'POST',
               body
            };
         }
      })
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: notificationEndpoints,
   useSendNotificationMutation,
   useSendNotificationJsonMutation
} = notificationService;

