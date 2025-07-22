import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderWithContext } from '../../utils/__tests__/test-utils';
import useTCAgreement from '../useTCAgreement';
import * as rolePermissionService from '../../services/rolePermissionService';

jest.mock('../../utils/env', () => ({
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

jest.mock('../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home'
  },
  BASE_ROUTE: '/base'
}));

jest.mock('../../api/registerApiClient', () => ({
  RolePermissionApi: {
    getPortalConsent: jest.fn(),
    savePortalConsent: jest.fn(),
  },
}));

// Mock corretto del service con implementazione delle funzioni
jest.mock('../../services/rolePermissionService', () => ({
  getPortalConsent: jest.fn(),
  savePortalConsent: jest.fn(),
}));

// Mock di useErrorDispatcher
jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  useErrorDispatcher: () => jest.fn(),
}));

// Mock di useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Cast dei mock per TypeScript
const mockGetPortalConsent = rolePermissionService.getPortalConsent as jest.MockedFunction<typeof rolePermissionService.getPortalConsent>;
const mockSavePortalConsent = rolePermissionService.savePortalConsent as jest.MockedFunction<typeof rolePermissionService.savePortalConsent>;

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('test suite for useTCAgreement hook', () => {

  // Creiamo un wrapper personalizzato che usa renderWithContext correttamente
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => {
      const TestComponent = () => <div>{children}</div>;
      const rendered = renderWithContext(<TestComponent />);
      return rendered.container.firstChild as React.ReactElement;
    };
  };

  // Approccio alternativo: usa direttamente il tuo HookWrapper
  const testHookValues: any = {};
  const HookWrapper = () => {
    Object.assign(testHookValues, useTCAgreement());
    return null;
  };

  describe('Initial load scenarios', () => {
    it('should set acceptedTOS to false when getPortalConsent returns data', async () => {
      const mockResponse = {
        versionId: '1.0.0',
        firstAcceptance: true
      };

      mockGetPortalConsent.mockResolvedValue(mockResponse);

      renderWithContext(<HookWrapper />);

      // Aspetta che l'effect si completi
      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(false);
      });

      expect(testHookValues.firstAcceptance).toBe(true);
      expect(mockGetPortalConsent).toHaveBeenCalledTimes(1);
    });

    it('should set acceptedTOS to true when getPortalConsent returns empty object', async () => {
      mockGetPortalConsent.mockResolvedValue({});

      // Reset del valore precedente
      Object.keys(testHookValues).forEach(key => delete testHookValues[key]);

      renderWithContext(<HookWrapper />);

      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(true);
      });

      expect(mockGetPortalConsent).toHaveBeenCalledTimes(1);
    });

    it('should handle getPortalConsent error', async () => {
      const mockError = new Error('API Error');
      mockGetPortalConsent.mockRejectedValue(mockError);

      // Reset del valore precedente
      Object.keys(testHookValues).forEach(key => delete testHookValues[key]);

      renderWithContext(<HookWrapper />);

      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(false);
      });

      expect(mockGetPortalConsent).toHaveBeenCalledTimes(1);
    });
  });

  describe('acceptTOS functionality', () => {
    it('should successfully accept TOS', async () => {
      // Setup initial state
      const mockInitialResponse = {
        versionId: '1.0.0',
        firstAcceptance: true
      };

      mockGetPortalConsent.mockResolvedValue(mockInitialResponse);
      mockSavePortalConsent.mockResolvedValue({});

      // Reset del valore precedente
      Object.keys(testHookValues).forEach(key => delete testHookValues[key]);

      renderWithContext(<HookWrapper />);

      // Aspetta l'inizializzazione
      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(false);
      });

      // Chiama acceptTOS
      testHookValues.acceptTOS();

      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(true);
      });

      expect(mockSavePortalConsent).toHaveBeenCalledWith('1.0.0');
    });

    it('should handle acceptTOS error', async () => {
      // Setup initial state
      const mockInitialResponse = {
        versionId: '1.0.0',
        firstAcceptance: true
      };

      mockGetPortalConsent.mockResolvedValue(mockInitialResponse);
      mockSavePortalConsent.mockRejectedValue(new Error('Save error'));

      // Reset del valore precedente
      Object.keys(testHookValues).forEach(key => delete testHookValues[key]);

      renderWithContext(<HookWrapper />);

      // Aspetta l'inizializzazione
      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(false);
      });

      // Chiama acceptTOS
      testHookValues.acceptTOS();

      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(false);
      });

      expect(mockSavePortalConsent).toHaveBeenCalledWith('1.0.0');
    });

    it('should handle acceptTOS when acceptedTOSVersion is undefined', async () => {
      // Setup: getPortalConsent returns empty object
      mockGetPortalConsent.mockResolvedValue({});
      mockSavePortalConsent.mockResolvedValue({});

      // Reset del valore precedente
      Object.keys(testHookValues).forEach(key => delete testHookValues[key]);

      renderWithContext(<HookWrapper />);

      // Aspetta l'inizializzazione
      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(true);
      });

      // Chiama acceptTOS con acceptedTOSVersion undefined
      testHookValues.acceptTOS();

      await waitFor(() => {
        expect(mockSavePortalConsent).toHaveBeenCalledWith(undefined);
      });
    });
  });

  describe('Hook return values', () => {
    it('should return correct initial values', async () => {
      mockGetPortalConsent.mockResolvedValue({});

      // Reset del valore precedente
      Object.keys(testHookValues).forEach(key => delete testHookValues[key]);

      renderWithContext(<HookWrapper />);

      await waitFor(() => {
        expect(testHookValues).toHaveProperty('isTOSAccepted');
        expect(testHookValues).toHaveProperty('acceptTOS');
        expect(testHookValues).toHaveProperty('firstAcceptance');
        expect(typeof testHookValues.acceptTOS).toBe('function');
        expect(testHookValues.firstAcceptance).toBe(false);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null response from getPortalConsent', async () => {
      mockGetPortalConsent.mockResolvedValue(null as any);

      // Reset del valore precedente
      Object.keys(testHookValues).forEach(key => delete testHookValues[key]);

      renderWithContext(<HookWrapper />);

      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(false);
      });
    });

    it('should handle undefined response from getPortalConsent', async () => {
      mockGetPortalConsent.mockResolvedValue(undefined as any);

      // Reset del valore precedente
      Object.keys(testHookValues).forEach(key => delete testHookValues[key]);

      renderWithContext(<HookWrapper />);

      await waitFor(() => {
        expect(testHookValues.isTOSAccepted).toBe(false);
      });
    });
  });
});

// Test alternativo usando il tuo approccio originale semplificato
describe('Alternative test approach with HookWrapper', () => {
  const returnVal: any = {};
  const SimpleHookWrapper = () => {
    Object.assign(returnVal, useTCAgreement());
    return null;
  };

  beforeEach(() => {
    // Reset dell'oggetto returnVal
    Object.keys(returnVal).forEach(key => delete returnVal[key]);
  });

  it('should initialize hook without errors', async () => {
    mockGetPortalConsent.mockResolvedValue({});

    renderWithContext(<SimpleHookWrapper />);

    await waitFor(() => {
      expect(returnVal.isTOSAccepted).toBeDefined();
      expect(returnVal.acceptTOS).toBeDefined();
      expect(returnVal.firstAcceptance).toBeDefined();
    });
  });

  it('should handle successful getPortalConsent', async () => {
    const mockResponse = {
      versionId: '2.0.0',
      firstAcceptance: false
    };

    mockGetPortalConsent.mockResolvedValue(mockResponse);

    renderWithContext(<SimpleHookWrapper />);

    await waitFor(() => {
      expect(returnVal.isTOSAccepted).toBe(false);
      expect(returnVal.firstAcceptance).toBe(false);
    });
  });
});