import { InitiativeDTO } from '../../api/generated/register';
import { baseApi } from './baseApi';

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
