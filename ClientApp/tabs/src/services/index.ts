import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { cacher } from '../common/utils/rtkQueryCacheUtils';
import { getApiBaseUrl } from '../common/utils/sharedFunctions';

export const baseApi = createApi({
   baseQuery: fetchBaseQuery({
      baseUrl: getApiBaseUrl(true),
      prepareHeaders: (headers, { getState }) => {
         // If we have a token set in state, let's assume that we should be passing it.
         headers.set('authorization', process.env.REACT_APP_APIENDPOINT_TOKEN ?? 'c940e013-e7c9-4f7b-870b-be07b70d311f')
         return headers
      }
   }),
   endpoints: () => ({}),
});

export const baseGraphApi = createApi({
   reducerPath: "graphapi",
   baseQuery: fetchBaseQuery({ baseUrl: `` }),
   tagTypes: [...cacher.defaultTags, "Attachment", "Attachments"],
   endpoints: () => ({}),
});