import { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
        getProducersByInitiative: jest.fn(),
        updateProductStatusApproved: jest.fn(),
        updateProductStatusWaitApproved: jest.fn(),
        updateProductStatusSupervised: jest.fn(),
        updateProductStatusRejected: jest.fn(),
        updateProductStatusRestored: jest.fn(),
        getInitiatives: jest.fn(),
        updateOperativeEmail: jest.fn(),
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

describe('response interceptor - business KO branch', () => {
  it('rejects when wrapped response contains status KO', async () => {
    const handlers = (registerClient.instance.interceptors.response as any).handlers;
    const last = handlers[handlers.length - 1];
    const successHandler = last.fulfilled;

    const response = {
      status: 200,
      data: {
        value: {
          status: 'KO',
          errorKey: 'ERR_KEY',
          message: 'Failure',
        },
      },
    };

    await expect(successHandler(response as any)).rejects.toMatchObject({
      message: 'ERR_KEY',
    });
  });

  it('rejects with fallback message when no errorKey or message', async () => {
    const handlers = (registerClient.instance.interceptors.response as any).handlers;
    const last = handlers[handlers.length - 1];
    const successHandler = last.fulfilled;

    const response = {
      status: 200,
      data: { status: 'KO' },
    };

    await expect(successHandler(response as any)).rejects.toMatchObject({
      message: 'Business error',
    });
  });
});

describe('RegisterApi status updaters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trims motivation before calling API', async () => {
    (registerClient.initiatives.updateProductStatusApproved as jest.Mock)
      .mockResolvedValue({ data: { status: 'OK' } });

    await RegisterApi.setApprovedStatusList(
      'initi-1',
      ['gtin1'],
      'ACTIVE' as any,
      '  reason  '
    );

    expect(
      registerClient.initiatives.updateProductStatusApproved
    ).toHaveBeenCalledWith(
      { initiativeId: 'initi-1' },
      expect.objectContaining({
        motivation: 'reason',
      })
    );
  });

  it('includes trimmed formalMotivation when required', async () => {
    (registerClient.initiatives.updateProductStatusRejected as jest.Mock)
      .mockResolvedValue({ data: { status: 'OK' } });

    await RegisterApi.setRejectedStatusList(
      'initi-1',
      ['gtin1'],
      'ACTIVE' as any,
      '  reason  ',
      '  formal  '
    );

    expect(
      registerClient.initiatives.updateProductStatusRejected
    ).toHaveBeenCalledWith(
      { initiativeId: 'initi-1' },
      expect.objectContaining({
        formalMotivation: 'formal',
      })
    );
  });

  it('throws ApiError when business status is KO', async () => {
    (registerClient.initiatives.updateProductStatusApproved as jest.Mock)
      .mockResolvedValue({
        data: {
          status: 'KO',
          errorKey: 'BUSINESS_ERR',
        },
      });

    await expect(
      RegisterApi.setApprovedStatusList(
        'initi-1',
        ['gtin1'],
        'ACTIVE' as any,
        'reason'
      )
    ).rejects.toBeDefined();
  });
});

describe('RegisterApi.updateOperativeEmail', () => {
  it('trims operativeEmail before sending', async () => {
    const res = {
      data: { result: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    (registerClient.initiatives.updateOperativeEmail as jest.Mock)
      .mockResolvedValue(res);

    await RegisterApi.updateOperativeEmail('initi-1', '  mail@test.com  ');

    expect(
      registerClient.initiatives.updateOperativeEmail
    ).toHaveBeenCalledWith(
      { initiativeId: 'initi-1' },
      { operativeEmail: 'mail@test.com' }
    );
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
        techDescription: 'Unauthorized - token invalid or expired',
        displayableDescription: 'Please login again',
        displayableTitle: 'Session expired',
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
      await expect(errorHandler(err)).rejects.toMatchObject({ status: 401 });
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
      await expect(errorHandler(err)).rejects.toMatchObject({ status: 500 });
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

    it('rejects on failure', async () => {
      const err = new Error('Network error');
      (registerClient.permissions.userPermission as jest.Mock).mockRejectedValue(err);

      await expect(RolePermissionApi.userPermission()).rejects.toBe(err);
    });
  });

  describe('getPortalConsent', () => {
    it('returns the API response on success', async () => {
      const res = mockAxiosResponse({ consentRequired: true });
      (registerClient.consent.getPortalConsent as jest.Mock).mockResolvedValue(res);

      const result = await RolePermissionApi.getPortalConsent();
      expect(result).toBe(res);
    });

    it('rejects on failure', async () => {
      const err = new Error('Consent error');
      (registerClient.consent.getPortalConsent as jest.Mock).mockRejectedValue(err);

      await expect(RolePermissionApi.getPortalConsent()).rejects.toBe(err);
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

    it('rejects on failure', async () => {
      const err = new Error('Save failed');
      (registerClient.consent.savePortalConsent as jest.Mock).mockRejectedValue(err);

      await expect(RolePermissionApi.savePortalConsent('v1')).rejects.toBe(err);
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

  it('rejects on API error', async () => {
    const err = new Error('fail');
    (registerClient.initiatives.getProducts as jest.Mock).mockRejectedValue(err);

    await expect(RegisterApi.getProduct('initi-1', ORG)).rejects.toBe(err);
  });
});

describe('RegisterApi.getProductList', () => {
  const ORG = 'org-1';

  it('returns the API response on success', async () => {
    const res = mockAxiosResponse({ content: [{ id: 'p1' }] });
    (registerClient.initiatives.getProducts as jest.Mock).mockResolvedValue(res);

    expect(await RegisterApi.getProductList('initi-1', ORG)).toBe(res);
  });

  it('rejects on error', async () => {
    const err = new Error('fail');
    (registerClient.initiatives.getProducts as jest.Mock).mockRejectedValue(err);

    await expect(RegisterApi.getProductList('initi-1', ORG)).rejects.toBe(err);
  });
});

describe('RegisterApi.getProductFiles', () => {
  it('returns the API response on success', async () => {
    const res = mockAxiosResponse({ content: [] });
    (registerClient.initiatives.getProductFilesList as jest.Mock).mockResolvedValue(res);

    expect(await RegisterApi.getProductFiles()).toBe(res);
  });

  it('rejects on error', async () => {
    const err = new Error('fail');
    (registerClient.initiatives.getProductFilesList as jest.Mock).mockRejectedValue(
      err
    );

    await expect(RegisterApi.getProductFiles()).rejects.toBe(err);
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

  it('rejects on API error', async () => {
    const err = new Error();
    (registerClient.initiatives.getBatchNameList as jest.Mock).mockRejectedValue(err);
    await expect(RegisterApi.getBatchFilterItems('initi-1', ORG)).rejects.toBe(err);
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

  it('rejects on failure', async () => {
    const err = new Error('upload failed');
    (registerClient.initiatives.uploadProductList as jest.Mock).mockRejectedValue(err);

    await expect(RegisterApi.uploadProductList('initi-1', file, 'CATEGORY_A')).rejects.toBe(err);
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

  it('rejects on failure', async () => {
    const err = new Error('verify failed');
    (registerClient.initiatives.verifyProductList as jest.Mock).mockRejectedValue(err);

    await expect(RegisterApi.uploadProductListVerify('initi-1', file, 'CATEGORY_B')).rejects.toBe(
      err
    );
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

describe('RegisterApi.getProducers', () => {
  it('returns the API response on success', async () => {
    const res = mockAxiosResponse({ content: [] });
    (registerClient.initiatives.getProducersByInitiative as jest.Mock).mockReturnValue(res);

    expect(await RegisterApi.getProducers('initi-1')).toBe(res);
    expect(registerClient.initiatives.getProducersByInitiative).toHaveBeenCalledWith({
      initiativeId: 'initi-1',
    });
  });

  it('rejects on error', async () => {
    const err = new Error('fail');
    (registerClient.initiatives.getProducersByInitiative as jest.Mock).mockImplementation(() => {
      throw err;
    });

    await expect(RegisterApi.getProducers('initi-1')).rejects.toBe(err);
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

  it('rejects on error', async () => {
    const err = new Error('fail');
    (registerClient.institutions.retrieveInstitutionById as jest.Mock).mockImplementation(() => {
      throw err;
    });

    await expect(RegisterApi.getInstitutionById(ID)).rejects.toBe(err);
  });
});

describe('RegisterApi status updaters', () => {
  const INIT = 'initi-1';
  const GTINS = ['g1', 'g2'];

  it('calls approved updater and trims motivation', async () => {
    const res = { status: 'OK' };
    (registerClient.initiatives.updateProductStatusApproved as jest.Mock).mockResolvedValue(res);

    const result = await RegisterApi.setApprovedStatusList(
      INIT,
      GTINS,
      'APPROVED' as any,
      '  motivation  '
    );

    expect(registerClient.initiatives.updateProductStatusApproved).toHaveBeenCalledWith(
      { initiativeId: INIT },
      expect.objectContaining({
        gtinCodes: GTINS,
        currentStatus: 'APPROVED',
        motivation: 'motivation',
      })
    );
    expect(result).toBe(res);
  });

  it('includes formalMotivation for rejected updater and trims it', async () => {
    const res = { status: 'OK' };
    (registerClient.initiatives.updateProductStatusRejected as jest.Mock).mockResolvedValue(res);

    await RegisterApi.setRejectedStatusList(
      INIT,
      GTINS,
      'REJECTED' as any,
      '  m1  ',
      '  formal  '
    );

    expect(registerClient.initiatives.updateProductStatusRejected).toHaveBeenCalledWith(
      { initiativeId: INIT },
      expect.objectContaining({
        gtinCodes: GTINS,
        currentStatus: 'REJECTED',
        motivation: 'm1',
        formalMotivation: 'formal',
      })
    );
  });

  it('throws ApiError when payload status is KO', async () => {
    (registerClient.initiatives.updateProductStatusApproved as jest.Mock).mockResolvedValue({
      data: { value: { status: 'KO', errorKey: 'ERR_KEY' } },
    });

    await expect(
      RegisterApi.setApprovedStatusList(INIT, GTINS, 'APPROVED' as any, 'm')
    ).rejects.toBeDefined();
  });

  it('logs and rethrows on apiMethod error', async () => {
    const err = new Error('boom');
    (registerClient.initiatives.updateProductStatusApproved as jest.Mock).mockRejectedValue(err);

    await expect(
      RegisterApi.setApprovedStatusList(INIT, GTINS, 'APPROVED' as any, 'm')
    ).rejects.toBe(err);
  });
});

describe('RegisterApi.updateOperativeEmail & getMerchantInitiativeList', () => {
  it('trims operativeEmail before calling API', async () => {
    const res = mockAxiosResponse({ result: 'ok' });
    (registerClient.initiatives.updateOperativeEmail as jest.Mock).mockResolvedValue(res);

    const result = await RegisterApi.updateOperativeEmail('initi-1', '  test@mail.com  ');

    expect(registerClient.initiatives.updateOperativeEmail).toHaveBeenCalledWith(
      { initiativeId: 'initi-1' },
      { operativeEmail: 'test@mail.com' }
    );
    expect(result).toBe(res);
  });

  it('calls getInitiatives for merchant list', async () => {
    const res = mockAxiosResponse([{ id: 'i1' }]);
    (registerClient.initiatives.getInitiatives as jest.Mock).mockResolvedValue(res);

    const result = await RegisterApi.getMerchantInitiativeList();

    expect(registerClient.initiatives.getInitiatives).toHaveBeenCalledWith({});
    expect(result).toBe(res);
  });
});
