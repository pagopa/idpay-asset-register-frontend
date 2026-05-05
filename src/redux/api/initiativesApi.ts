import { InitiativeDTO } from '../../api/generated/register';
import { baseApi } from './baseApi';

/**
 * Initiatives API slice.
 * This layer exposes initiative-related endpoints via RTK Query.
 */
/**
 * Mock initiatives response (temporary).
 * NOTE: InitiativeDTO includes only a subset of fields, so we map/keep only those.
 */
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

export const initiativesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInitiatives: builder.query<Array<InitiativeDTO>, void>({
      /**
       * MOCK (current)
       * - no HTTP call is performed
       * - RTK Query returns initiativesMock as successful response
       */
      queryFn: async () => ({ data: initiativesMock }),

      /**
       * REAL CALL (when backend is available) - replace the MOCK above with this:
       *
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
