import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import {storageTokenOps, storageUserOps} from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { right, Either } from 'fp-ts/Either';
import { IResponseType } from '@pagopa/ts-commons/lib/requests';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { DEBUG_CONSOLE } from '../utils/constants';
import { createClient, WithDefaultsT } from './generated/register/client';
import {PortalConsentDTO} from "./generated/register/PortalConsentDTO";
import { UserPermissionDTO } from './generated/register/UserPermissionDTO';
import { UploadsListDTO } from './generated/register/UploadsListDTO';
import { BatchList } from './generated/register/BatchList';
import { RegisterUploadResponseDTO } from './generated/register/RegisterUploadResponseDTO';
import { CsvDTO } from './generated/register/CsvDTO';
import {InstitutionsResponse} from "./generated/register/InstitutionsResponse";
import {ProductDTO} from "./generated/register/ProductDTO";
import { ProductStatusEnum } from './generated/register/ProductStatus';
import { ProductsUpdateDTO } from './generated/register/ProductsUpdateDTO';
import { ProductListDTO } from './generated/register/ProductListDTO';

const rawFetchApi = buildFetchApi(ENV.API_TIMEOUT_MS.OPERATION);

const sanitizedFetchApi: typeof rawFetchApi = async (input, init) => {
  const headers = new Headers(init?.headers ?? {});
  const keysToDelete: Array<string> = [];
  headers.forEach((value, key) => {
    if (
      value === null ||
      value === '' ||
      value === 'undefined' ||
      value === 'null'
    ) {
      // eslint-disable-next-line functional/immutable-data
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((k) => headers.delete(k));
  const res = await rawFetchApi(input, { ...init, headers });

  if (res?.status === 401) {
    onRedirectToLogin();
  }
  return res;
};

const withBearerAndPartyId: WithDefaultsT<'Bearer'> =
  (wrappedOperation: (arg0: any) => any) => (params: any) => {
    const token = storageTokenOps.read();
    const extra = token ? { Bearer: `Bearer ${token}` } : {};
    return wrappedOperation({ ...params, ...extra });
};

const registerClient = createClient({
  baseUrl: ENV.URL_API.OPERATION,
  basePath: '',
  fetchApi: sanitizedFetchApi,
  withDefaults: withBearerAndPartyId,
});

const onRedirectToLogin = () => {
  store.dispatch(
      appStateActions.addError({
        id: 'tokenNotValid',
        error: new Error(),
        techDescription: 'token expired or not valid',
        toNotify: false,
        blocking: false,
        displayableTitle: 'Redirecting you to the login page',
        displayableDescription: 'Your session has expired',
      })
  );
  
  storageUserOps.delete();
  window.location.assign(CONFIG.URL_FE.LOGIN);
};

export const RolePermissionApi = {
  userPermission: async (): Promise<UserPermissionDTO> => {
    try {
      const result = await registerClient.userPermission({});
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error, "userPermission");
      return {} as UserPermissionDTO;
    }
  },

  getPortalConsent: async (): Promise<PortalConsentDTO> => {
    try {
      const result = await registerClient.getPortalConsent({});
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error, "getPortalConsent");
      return {} as PortalConsentDTO;
    }
  },

  savePortalConsent: async (versionId: string | undefined): Promise<void> => {
    try {
      const result = await registerClient.savePortalConsent({ body: { versionId } });
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error, "savePortalConsent");
      return;
    }
  },
};

function buildParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
  );
}

function logApiError(error: any, apiName?: string, originalResponse?: any) {
  if (!DEBUG_CONSOLE) {
    return;
  }
  const errorKey = error?.response?.data?.errorKey;
  if (errorKey) {
    console.error(`Error Key: ${errorKey}`);
  }
  const pretty = (val: any) =>
    typeof val === "string"
      ? val
      : val !== undefined
        ? JSON.stringify(val, null, 2)
        : "N/A";
  const apiLabel = apiName ? `[API ERROR] RegisterApi.${apiName}` : "[API ERROR] RegisterApi";
  if (console.groupCollapsed) {
    console.groupCollapsed(apiLabel);
  } else {
    console.error(apiLabel);
  }
  console.error("Message:", pretty(error?.message));
  console.error("Error name:", error?.name ?? "N/A");
  console.error("Stack:", pretty(error?.stack));
  logIoTsValidationErrors(error, originalResponse);
  console.error("Full error object:", pretty(error));
  if (console.groupEnd) {
    console.groupEnd();
  }
}

function logIoTsValidationErrors(error: any, originalResponse?: any) {
  if (!DEBUG_CONSOLE) {
    return;
  }
  if (error && error.errors && Array.isArray(error.errors)) {
    console.error("io-ts validation details:");
    error.errors.forEach((e: any, idx: number) => {
      const pathArr = e.context?.map((c: any) => c.key) || [];
      const pathStr = pathArr.join('.');
      const productLog =
        pathArr[0] === 'content' &&
        pathArr.length > 2 &&
        originalResponse?.content
          ? (() => {
              const index = parseInt(pathArr[1], 10);
              const product = originalResponse.content[index];
              if (product && typeof product === 'object') {
                const mainKeys = [
                  'gtinCode',
                  'organizationId',
                  'registrationDate',
                  'status',
                  'model',
                  'productGroup',
                  'category',
                  'brand',
                  'eprelCode',
                  'productCode',
                  'countryOfProduction',
                  'energyClass',
                  'linkEprel',
                  'batchName',
                  'productName',
                  'capacity',
                  'organizationName'
                ];
                const productSummary = mainKeys.reduce(
                  (acc, key) => ({ ...acc, [key]: product[key] }),
                  {} as Record<string, any>
                );
                return `\n  [PRODUCT ERROR CONTEXT] Product at index ${index}: ${JSON.stringify(productSummary, null, 2)}`;
              }
              return '';
            })()
          : '';
      console.error(
        `  [${idx}] path: ${pathStr}, expected: ${e.context?.[e.context.length-1]?.type?.name}, actual: ${JSON.stringify(e.value)}${productLog}`
      );
    });
  }
}

function safeApiCall<T extends Either<any, any>>(
  apiCall: () => Promise<any>,
  fallback: T
): Promise<T> {
  return apiCall()
    .then((result) => (extractResponse(result, 200, onRedirectToLogin) as unknown as T) ?? fallback)
    .catch((error) => {
      logApiError('safeApiCall' ,error);
      return fallback;
    });
}

type StatusUpdater = (
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
  motivation: string,
  formalMotivation?: string
) => Promise<ProductsUpdateDTO>;

function makeStatusUpdater(
  apiMethod: (params: { body: any }) => Promise<any>,
  needsFormalMotivation = false
): StatusUpdater {
  return async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatusEnum,
    motivation: string,
    formalMotivation?: string
  ): Promise<ProductsUpdateDTO> => {
    try {
      const body = needsFormalMotivation
        ? {
            gtinCodes,
            currentStatus,
            motivation: typeof motivation === 'string' ? motivation.trim() : motivation,
            ...(formalMotivation
              ? { formalMotivation: typeof formalMotivation === 'string' ? formalMotivation.trim() : formalMotivation }
              : {})
          }
        : {
            gtinCodes,
            currentStatus,
            motivation: typeof motivation === 'string' ? motivation.trim() : motivation
          };
      const result = await apiMethod({ body });
      return (extractResponse(result, 200, onRedirectToLogin) as unknown as ProductsUpdateDTO) ?? {};
    } catch (error) {
      logApiError(error, "makeStatusUpdater");
      return {} as ProductsUpdateDTO;
    }
  };
}

export const RegisterApi = {
  getProduct: async (
    xOrganizationSelected: string,
    page?: number,
    size?: number,
    sort?: string,
    category?: string,
    status?: string,
    eprelCode?: string,
    gtinCode?: string,
    productCode?: string,
    productFileId?: string,
  ): Promise<ProductDTO | undefined> => {
    const params = buildParams({
      organizationId: xOrganizationSelected,
      page,
      size,
      sort,
      category,
      status,
      eprelCode,
      gtinCode,
      productCode,
      productFileId,
    });
    const fallback = right({ status: 200, value: { content: [] } } as unknown as IResponseType<200, ProductListDTO>);
    const productListValidation = await safeApiCall(
      () => registerClient.getProducts(params),
      fallback
    );
    const productList = (productListValidation as any)?.right?.value ?? (productListValidation as any)?.value ?? {};
    const content = productList?.content ?? [];
    if (Array.isArray(content) && content.length > 0) {
      return content[0];
    }
    return undefined;
  },

  getProductList: async (
    xOrganizationSelected: string,
    page?: number,
    size?: number,
    sort?: string,
    category?: string,
    status?: string,
    eprelCode?: string,
    gtinCode?: string,
    productCode?: string,
    productFileId?: string,
  ): Promise<ProductListDTO> => {
    const params = buildParams({
      organizationId: xOrganizationSelected,
      page,
      size,
      sort,
      category,
      status,
      eprelCode,
      gtinCode,
      productCode,
      productFileId,
    });
    return safeApiCall(
      () => registerClient.getProducts(params),
      right({ status: 200, value: { content: [] } } as unknown as IResponseType<200, ProductListDTO>)
    );
  },

  getProductFiles: async (page?: number, size?: number): Promise<UploadsListDTO> => {
    const params = buildParams({ page, size });
    return safeApiCall(
      () => registerClient.getProductFilesList(params),
      right({ status: 200, value: { content: [] } } as unknown as IResponseType<200, UploadsListDTO>)
    );
  },

  getBatchFilterItems: async (xOrganizationSelected: string): Promise<BatchList> => {
    const trimmed = (xOrganizationSelected ?? '').trim();
    const params: Record<string, string> = {};
    if (trimmed) {

      // eslint-disable-next-line functional/immutable-data
      params['x-organization-selected'] = trimmed;
    }
    const batchListValidation = await safeApiCall(
      () => registerClient.getBatchNameList(params),
      right({ status: 200, value: [] } as unknown as IResponseType<200, BatchList>)
    );
    return (batchListValidation as any)?.right?.value ?? (batchListValidation as any)?.value ?? [];
  },
  uploadProductList: async (csv: File, category: string): Promise<RegisterUploadResponseDTO> => {
    try {
      const result = await registerClient.uploadProductList({ csv, category });
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error, "uploadProductList");
      return {} as RegisterUploadResponseDTO;
    }
  },
  uploadProductListVerify: async (csv: File, category: string): Promise<RegisterUploadResponseDTO> => {
    try {
      const result = await registerClient.verifyProductList({ csv, category });
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error, "uploadProductListVerify");
      return {} as RegisterUploadResponseDTO;
    }
  },
  // eslint-disable-next-line complexity
  downloadErrorReport: async (
    productFileId: string
  // eslint-disable-next-line sonarjs/cognitive-complexity
  ): Promise<{ data: CsvDTO; filename: string; warning?: string }> => {
    const response = await registerClient.downloadErrorReport({ productFileId });
    if (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      typeof (response as any).data === 'string' &&
      ((response as any).data as string).trim() !== ''
    ) {
      return {
        data: { data: (response as any).data },
        filename: '',
        warning: undefined
      };
    }

    function extractFileNameFromHeaders(headers: any): string {
      const contentDisposition =
        headers?.get?.('content-disposition') ??
        headers?.get?.('Content-Disposition') ??
        headers?.['content-disposition'] ??
        headers?.['Content-Disposition'] ??
        '';
      if (typeof contentDisposition === 'string' && contentDisposition.length > 0) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          return match[1];
        }
      }
      return '';
    }

    function extractCsvData(response: any): CsvDTO {
      try {
        const extracted = extractResponse(response, 200, onRedirectToLogin);
        return extracted ?? {};
      } catch (error) {
        logApiError(error, response);
        return {};
      }
    }

    async function extractCsvFromRawShapesAsync(response: any, rawResponse: any): Promise<CsvDTO> {
      if (response && typeof response.data === 'string' && response.data.trim() !== '') {
        return { data: response.data };
      }

      const extracted = extractCsvData(response);
      if (extracted && Object.keys(extracted).length > 0) {
        return extracted;
      }

      const asAny = rawResponse as any;
      const isNonEmpty = (v: any): v is string => typeof v === 'string' && v.length > 0;

      const syncCandidates = [
        response,
        rawResponse,
        asAny?.data,
        (response as any)?.body,
        (response as any)?.body?.data,
        asAny?.response,
        asAny?.response?.data,
      ];

      for (const c of syncCandidates) {
        if (isNonEmpty(c)) {
          return { data: c };
        }
      }

      const tryText = async (obj: any): Promise<string | undefined> => {
        if (!obj || typeof obj.text !== 'function') {
          return undefined;
        }
        try {
          const txt = await obj.text();
          return isNonEmpty(txt) ? txt : undefined;
        } catch {
          return undefined;
        }
      };

      const objsToTry = [
        rawResponse,
        response,
        (response as any)?.body,
        (response as any)?.response,
        (rawResponse as any)?.response,
      ];

      for (const obj of objsToTry) {
        const txt = await tryText(obj);
        if (isNonEmpty(txt)) {
          return { data: txt };
        }
      }

      return extracted;
    }

    const rawResponse =
      (response as any)?.response || (response as any)?.data || (response as any)?.right;
    const headers = rawResponse?.headers ?? (response as any)?.headers;
    const fileName = extractFileNameFromHeaders(headers);
    const responseData: CsvDTO = await extractCsvFromRawShapesAsync(response, rawResponse);
    return { data: responseData, filename: fileName };
  },
  getInstitutionsList: async (): Promise<InstitutionsResponse> =>
    safeApiCall(
      () => registerClient.getInstitutionsList({}),
      right({ status: 200, value: { institutions: [] } } as unknown as IResponseType<200, InstitutionsResponse>)
    ),

  getInstitutionById: async (institutionId: string): Promise<InstitutionsResponse> =>
    safeApiCall(
      () => registerClient.retrieveInstitutionById({ institutionId }),
      right({ status: 200, value: { institutions: [] } } as unknown as IResponseType<200, InstitutionsResponse>)
    ),

  setSupervisionedStatusList: makeStatusUpdater(registerClient.updateProductStatusSupervised),
  setApprovedStatusList: makeStatusUpdater(registerClient.updateProductStatusApproved),
  setWaitApprovedStatusList: makeStatusUpdater(registerClient.updateProductStatusWaitApproved),
  setRejectedStatusList: makeStatusUpdater(registerClient.updateProductStatusRejected, true),
  setRestoredStatusList: makeStatusUpdater(registerClient.updateProductStatusRestored),
};
