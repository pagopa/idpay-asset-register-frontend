jest.mock('../../../utils/env', () => ({
  __esModule: true,
  default: {
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
    PRODUCTS: '/prodotti'
  },
  BASE_ROUTE: '/base'
}));
jest.mock('../../../api/registerApiClient', () => ({
  RegisterApi: {
    getProducts: jest.fn(),
    getBatchFilterItems: jest.fn(),
  },
}));
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import OneTrustContentWrapper from '../OneTrustContentWrapper';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for OneTrustContentWrapper', () => {
  test('render OneTrustContentWrapper', () => {
    renderWithContext(<OneTrustContentWrapper idSelector={''} />);
  });
});
