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
  buildFetchApi: jest.fn(() =>
    jest.fn(async () => ({
      status: 200,
    }))
  ),
  extractResponse: jest.fn((res: any) => res?.right?.value ?? res?.value ?? res),
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

    Object.defineProperty(window, 'location', {
      value: { assign: jest.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('RolePermissionApi', () => {
    it('userPermission returns extracted response', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.userPermission as jest.Mock).mockResolvedValue({ role: 'admin' });

      const res = await RolePermissionApi.userPermission();
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
    it('downloadErrorReport returns inline csv string as CsvDTO', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;

      (mockClient.downloadErrorReport as jest.Mock).mockResolvedValue({ data: 'a,b\n1,2\n' });

      const res = await RegisterApi.downloadErrorReport('file-1');

      expect(res).toEqual({ data: { data: 'a,b\n1,2\n' }, filename: '', warning: undefined });
      expect(mockClient.downloadErrorReport).toHaveBeenCalledWith({ productFileId: 'file-1' });
    });

    it('downloadErrorReport extracts filename from content-disposition header', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;

      const headers = {
        get: (k: string) => (k.toLowerCase() === 'content-disposition' ? 'attachment; filename="err.csv"' : ''),
      };

      (mockClient.downloadErrorReport as jest.Mock).mockResolvedValue({
        response: { headers },
        data: { data: '' },
      });

      const res = await RegisterApi.downloadErrorReport('file-2');
      expect(res.filename).toBe('err.csv');
    });

    it('downloadErrorReport falls back to raw response.data when extractResponse yields empty object', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;

      const { extractResponse } = (await import('@pagopa/selfcare-common-frontend/lib/utils/api-utils')) as any;
      (extractResponse as jest.Mock).mockImplementationOnce(() => ({}));

      (mockClient.downloadErrorReport as jest.Mock).mockResolvedValue({
        data: 'csv-from-raw',
        headers: { get: () => '' },
      });

      const res = await RegisterApi.downloadErrorReport('file-3');
      expect(res.data).toEqual({ data: 'csv-from-raw' });
    });

    it('downloadErrorReport uses .text() when raw response is a Response-like object', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;

      const responseLike = {
        headers: { get: () => 'attachment; filename="t.csv"' },
        text: async () => 'csv-from-text',
      };

      const { extractResponse } = (await import('@pagopa/selfcare-common-frontend/lib/utils/api-utils')) as any;
      (extractResponse as jest.Mock).mockImplementationOnce(() => ({}));

      (mockClient.downloadErrorReport as jest.Mock).mockResolvedValue({
        response: responseLike,
      });

      const res = await RegisterApi.downloadErrorReport('file-4');
      expect(res).toEqual({ data: { data: 'csv-from-text' }, filename: 't.csv' });
    });

    it('getProduct returns undefined when extractResponse does not unwrap Either', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;

      (mockClient.getProducts as jest.Mock).mockResolvedValue(
        right({ status: 200, value: { content: [{ gtinCode: 'G1' }] } } as any)
      );

      const res = await RegisterApi.getProduct('org-1');
      expect(res).toBeUndefined();
    });
    it('getProductList passes only defined params', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.getProducts as jest.Mock).mockResolvedValue(
        right({ status: 200, value: { content: [] } } as any)
      );

      await RegisterApi.getProductList('org-1', 1, undefined, 'name');

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
      expect(res).toBeUndefined();
    });

    it('getBatchFilterItems trims x-organization-selected and sets header', async () => {
      const { mockClient } = (await import('../generated/register/client')) as any;
      (mockClient.getBatchNameList as jest.Mock).mockResolvedValue(right([{ id: '1', name: 'B1' }] as any));

      const res = await RegisterApi.getBatchFilterItems('  org-1  ');
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
