jest.mock('../../../utils/env', () => ({
  __esModule: true,
  ENV: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    API_TIMEOUT_MS: {
      OPERATION: 5000,
    },
  },
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home',
    PRODUCTS: '/home/:initiativeId/prodotti',
  },
  BASE_ROUTE: '/base',
}));

jest.mock('../../../api/registerApiClient', () => ({
  RegisterApi: {
    getProducts: jest.fn(),
    getBatchFilterItems: jest.fn(),
  },
}));

export {};

