import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { ENV } from '../../utils/env';

/**
 * Base API configuration for RTK Query.
 * This layer centralizes:
 * - baseUrl
 * - authorization header handling
 * - tag types
 */
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ENV.URL_API.OPERATION,
    prepareHeaders: (headers) => {
      const token = storageTokenOps.read();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Initiatives'],
  endpoints: () => ({}),
});
