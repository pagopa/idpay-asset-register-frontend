import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useLogin, userFromJwtToken, userFromJwtTokenAsJWTUser } from '../useLogin';
import { useErrorDispatcher } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { userActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { parseJwt } from '../../utils/jwt-utils';
import { getUserPermission } from '../../services/rolePermissionService';
import { setPermissionsList, setUserRole } from '../../redux/slices/permissionsSlice';
import { Store, AnyAction } from 'redux';
import '@testing-library/jest-dom';

jest.mock('../../utils/env', () => ({
  ENV: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    URL_FE: {
      LOGOUT: 'https://mock-api/logout',
    },
    API_TIMEOUT_MS: 5000,
  },
}));

jest.mock('../../api/registerApiClient', () => ({
  RolePermissionApi: {
    userPermission: jest.fn().mockResolvedValue({data: 'mockedData'}),
    getPortalConsent: jest.fn(),
    savePortalConsent: jest.fn()
  },
}));

// Mock delle dipendenze
jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  useErrorDispatcher: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/config/env', () => ({
  CONFIG: {
    MOCKS: { MOCK_USER: false },
    TEST: { JWT: 'test-jwt-token' },
    URL_FE: { LOGIN: 'http://localhost/login' },
  },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice', () => ({
  userActions: {
    setLoggedUser: jest.fn(),
  },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: {
    read: jest.fn(),
    write: jest.fn(),
  },
  storageUserOps: {
    read: jest.fn(),
    write: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../utils/jwt-utils', () => ({
  parseJwt: jest.fn(),
}));

jest.mock('../../services/rolePermissionService', () => ({
  getUserPermission: jest.fn(),
}));

jest.mock('../../redux/slices/permissionsSlice', () => ({
  setPermissionsList: jest.fn(),
  setUserRole: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('lodash/isEmpty', () => jest.fn());

// Mock di window.location.assign con tipizzazione corretta
const mockLocation = {
  assign: jest.fn(),
  href: 'http://localhost',
  origin: 'http://localhost',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
  replace: jest.fn(),
  toString: jest.fn(() => 'http://localhost'),
  ancestorOrigins: {} as DOMStringList,
};

// Assegna il mock a window.location
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('useLogin hook', () => {
  let mockDispatch: jest.Mock<any, any, any>;
  let mockAddError: jest.Mock<any, any, any>;
  let mockT;
  let store: Store<any, AnyAction>;

  // Mock data
  const mockJwtUser = {
    uid: '123',
    org_fc: 'TAXCODE123',
    name: 'Mario',
    family_name: 'Rossi',
    email: 'mario.rossi@example.com',
    org_name: 'Test Organization',
    org_party_role: 'ADMIN',
    org_role: 'MANAGER',
    org_address: 'Via Test 123',
    org_pec: 'test@pec.com',
    org_vat: 'VAT123',
    org_email: 'org@example.com',
  };

  const mockUser = {
    uid: '123',
    taxCode: 'TAXCODE123',
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@example.com',
    org_name: 'Test Organization',
    org_party_role: 'ADMIN',
    org_role: 'MANAGER',
    org_address: 'Via Test 123',
    org_pec: 'test@pec.com',
    org_taxcode: 'TAXCODE123',
    org_vat: 'VAT123',
    org_email: 'org@example.com',
  };

  const mockPermissions = {
    role: 'ADMIN',
    permissions: [{ name: 'READ' }, { name: 'WRITE' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock store
    store = configureStore({
      reducer: {
        user: (state = {}, ) => state,
        permissions: (state = {}, ) => state,
      },
    });

    mockDispatch = jest.fn();
    mockAddError = jest.fn();
    mockT = jest.fn((key) => key);

    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    useErrorDispatcher.mockReturnValue(mockAddError);
    useTranslation.mockReturnValue({ t: mockT });

    userActions.setLoggedUser.mockReturnValue({ type: 'SET_LOGGED_USER' });
    setUserRole.mockReturnValue({ type: 'SET_USER_ROLE' });
    setPermissionsList.mockReturnValue({ type: 'SET_PERMISSIONS_LIST' });
  });

  const renderHookWithProvider = (hook) => {
    return renderHook(hook, {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
  };

  describe('userFromJwtToken', () => {
    it('should correctly convert JWT token to User object', () => {
      (parseJwt as jest.Mock).mockReturnValue(mockJwtUser);

      const result = userFromJwtToken('test-token');

      expect(parseJwt).toHaveBeenCalledWith('test-token');
      expect(result).toEqual(mockUser);
    });
  });

  describe('userFromJwtTokenAsJWTUser', () => {
    it('should correctly convert JWT token to IDPayUser object', () => {
      (parseJwt as jest.Mock).mockReturnValue(mockJwtUser);

      const result = userFromJwtTokenAsJWTUser('test-token');

      expect(parseJwt).toHaveBeenCalledWith('test-token');
      expect(result).toEqual(mockUser);
    });
  });

  describe('attemptSilentLogin', () => {
    it('should handle mock user scenario', async () => {
      CONFIG.MOCKS.MOCK_USER = true;
      parseJwt.mockReturnValue(mockJwtUser);
      getUserPermission.mockResolvedValue(mockPermissions);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      expect(parseJwt).toHaveBeenCalledWith(CONFIG.TEST.JWT);
      expect(storageTokenOps.write).toHaveBeenCalledWith(CONFIG.TEST.JWT);
      expect(storageUserOps.write).toHaveBeenCalledWith(mockUser);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_LOGGED_USER' });
      expect(getUserPermission).toHaveBeenCalled();
    });

    it('should redirect to login when no token is present', async () => {
      CONFIG.MOCKS.MOCK_USER = false;
      storageTokenOps.read.mockReturnValue(null);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      expect(storageUserOps.delete).toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith(CONFIG.URL_FE.LOGIN);
    });

    it('should handle empty session storage user', async () => {
      CONFIG.MOCKS.MOCK_USER = false;
      storageTokenOps.read.mockReturnValue('valid-token');
      storageUserOps.read.mockReturnValue({});
      parseJwt.mockReturnValue(mockJwtUser);
      getUserPermission.mockResolvedValue(mockPermissions);

      const isEmpty = require('lodash/isEmpty');
      isEmpty.mockReturnValue(true);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      expect(parseJwt).toHaveBeenCalledWith('valid-token');
      expect(storageUserOps.write).toHaveBeenCalledWith(mockUser);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_LOGGED_USER' });
      expect(getUserPermission).toHaveBeenCalled();
    });

    it('should use existing session storage user', async () => {
      CONFIG.MOCKS.MOCK_USER = false;
      storageTokenOps.read.mockReturnValue('valid-token');
      storageUserOps.read.mockReturnValue(mockUser);
      getUserPermission.mockResolvedValue(mockPermissions);

      const isEmpty = require('lodash/isEmpty');
      isEmpty.mockReturnValue(false);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_LOGGED_USER' });
      expect(getUserPermission).toHaveBeenCalled();
    });

    it('should handle getUserPermission success in mock scenario', async () => {
      CONFIG.MOCKS.MOCK_USER = true;
      parseJwt.mockReturnValue(mockJwtUser);
      getUserPermission.mockResolvedValue(mockPermissions);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_USER_ROLE' });
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_PERMISSIONS_LIST' });
      });
    });

    it('should handle getUserPermission error in mock scenario', async () => {
      CONFIG.MOCKS.MOCK_USER = true;
      parseJwt.mockReturnValue(mockJwtUser);
      const error = new Error('Permission error');
      getUserPermission.mockRejectedValue(error);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      await waitFor(() => {
        expect(mockAddError).toHaveBeenCalledWith({
          id: 'GET_USER_PERMISSIONS',
          blocking: false,
          error,
          techDescription: 'An error occurred getting user permissions for current role',
          displayableTitle: 'errors.genericTitle',
          displayableDescription: 'errors.contactAdmin',
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
    });

    it('should handle getUserPermission error with empty session storage', async () => {
      CONFIG.MOCKS.MOCK_USER = false;
      storageTokenOps.read.mockReturnValue('valid-token');
      storageUserOps.read.mockReturnValue({});
      parseJwt.mockReturnValue(mockJwtUser);
      const error = new Error('Permission error');
      getUserPermission.mockRejectedValue(error);

      const isEmpty = require('lodash/isEmpty');
      isEmpty.mockReturnValue(true);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      await waitFor(() => {
        expect(mockAddError).toHaveBeenCalledWith({
          id: 'GET_USER_PERMISSIONS',
          blocking: false,
          error,
          techDescription: 'An error occurred getting user permissions for current role',
          displayableTitle: 'errors.genericTitle',
          displayableDescription: 'errors.contactAdmin',
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
    });

    it('should handle getUserPermission error with existing session storage user', async () => {
      CONFIG.MOCKS.MOCK_USER = false;
      storageTokenOps.read.mockReturnValue('valid-token');
      storageUserOps.read.mockReturnValue(mockUser);
      const error = new Error('Permission error');
      getUserPermission.mockRejectedValue(error);

      const isEmpty = require('lodash/isEmpty');
      isEmpty.mockReturnValue(false);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      await waitFor(() => {
        expect(mockAddError).toHaveBeenCalledWith({
          id: 'GET_USER_PERMISSIONS',
          blocking: false,
          error,
          techDescription: 'An error occurred getting user permissions for current role',
          displayableTitle: 'errors.genericTitle',
          displayableDescription: 'errors.contactAdmin',
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      });
    });

    it('should handle empty string token', async () => {
      CONFIG.MOCKS.MOCK_USER = false;
      storageTokenOps.read.mockReturnValue('');

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      expect(storageUserOps.delete).toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith(CONFIG.URL_FE.LOGIN);
    });

    it('should handle undefined token', async () => {
      CONFIG.MOCKS.MOCK_USER = false;
      storageTokenOps.read.mockReturnValue(undefined);

      const { result } = renderHookWithProvider(() => useLogin());

      await result.current.attemptSilentLogin();

      expect(storageUserOps.delete).toHaveBeenCalled();
      expect(window.location.assign).toHaveBeenCalledWith(CONFIG.URL_FE.LOGIN);
    });
  });

  describe('hook return value', () => {
    it('should return attemptSilentLogin function', () => {
      const { result } = renderHookWithProvider(() => useLogin());

      expect(result.current).toHaveProperty('attemptSilentLogin');
      expect(typeof result.current.attemptSilentLogin).toBe('function');
    });
  });
});