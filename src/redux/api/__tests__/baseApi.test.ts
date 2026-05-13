const mockCreateApi = jest.fn((config) => ({
  config,
  reducerPath: config.reducerPath,
}));
const mockFetchBaseQuery = jest.fn((config) => ({
  config,
}));
const mockTokenRead = jest.fn();

jest.mock('@reduxjs/toolkit/query/react', () => ({
  createApi: (config: any) => mockCreateApi(config),
  fetchBaseQuery: (config: any) => mockFetchBaseQuery(config),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: {
    read: () => mockTokenRead(),
  },
}));

jest.mock('../../../utils/env', () => ({
  ENV: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
  },
}));

describe('baseApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockCreateApi.mockImplementation((config) => ({
      config,
      reducerPath: config.reducerPath,
    }));
    mockFetchBaseQuery.mockImplementation((config) => ({
      config,
    }));
  });

  const loadBaseApiConfig = async () => {
    const { baseApi } = await import('../baseApi');
    const fetchBaseQueryConfig = mockFetchBaseQuery.mock.calls[0][0];
    const createApiConfig = mockCreateApi.mock.calls[0][0];

    return { baseApi, fetchBaseQueryConfig, createApiConfig };
  };

  it('configures RTK Query with base URL, tags and empty endpoints', async () => {
    const { baseApi, fetchBaseQueryConfig, createApiConfig } = await loadBaseApiConfig();

    expect(baseApi.reducerPath).toBe('baseApi');
    expect(fetchBaseQueryConfig.baseUrl).toBe('https://mock-api/register');
    expect(createApiConfig.reducerPath).toBe('baseApi');
    expect(createApiConfig.tagTypes).toEqual(['Initiatives']);
    expect(createApiConfig.endpoints()).toEqual({});
  });

  it('adds Authorization header when a token is available', async () => {
    mockTokenRead.mockReturnValue('test-token');
    const { fetchBaseQueryConfig } = await loadBaseApiConfig();
    const headers = new Headers();

    const result = fetchBaseQueryConfig.prepareHeaders(headers);

    expect(result).toBe(headers);
    expect(headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('does not add Authorization header when token is missing', async () => {
    mockTokenRead.mockReturnValue('');
    const { fetchBaseQueryConfig } = await loadBaseApiConfig();
    const headers = new Headers();

    const result = fetchBaseQueryConfig.prepareHeaders(headers);

    expect(result).toBe(headers);
    expect(headers.has('Authorization')).toBe(false);
  });
});
