import { baseApi } from '../../services';
import { ICustomerModel } from './types';

export const customerService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      getCustomer: build.query<ICustomerModel, string>({
         query: (id) => `/Case/Customer/${id}`,
      }),
      getAllCustomers: build.query<ICustomerModel, void>({
         query: () => `case/customer`,
      }),
      getCustomersByActor: build.query<ICustomerModel[], string>({
         query: (upn) => `case/customer`,
      }),
      createCustomer: build.mutation<ICustomerModel, Partial<ICustomerModel> & {id: string}>({
         query(body) {
            return {
               url: `case/customer`,
               method: 'POST',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<ICustomerModel> & {id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               customerService.util.updateQueryData('getCustomer', _arg.id, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as ICustomerModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      updateCustomer: build.mutation<ICustomerModel, Partial<ICustomerModel> & {id: string}>({
         query(body) {
            const { id } = body;
            return {
               url: `case/customer/${id}`,
               method: 'PUT',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<ICustomerModel> & {id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               customerService.util.updateQueryData('getCustomer', _arg.id, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as ICustomerModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      deleteCustomer: build.mutation<void, string>({
         query(id) {
            return {
               url: `case/customer/${id}`,
               method: 'DELETE',
            };
         }
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: customerEndpoints,
   useGetCustomerQuery,
   useLazyGetCustomerQuery,
   useGetAllCustomersQuery,
   useGetCustomersByActorQuery,
   useCreateCustomerMutation,
   useUpdateCustomerMutation,
   useDeleteCustomerMutation,
} = customerService;
