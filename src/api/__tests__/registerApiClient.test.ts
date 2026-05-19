import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { RegisterApi, RolePermissionApi } from '../registerApiClient';
import { registerClient } from '../registerApiClient';
import {
  storageTokenOps,
  storageUserOps,
} from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { store } from '../../redux/store';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';

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

jest.mock('../generated/register', () => {
  const mockAxios = require('axios');
  const mockInstance = mockAxios.create();
  return {
    Api: jest.fn().mockImplementation(() => ({
      instance: mockInstance,
      permissions: {
        userPermission: jest.fn(),
      },
      consent: {
        getPortalConsent: jest.fn(),
        savePortalConsent: jest.fn(),
      },
      initiatives: {
        uploadProductList: jest.fn(),
        getProductFilesList: jest.fn(),
        verifyProductList: jest.fn(),
        downloadErrorReport: jest.fn(),
        getBatchNameList: jest.fn(),
        getProducts: jest.fn(),
      },
      products: {
        updateProductStatusApproved: jest.fn(),
        updateProductStatusWaitApproved: jest.fn(),
        updateProductStatusSupervised: jest.fn(),
        updateProductStatusRejected: jest.fn(),
        updateProductStatusRestored: jest.fn(),
      },
      institutions: {
        retrieveInstitutionById: jest.fn(),
        getInstitutionsList: jest.fn(),
      },
    })),
  };
});
function makeConfig(headers: Record<string, string> = {}): InternalAxiosRequestConfig {
  const axiosHeaders = new AxiosHeaders(headers);
  return { headers: axiosHeaders } as InternalAxiosRequestConfig;
}
function mockAxiosResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return { data, status, statusText: 'OK', headers: {}, config: {} as any } as AxiosResponse<T>;
}

describe('sanitizeHeaders', () => {
  let requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;

  beforeEach(() => {
    const handlers = (registerClient.instance.interceptors.request as any).handlers;
    requestInterceptor = handlers[handlers.length - 1].fulfilled;
  });

  it('sets Authorization header when a token is present', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('my-token');
    const config = makeConfig();
    const result = requestInterceptor(config);
    expect(result.headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('does NOT set Authorization header when token is empty string', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('');
    const config = makeConfig();
    const result = requestInterceptor(config);
    expect(result.headers.get('Authorization')).toBeUndefined();
  });

  it('does NOT set Authorization header when token is null/undefined', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue(null);
    const config = makeConfig();
    const result = requestInterceptor(config);
    expect(result.headers.get('Authorization')).toBeUndefined();
  });

  it('removes headers with null values', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('tok');
    const config = makeConfig({ 'X-Custom': 'null' });
    const result = requestInterceptor(config);
    expect(result.headers.get('X-Custom')).toBeUndefined();
  });

  it("removes headers with 'undefined' string values", () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('tok');
    const config = makeConfig({ 'X-Custom': 'undefined' });
    const result = requestInterceptor(config);
    expect(result.headers.get('X-Custom')).toBeUndefined();
  });

  it('removes headers with empty string values', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('tok');
    const config = makeConfig({ 'X-Empty': '' });
    const result = requestInterceptor(config);
    expect(result.headers.get('X-Empty')).toBeUndefined();
  });

  it('keeps headers with valid non-empty values', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('tok');
    const config = makeConfig({ 'Content-Type': 'application/json' });
    const result = requestInterceptor(config);
    expect(result.headers.get('Content-Type')).toBe('application/json');
  });

  it('returns the modified config object', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('tok');
    const config = makeConfig();
    const result = requestInterceptor(config);
    expect(result).toBe(config);
  });
});

describe('response interceptor', () => {
  let successHandler: (res: AxiosResponse) => AxiosResponse;
  let errorHandler: (err: AxiosError) => Promise<never>;

  const originalLocation = window.location;

  beforeAll(() => {
    delete (window as any).location;
    (window as any).location = { assign: jest.fn() };
  });

  afterAll(() => {
    (window as any).location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    const handlers = (registerClient.instance.interceptors.response as any).handlers;
    const last = handlers[handlers.length - 1];
    successHandler = last.fulfilled;
    errorHandler = last.rejected;
  });

  describe('success handler', () => {
    it('passes the response through unchanged', () => {
      const mockResponse = mockAxiosResponse({ id: 1 });
      expect(successHandler(mockResponse)).toBe(mockResponse);
    });
  });

  describe('error handler - 401', () => {
    const make401Error = (): AxiosError =>
    ({
      response: { status: 401 },
      isAxiosError: true,
    } as unknown as AxiosError);

    it('dispatches addError action', async () => {
      await expect(errorHandler(make401Error())).rejects.toBeDefined();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(appStateActions.addError).toHaveBeenCalledWith({
        id: 'tokenNotValid',
        blocking: false,
        toNotify: false,
        techDescription: 'token expired or not valid',
        displayableDescription: 'Your session has expired',
        displayableTitle: 'Redirecting you to the login page',
        error: new Error(),
      });
    });

    it('deletes the user storage', async () => {
      await expect(errorHandler(make401Error())).rejects.toBeDefined();
      expect(storageUserOps.delete).toHaveBeenCalledTimes(1);
    });

    it('redirects to the login page', async () => {
      await expect(errorHandler(make401Error())).rejects.toBeDefined();
      expect(window.location.assign).toHaveBeenCalledWith(CONFIG.URL_FE.LOGIN);
    });

    it('rejects the promise with the original error', async () => {
      const err = make401Error();
      await expect(errorHandler(err)).rejects.toBe(err);
    });
  });

  describe('error handler - non-401', () => {
    const make500Error = (): AxiosError =>
    ({
      response: { status: 500 },
      isAxiosError: true,
    } as unknown as AxiosError);

    it('does NOT dispatch addError for non-401 errors', async () => {
      await expect(errorHandler(make500Error())).rejects.toBeDefined();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('does NOT redirect for non-401 errors', async () => {
      await expect(errorHandler(make500Error())).rejects.toBeDefined();
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('still rejects the promise', async () => {
      const err = make500Error();
      await expect(errorHandler(err)).rejects.toBe(err);
    });
  });
});

describe('RolePermissionApi', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('userPermission', () => {
    it('returns the API response on success', async () => {
      const res = mockAxiosResponse({ role: 'ADMIN' });
      (registerClient.permissions.userPermission as jest.Mock).mockResolvedValue(res);

      const result = await RolePermissionApi.userPermission();
      expect(result).toBe(res);
    });

    it('returns empty object and logs error on failure', async () => {
      const err = new Error('Network error');
      (registerClient.permissions.userPermission as jest.Mock).mockRejectedValue(err);

      const result = await RolePermissionApi.userPermission();
      expect(result).toEqual({});
    });
  });

  describe('getPortalConsent', () => {
    it('returns the API response on success', async () => {
      const res = mockAxiosResponse({ consentRequired: true });
      (registerClient.consent.getPortalConsent as jest.Mock).mockResolvedValue(res);

      const result = await RolePermissionApi.getPortalConsent();
      expect(result).toBe(res);
    });

    it('returns empty object and logs error on failure', async () => {
      const err = new Error('Consent error');
      (registerClient.consent.getPortalConsent as jest.Mock).mockRejectedValue(err);

      const result = await RolePermissionApi.getPortalConsent();
      expect(result).toEqual({});
    });
  });

  describe('savePortalConsent', () => {
    it('calls the API with the given versionId', async () => {
      const res = mockAxiosResponse(undefined);
      (registerClient.consent.savePortalConsent as jest.Mock).mockResolvedValue(res);

      const result = await RolePermissionApi.savePortalConsent('v1');
      expect(registerClient.consent.savePortalConsent).toHaveBeenCalledWith({
        versionId: 'v1',
      });
      expect(result).toBe(res);
    });

    it('works when versionId is undefined', async () => {
      const res = mockAxiosResponse(undefined);
      (registerClient.consent.savePortalConsent as jest.Mock).mockResolvedValue(res);

      await RolePermissionApi.savePortalConsent(undefined);
      expect(registerClient.consent.savePortalConsent).toHaveBeenCalledWith({
        versionId: undefined,
      });
    });

    it('returns undefined and logs error on failure', async () => {
      const err = new Error('Save failed');
      (registerClient.consent.savePortalConsent as jest.Mock).mockRejectedValue(err);

      const result = await RolePermissionApi.savePortalConsent('v1');
      expect(result).toBeUndefined();
    });
  });
});

describe('RegisterApi.getProduct', () => {
  const ORG = 'org-1';

  it('returns the first item when content is non-empty', async () => {
    const product = { id: 'p1' };
    (registerClient.initiatives.getProducts as jest.Mock).mockResolvedValue({
      value: { content: [product, { id: 'p2' }] },
    });

    const result = await RegisterApi.getProduct('initi-1', ORG);
    expect(result).toEqual(product);
  });

  it('returns undefined when content array is empty', async () => {
    (registerClient.initiatives.getProducts as jest.Mock).mockResolvedValue({
      value: { content: [] },
    });

    expect(await RegisterApi.getProduct('initi-1', ORG)).toBeUndefined();
  });

  it('returns undefined when content is missing', async () => {
    (registerClient.initiatives.getProducts as jest.Mock).mockResolvedValue({
      value: {},
    });

    expect(await RegisterApi.getProduct('initi-1', ORG)).toBeUndefined();
  });

  it('returns undefined when value is missing', async () => {
    (registerClient.initiatives.getProducts as jest.Mock).mockResolvedValue({});

    expect(await RegisterApi.getProduct('initi-1', ORG)).toBeUndefined();
  });

  it('returns fallback object on API error', async () => {
    (registerClient.initiatives.getProducts as jest.Mock).mockRejectedValue(new Error('fail'));

    const result = await RegisterApi.getProduct('initi-1', ORG);
    expect(result).toEqual({ status: 200, value: { content: [] } });
  });
});

describe('RegisterApi.getProductList', () => {
  const ORG = 'org-1';

  it('returns the API response on success', async () => {
    const res = mockAxiosResponse({ content: [{ id: 'p1' }] });
    (registerClient.initiatives.getProducts as jest.Mock).mockResolvedValue(res);

    expect(await RegisterApi.getProductList('initi-1', ORG)).toBe(res);
  });

  it('returns fallback on error', async () => {
    (registerClient.initiatives.getProducts as jest.Mock).mockRejectedValue(new Error('fail'));

    const result = await RegisterApi.getProductList('initi-1', ORG);
    expect(result).toEqual({ content: [] });
  });
});

describe('RegisterApi.getProductFiles', () => {
  it('returns the API response on success', async () => {
    const res = mockAxiosResponse({ content: [] });
    (registerClient.initiatives.getProductFilesList as jest.Mock).mockResolvedValue(res);

    expect(await RegisterApi.getProductFiles()).toBe(res);
  });

  it('returns fallback object on error', async () => {
    (registerClient.initiatives.getProductFilesList as jest.Mock).mockRejectedValue(
      new Error('fail')
    );

    const result = await RegisterApi.getProductFiles();
    expect(result).toEqual({ status: 200, value: { content: [] } });
  });
});

describe('RegisterApi.getBatchFilterItems', () => {
  const ORG = '  org-1  ';
  const TRIMMED = 'org-1';

  it('sets x-organization-selected param when org is non-empty', async () => {
    (registerClient.initiatives.getBatchNameList as jest.Mock).mockResolvedValue(['batch1']);

    await RegisterApi.getBatchFilterItems('initi-1', ORG);

    expect(registerClient.initiatives.getBatchNameList).toHaveBeenCalledWith({
      initiativeId: 'initi-1',
      'x-organization-selected': TRIMMED,
    });
  });

  it('does NOT set x-organization-selected when org is empty string', async () => {
    (registerClient.initiatives.getBatchNameList as jest.Mock).mockResolvedValue([]);

    await RegisterApi.getBatchFilterItems('initi-1', '   ');

    expect(registerClient.initiatives.getBatchNameList).toHaveBeenCalledWith({ initiativeId: 'initi-1' });
  });

  it('returns the response directly when it is already an array', async () => {
    (registerClient.initiatives.getBatchNameList as jest.Mock).mockResolvedValue(['e', 'f']);

    expect(await RegisterApi.getBatchFilterItems(ORG)).toEqual(['e', 'f']);
  });

  it('returns empty array on API error', async () => {
    (registerClient.initiatives.getBatchNameList as jest.Mock).mockRejectedValue(new Error());
    const result = await RegisterApi.getBatchFilterItems(ORG);
    expect(result).toEqual([]);
  });
});

describe('RegisterApi.uploadProductList', () => {
  const file = new File(['a,b'], 'test.csv', { type: 'text/csv' });

  it('returns API response on success', async () => {
    const res = mockAxiosResponse({ uploadId: 'u1' });
    (registerClient.initiatives.uploadProductList as jest.Mock).mockResolvedValue(res);

    expect(await RegisterApi.uploadProductList('initi-1', file, 'CATEGORY_A')).toBe(res);
    expect(registerClient.initiatives.uploadProductList).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "CATEGORY_A",
        initiativeId: "initi-1"
      }),
      {csv: file}
    );
  });

  it('returns empty object and logs error on failure', async () => {
    const err = new Error('upload failed');
    (registerClient.initiatives.uploadProductList as jest.Mock).mockRejectedValue(err);

    const result = await RegisterApi.uploadProductList(file, 'CATEGORY_A');
    expect(result).toEqual({});
  });
});

describe('RegisterApi.uploadProductListVerify', () => {
  const file = new File(['a,b'], 'test.csv', { type: 'text/csv' });

  it('returns API response on success', async () => {
    const res = mockAxiosResponse({ uploadId: 'u2' });
    (registerClient.initiatives.verifyProductList as jest.Mock).mockResolvedValue(res);

    expect(await RegisterApi.uploadProductListVerify('initi-1', file, 'CATEGORY_B')).toBe(res);
    expect(registerClient.initiatives.verifyProductList).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "CATEGORY_B",
        initiativeId: "initi-1"
      }),
      {csv: file}
    );
  });

  it('returns empty object and logs error on failure', async () => {
    const err = new Error('verify failed');
    (registerClient.initiatives.verifyProductList as jest.Mock).mockRejectedValue(err);

    const result = await RegisterApi.uploadProductListVerify(file, 'CATEGORY_B');
    expect(result).toEqual({});
  });
});

describe('RegisterApi.downloadErrorReport', () => {
  const FILE_ID = 'file-123';

  it('returns data and empty filename when response has a top-level data string', async () => {
    (registerClient.initiatives.downloadErrorReport as jest.Mock).mockResolvedValue({
      data: 'col1,col2\nval1,val2',
    });

    const result = await RegisterApi.downloadErrorReport(FILE_ID);
    expect(result.data).toEqual('col1,col2\nval1,val2');
    expect(result.filename).toBe('');
    expect(result.warning).toBeUndefined();
  });

  it('returns empty data when top-level data string is blank', async () => {
    (registerClient.initiatives.downloadErrorReport as jest.Mock).mockResolvedValue({
      data: 'csv-content',
      headers: {},
    });

    const result = await RegisterApi.downloadErrorReport(FILE_ID);
    expect(result.data).toEqual('csv-content');
  });

  it('extracts filename from content-disposition header (lowercase)', async () => {
    (registerClient.initiatives.downloadErrorReport as jest.Mock).mockResolvedValue({
      data: 'a,b',
      headers: { 'content-disposition': 'attachment; filename="errors.csv"' },
    });

    const result = await RegisterApi.downloadErrorReport(FILE_ID);
    expect(result.filename).toBe('errors.csv');
  });

  it('extracts filename from content-disposition header (capitalized)', async () => {
    (registerClient.initiatives.downloadErrorReport as jest.Mock).mockResolvedValue({
      data: 'a,b',
      headers: { 'content-disposition': 'attachment; filename="report.csv"' },
    });

    const result = await RegisterApi.downloadErrorReport(FILE_ID);
    expect(result.filename).toBe('report.csv');
  });

  it('extracts filename via headers.get() method', async () => {
    const headers = { 'content-disposition': 'attachment; filename="report.csv"' };
    (registerClient.initiatives.downloadErrorReport as jest.Mock).mockResolvedValue({
      data: 'x',
      headers,
    });

    const result = await RegisterApi.downloadErrorReport(FILE_ID);
    expect(result.filename).toBe('report.csv');
  });

  it('returns empty filename when no content-disposition header is present', async () => {
    (registerClient.initiatives.downloadErrorReport as jest.Mock).mockResolvedValue({
      response: { data: 'a,b', headers: {} },
    });

    const result = await RegisterApi.downloadErrorReport(FILE_ID);
    expect(result.filename).toBe('');
  });

  it('reads csv from rawResponse.data when top-level data is empty', async () => {
    (registerClient.initiatives.downloadErrorReport as jest.Mock).mockResolvedValue({
      data: 'raw-csv',
      headers: {},
    });

    const result = await RegisterApi.downloadErrorReport(FILE_ID);
    expect(result.data).toEqual('raw-csv');
  });
});

describe('RegisterApi.getInstitutionsList', () => {
  it('returns the API response on success', async () => {
    const res = mockAxiosResponse({ institutions: [] });
    (registerClient.institutions.getInstitutionsList as jest.Mock).mockReturnValue(res);

    expect(await RegisterApi.getInstitutionsList()).toBe(res);
  });

  it('returns fallback on error', async () => {
    (registerClient.institutions.getInstitutionsList as jest.Mock).mockImplementation(() => {
      throw new Error('fail');
    });

    const result = await RegisterApi.getInstitutionsList();
    expect(result).toEqual({ status: 200, value: { institutions: [] } });
  });
});

describe('RegisterApi.getInstitutionById', () => {
  const ID = 'inst-42';

  it('calls the API with the correct institutionId', async () => {
    const res = mockAxiosResponse({ id: ID });
    (registerClient.institutions.retrieveInstitutionById as jest.Mock).mockReturnValue(res);

    const result = await RegisterApi.getInstitutionById(ID);
    expect(result).toBe(res);
    expect(registerClient.institutions.retrieveInstitutionById).toHaveBeenCalledWith({
      institutionId: ID,
    });
  });

  it('returns fallback on error', async () => {
    (registerClient.institutions.retrieveInstitutionById as jest.Mock).mockImplementation(() => {
      throw new Error('fail');
    });

    const result = await RegisterApi.getInstitutionById(ID);
    expect(result).toEqual({ status: 200, value: { institutions: [] } });
  });
});
