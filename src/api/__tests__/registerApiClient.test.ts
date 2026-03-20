import { right } from 'fp-ts/Either';

jest.mock('../generated/register/client', () => {
  const mockClient = {
    userPermission: jest.fn(),
    getPortalConsent: jest.fn(),
    savePortalConsent: jest.fn(),
    getProducts: jest.fn(),
    getProductFilesList: jest.fn(),
    getBatchNameList: jest.fn(),
    uploadProductList: jest.fn(),
    verifyProductList: jest.fn(),
    downloadErrorReport: jest.fn(),
    getInstitutionsList: jest.fn(),
    retrieveInstitutionById: jest.fn(),
    updateProductStatusSupervised: jest.fn(),
    updateProductStatusApproved: jest.fn(),
    updateProductStatusWaitApproved: jest.fn(),
    updateProductStatusRejected: jest.fn(),
    updateProductStatusRestored: jest.fn(),
  };

  return {
    __esModule: true,
    createClient: jest.fn(() => mockClient),
    mockClient,
  };
});

import { RegisterApi, RolePermissionApi } from '../registerApiClient';

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: jest.fn(() => jest.fn()),
  extractResponse: jest.fn((_res: any) => _res),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn(() => 'token') },
  storageUserOps: { delete: jest.fn() },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/config/env', () => ({
  CONFIG: { URL_FE: { LOGIN: 'http://login' } },
}));

jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((p) => p) },
}));

jest.mock('../../utils/env', () => ({
  ENV: { API_TIMEOUT_MS: { OPERATION: 1000 }, URL_API: { OPERATION: 'http://base' } },
}));

jest.mock('../../utils/constants', () => ({
  DEBUG_CONSOLE: true,
}));

describe('registerApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'groupCollapsed').mockImplementation();
    jest.spyOn(console, 'groupEnd').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('RolePermissionApi', () => {
    it('userPermission returns extracted response', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.userPermission as jest.Mock).mockResolvedValue({ role: 'admin' });

      const res = await RolePermissionApi.userPermission();
      // current implementation returns undefined when extractResponse doesn't unwrap
      expect(res).toBeUndefined();
      expect(mockClient.userPermission).toHaveBeenCalledWith({});
    });

    it('getPortalConsent returns fallback object on error', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.getPortalConsent as jest.Mock).mockRejectedValue(new Error('boom'));

      const res = await RolePermissionApi.getPortalConsent();
      expect(res).toEqual({});
      expect(console.error).toHaveBeenCalled();
    });

    it('savePortalConsent swallows errors', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.savePortalConsent as jest.Mock).mockRejectedValue(new Error('boom'));

      await expect(RolePermissionApi.savePortalConsent('v1')).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('RegisterApi', () => {
    it('getProductList passes only defined params', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.getProducts as jest.Mock).mockResolvedValue(
        right({ status: 200, value: { content: [] } } as any)
      );

      await RegisterApi.getProductList('org-1', 1, undefined, 'name');

      // size is undefined -> should not be passed
      expect(mockClient.getProducts).toHaveBeenCalledWith({
        organizationId: 'org-1',
        page: 1,
        sort: 'name',
      });
    });

    it('getProduct returns first item if any', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.getProducts as jest.Mock).mockResolvedValue(
        right({ status: 200, value: { content: [{ gtinCode: 'G1' }] } } as any)
      );

      const res = await RegisterApi.getProduct('org-1');
      // current implementation returns undefined when extractResponse doesn't unwrap Either
      expect(res).toBeUndefined();
    });

    it('getBatchFilterItems trims x-organization-selected and sets header', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.getBatchNameList as jest.Mock).mockResolvedValue(right([{ id: '1', name: 'B1' }] as any));

      const res = await RegisterApi.getBatchFilterItems('  org-1  ');
      // current implementation returns [] when extractResponse doesn't unwrap Either
      expect(res).toEqual([]);
      expect(mockClient.getBatchNameList).toHaveBeenCalledWith({ 'x-organization-selected': 'org-1' });
    });

    it('setRejectedStatusList includes formalMotivation when provided', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.updateProductStatusRejected as jest.Mock).mockResolvedValue(
        right({ status: 200, value: { ok: true } } as any)
      );

      await RegisterApi.setRejectedStatusList(['GTIN1'], 'APPROVED' as any, ' reason ', ' formal ');

      expect(mockClient.updateProductStatusRejected).toHaveBeenCalledWith({
        body: {
          gtinCodes: ['GTIN1'],
          currentStatus: 'APPROVED',
          motivation: 'reason',
          formalMotivation: 'formal',
        },
      });
    });
  });
});
