import { baseApi } from ".";
import { ITown } from "../common/types/town";

export const townService = baseApi.injectEndpoints({
    endpoints: (build) => ({
       getTowns: build.query<ITown[], string>({
        query: (search) => ({ url: `/Town?${search}` })
       })
    }),
 });

 export const {
    endpoints: townEndpoints,
    useGetTownsQuery,
    useLazyGetTownsQuery
 } = townService;
 
 