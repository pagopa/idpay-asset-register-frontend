import { RegisterApi, RolePermissionApi } from '../registerApiClient';

// Mock delle dipendenze
jest.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => ({
  default: { t: (k: string) => k },
}));
jest.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: jest.fn(),
  extractResponse: jest.fn((res) => res),
}));
jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn() },
}));
jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn(() => 'token') },
}));
jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));
jest.mock('../../utils/env', () => ({
  ENV: {
    URL_API: { OPERATION: 'http://api' },
    API_TIMEOUT_MS: { OPERATION: 1000 },
  },
}));
const mockUserPermission = { role: 'admin' };
const mockPortalConsent = { consent: true };
const mockUploadsList = { content: [], pageNo: 1, totalElements: 0 };
const mockUploadResponse = { id: 'uploadId' };
const mockCsvDTO = { rows: [] };

const mockRegisterClient = {
  userPermission: jest.fn(() => Promise.resolve(mockUserPermission)),
  getPortalConsent: jest.fn(() => Promise.resolve(mockPortalConsent)),
  savePortalConsent: jest.fn(() => Promise.resolve({})),
  getProductFilesList: jest.fn(() => Promise.resolve(mockUploadsList)),
  getProducts: jest.fn(() => Promise.resolve(mockUploadsList)),
  uploadProductList: jest.fn(() => Promise.resolve(mockUploadResponse)),
  downloadErrorReport: jest.fn(() =>
    Promise.resolve({
      response: {
        headers: {
          get: (key: string) =>
            key === 'content-disposition' ? 'attachment; filename="report.csv"' : undefined,
        },
      },
    })
  ),
};

jest.mock('../generated/register/client', () => ({
  createClient: () => mockRegisterClient,
}));

describe('registerApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RolePermissionApi', () => {
    it('userPermission restituisce i dati corretti', async () => {
      const res = await RolePermissionApi.userPermission();
      expect(res).toBe(mockUserPermission);
      expect(mockRegisterClient.userPermission).toHaveBeenCalled();
    });

    it('getPortalConsent restituisce i dati corretti', async () => {
      const res = await RolePermissionApi.getPortalConsent();
      expect(res).toBe(mockPortalConsent);
      expect(mockRegisterClient.getPortalConsent).toHaveBeenCalled();
    });

    it('savePortalConsent chiama la funzione con il parametro giusto', async () => {
      await RolePermissionApi.savePortalConsent('v1');
      expect(mockRegisterClient.savePortalConsent).toHaveBeenCalledWith({
        body: { versionId: 'v1' },
      });
    });
  });

  describe('RegisterApi', () => {
    it('getProductFiles restituisce i dati corretti', async () => {
      const res = await RegisterApi.getProductFiles(1, 10, 'sort');
      expect(res).toBe(mockUploadsList);
      expect(mockRegisterClient.getProductFilesList).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        sort: 'sort',
      });
    });

    it('getProducts restituisce i dati corretti', async () => {
      const res = await RegisterApi.getProducts(
        1,
        10,
        'sort',
        'cat',
        'eprel',
        'gtin',
        'prod',
        'fileId'
      );
      expect(res).toBe(mockUploadsList);
      expect(mockRegisterClient.getProducts).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        sort: 'sort',
        category: 'cat',
        eprelCode: 'eprel',
        gtinCode: 'gtin',
        productCode: 'prod',
        productFileId: 'fileId',
      });
    });

    it('uploadProductList restituisce i dati corretti', async () => {
      const file = new File(['test'], 'test.csv');
      const res = await RegisterApi.uploadProductList(file, 'cat');
      expect(res).toBe(mockUploadResponse);
      expect(mockRegisterClient.uploadProductList).toHaveBeenCalledWith({
        csv: file,
        category: 'cat',
      });
    });

    it('downloadErrorReport restituisce filename e dati', async () => {
      // Mock extractResponse per restituire mockCsvDTO
      const { extractResponse } = require('@pagopa/selfcare-common-frontend/lib/utils/api-utils');
      extractResponse.mockResolvedValueOnce(mockCsvDTO);

      const res = await RegisterApi.downloadErrorReport('fileId');
      expect(mockRegisterClient.downloadErrorReport).toHaveBeenCalledWith({
        productFileId: 'fileId',
      });
      expect(res.filename).toBe('report.csv');
      expect(res.data).toBe(mockCsvDTO);
    });

    it('getProductFiles gestisce errori', async () => {
      mockRegisterClient.getProductFilesList.mockRejectedValueOnce(new Error('fail'));
      await expect(RegisterApi.getProductFiles(1, 10, 'sort')).rejects.toThrow('fail');
    });

    it('getProducts gestisce errori', async () => {
      mockRegisterClient.getProducts.mockRejectedValueOnce(new Error('fail'));
      await expect(RegisterApi.getProducts(1, 10, 'sort')).rejects.toThrow('fail');
    });
  });
});
