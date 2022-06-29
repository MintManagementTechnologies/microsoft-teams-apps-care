import { baseApi } from ".";
import { ITicketCategory } from "../common/types/ticketCategory";
export const ticketCategoryService = baseApi.injectEndpoints({
    endpoints: (build) => ({
       getTicketCategories: build.query<ITicketCategory[], string>({
        query: (search) => ({ url: `/TicketCategory?${search}` })
       })
    }),
 });

 export const {
    endpoints: townEndpoints,
    useGetTicketCategoriesQuery,
    useLazyGetTicketCategoriesQuery
 } = ticketCategoryService;
 