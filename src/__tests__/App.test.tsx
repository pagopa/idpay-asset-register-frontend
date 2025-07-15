import App from '../App';
import '../locale';
import { renderWithContext } from '../utils/__tests__/test-utils';

jest.mock('../utils/env', () => ({
  URL_API: {
    OPERATION: 'http://mock-api/register',
  },
  API_TIMEOUT_MS: 10000,
}));

jest.mock('../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home'
  },
  BASE_ROUTE: '/base'
}));

jest.mock('@pagopa/mui-italia/dist/components/Footer/Footer', () => ({
  Footer: () => {},
}));

jest.mock('../services/rolePermissionService', () => ({
  getUserPermission: jest.fn(),
  getPortalConsent: jest.fn(),
  savePortalConsent: jest.fn(),
}));

jest.mock('../api/registerApiClient', () => ({
  registerClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../decorators/withLogin', () => (Component: any) => Component);
jest.mock('../decorators/withSelectedPartyProducts', () => (Component: any) => Component);

const mockAcceptTOS = jest.fn();

jest.mock('../hooks/useTCAgreement', () => jest.fn());
jest.mock('../helpers', () => ({
  fetchUserFromLocalStorage: jest.fn(),
}));

import useTCAgreement from '../hooks/useTCAgreement';
import { fetchUserFromLocalStorage } from '../helpers';
import { INVITALIA } from '../utils/constants';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.clearAllMocks();
});

describe('Test suite for App component', () => {
  test('Render App with TOS accepted and standard user', () => {
    (useTCAgreement as jest.Mock).mockReturnValue({
      isTOSAccepted: true,
      acceptTOS: mockAcceptTOS,
      firstAcceptance: false,
    });

    (fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_role: 'STANDARD',
    });

    renderWithContext(<App />);
  });

  test('Render App with TOS accepted and Invitalia user', () => {
    (useTCAgreement as jest.Mock).mockReturnValue({
      isTOSAccepted: true,
      acceptTOS: mockAcceptTOS,
      firstAcceptance: false,
    });

    (fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_role: INVITALIA,
    });

    renderWithContext(<App />);
  });

  test('Render App with TOS not accepted', () => {
    (useTCAgreement as jest.Mock).mockReturnValue({
      isTOSAccepted: false,
      acceptTOS: mockAcceptTOS,
      firstAcceptance: true,
    });

    (fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_role: 'STANDARD',
    });

    renderWithContext(<App />);
  });

  test('Render App with undefined TOS state', () => {
    (useTCAgreement as jest.Mock).mockReturnValue({
      isTOSAccepted: undefined,
      acceptTOS: mockAcceptTOS,
      firstAcceptance: false,
    });

    (fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_role: 'STANDARD',
    });

    renderWithContext(<App />);
  });
});
