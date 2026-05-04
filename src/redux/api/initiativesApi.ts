import { InitiativeDTO } from '../../api/generated/register';
import { baseApi } from './baseApi';

/**
 * Initiatives API slice.
 * This layer exposes initiative-related endpoints via RTK Query.
 */
export const initiativesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInitiatives: builder.query<Array<InitiativeDTO>, void>({
      query: () => ({
        url: '/initiatives',
        method: 'GET',
      }),
      providesTags: ['Initiatives'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetInitiativesQuery } = initiativesApi;
