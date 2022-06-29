import { IUserModel } from '../../common/types/user';
import { baseApi } from '../../services';

export const userService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      getUser: build.query<IUserModel, string>({
         query: (userId) => `users/${userId}`,
      }),
      getAllUsers: build.query<IUserModel, void>({
         query: () => `users`,
      }),
      createUser: build.mutation<IUserModel, Partial<IUserModel> & {id: string}>({
         query(body) {
            return {
               url: `users`,
               method: 'POST',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<IUserModel> & {id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               userService.util.updateQueryData('getUser', _arg.id, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as IUserModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      updateUser: build.mutation<IUserModel, Partial<IUserModel> & {id: string}>({
         query(body) {
            const { id } = body;
            return {
               url: `users/${id}`,
               method: 'PUT',
               body,
            };
         },
         async onQueryStarted(_arg: Partial<IUserModel> & {id: string}, { dispatch, queryFulfilled }) {
            // `updateQueryData` requires the endpoint name and cache key arguments,
            // so it knows which piece of cache state to update
            const patchResult = dispatch(
               userService.util.updateQueryData('getUser', _arg.id, draftItem => {
                  // The `draftItems` is Immer-wrapped and can be "mutated" like in createSlice
                  draftItem = _arg as IUserModel;
               })
            )
            try {
               await queryFulfilled
            } catch {
               patchResult.undo()
            }
         }
      }),
      deleteUser: build.mutation<void, string>({
         query(id) {
            return {
               url: `users/${id}`,
               method: 'DELETE',
            };
         }
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: userEndpoints,
   useGetUserQuery,
   useGetAllUsersQuery,
   useCreateUserMutation,
   useUpdateUserMutation,
   useDeleteUserMutation,
} = userService;
