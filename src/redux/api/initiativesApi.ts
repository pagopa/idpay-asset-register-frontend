import { InitiativeDTO } from '../../api/generated/register';
import { baseApi } from './baseApi';

/**
 * Mock initiatives response (temporary).

const initiativesMock: Array<InitiativeDTO> = [
  {
    initiativeId: '68dd003ccce8c534d1da22bc',
    initiativeName: 'Bonus Elettrodomestici',
    status: 'PUBLISHED',
    startDate: '2025-10-01',
    endDate: '2027-01-01',
    enabled: true,
  },
  {
    initiativeId: '68de7fc681ce9e35a476e985',
    initiativeName: 'Bonus Elettrodomestici - test',
    status: 'PUBLISHED',
    startDate: '2025-10-01',
    endDate: '2027-01-01',
    enabled: true,
  },
];
 */
export const initiativesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInitiatives: builder.query<Array<InitiativeDTO>, void>({
      query: () => ({
        url: '/initiatives',
        method: 'GET',
      }),
      // queryFn: async () => ({ data: initiativesMock }),

      /**
       * REAL CALL (when backend is available)
       * query: () => ({
       *   url: '/initiatives',
       *   method: 'GET',
       * }),
       */

      providesTags: ['Initiatives'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetInitiativesQuery } = initiativesApi;
