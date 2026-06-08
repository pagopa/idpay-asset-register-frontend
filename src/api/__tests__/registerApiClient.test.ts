/* eslint-disable @typescript-eslint/no-var-requires */
import { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { RegisterApi, registerClient } from '../registerApiClient';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';


jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn(() => 'token') },
  storageUserOps: { delete: jest.fn() },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/config/env', () => ({
  CONFIG: { URL_FE: { LOGIN: 'https://login' } },
}));

jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((p) => p) },
}));

jest.mock('../../utils/env', () => ({
  ENV: { API_TIMEOUT_MS: { OPERATION: 1000 }, URL_API: { OPERATION: 'https://base' } },
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
      permissions: { userPermission: jest.fn() },
      consent: { getPortalConsent: jest.fn(), savePortalConsent: jest.fn() },
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
      institutions: {
        retrieveInstitutionById: jest.fn(),
      },
    })),
  };
});

function makeConfig(headers: Record<string, string> = {}): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders(headers) } as InternalAxiosRequestConfig;
}

function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as any };
}

/* ---------------- sanitizeHeaders ---------------- */

describe('sanitizeHeaders via request interceptor', () => {
  let requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;

  beforeEach(() => {
    const handlers = (registerClient.instance.interceptors.request as any).handlers;
    requestInterceptor = handlers[handlers.length - 1].fulfilled;
  });

  it('sets Authorization header when token exists', () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue('my-token');
    const config = makeConfig();
    const result = requestInterceptor(config);
    expect(result.headers.get('Authorization')).toBe('Bearer my-token');
  });

  it('removes invalid headers', () => {
    const config = makeConfig({
      'X-Null': 'null',
      'X-Undefined': 'undefined',
      'X-Empty': '',
      Valid: 'ok',
    });
    const result = requestInterceptor(config);
    expect(result.headers.get('X-Null')).toBeUndefined();
    expect(result.headers.get('X-Undefined')).toBeUndefined();
    expect(result.headers.get('X-Empty')).toBeUndefined();
    expect(result.headers.get('Valid')).toBe('ok');
  });
});

/* ---------------- response interceptor business KO ---------------- */

describe('response interceptor - business KO', () => {
  it('rejects when status KO in wrapped response', async () => {
    const handlers = (registerClient.instance.interceptors.response as any).handlers;
    const successHandler = handlers[handlers.length - 1].fulfilled;

    await expect(
      successHandler({
        status: 200,
        data: { value: { status: 'KO', errorKey: 'ERR_KEY' } },
      } as any)
    ).rejects.toMatchObject({ message: 'ERR_KEY' });
  });
});

/* ---------------- buildParams ---------------- */

describe('buildParams coverage via getProductList', () => {
  it('filters undefined and empty string params', async () => {
    (registerClient.initiatives.getProducts as jest.Mock).mockResolvedValue(
      mockAxiosResponse({ content: [] })
    );

    await RegisterApi.getProductList('initi-1', 'org-1', undefined, undefined, '', '');

    const callArg = (registerClient.initiatives.getProducts as jest.Mock).mock.calls[0][0];
    expect(callArg).toMatchObject({
      initiativeId: 'initi-1',
      organizationId: 'org-1',
    });
    expect(callArg.sort).toBeUndefined();
  });
});

/* ---------------- logApiError ---------------- */

describe('logApiError coverage', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs errorKey when DEBUG_CONSOLE true', async () => {
    const err = {
      message: 'msg',
      name: 'Error',
      stack: 'stack',
      response: { data: { errorKey: 'E_KEY' } },
    };

    (registerClient.initiatives.updateProductStatusApproved as jest.Mock).mockRejectedValue(err);

    await expect(
      RegisterApi.setApprovedStatusList('i1', ['g'], 'APPROVED' as any, 'm')
    ).rejects.toBe(err);

    expect(console.error).toHaveBeenCalledWith('Error Key: E_KEY');
  });
});

describe('logApiError with DEBUG_CONSOLE false', () => {
  it('does nothing when DEBUG_CONSOLE false', async () => {
    jest.resetModules();
    jest.doMock('../../utils/constants', () => ({ DEBUG_CONSOLE: false }));

    const fresh = require('../registerApiClient');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (fresh.registerClient.initiatives.updateProductStatusApproved as jest.Mock).mockRejectedValue(
      new Error('x')
    );

    await expect(
      fresh.RegisterApi.setApprovedStatusList('i1', ['g'], 'APPROVED', 'm')
    ).rejects.toBeDefined();

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

/* ---------------- upload APIs ---------------- */

describe('upload APIs', () => {
  const file = new File(['a'], 't.csv');

  it('uploadProductList success', async () => {
    const res = mockAxiosResponse({ uploadId: 'u1' });
    (registerClient.initiatives.uploadProductList as jest.Mock).mockResolvedValue(res);

    const result = await RegisterApi.uploadProductList('initi-1', file, 'WASHINGMACHINES' as any);
    expect(result).toBe(res);
  });

  it('uploadProductListVerify success', async () => {
    const res = mockAxiosResponse({ uploadId: 'u2' });
    (registerClient.initiatives.verifyProductList as jest.Mock).mockResolvedValue(res);

    const result = await RegisterApi.uploadProductListVerify(
      'initi-1',
      file,
      'WASHINGMACHINES' as any
    );
    expect(result).toBe(res);
  });
});
