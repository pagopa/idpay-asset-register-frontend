import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import {storageTokenOps, storageUserOps} from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
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
    const result = await registerClient.userPermission({});
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getPortalConsent: async (): Promise<PortalConsentDTO> => {
    const result = await registerClient.getPortalConsent({});
    return extractResponse(result, 200, onRedirectToLogin);
  },

  savePortalConsent: async (versionId: string | undefined): Promise<void> => {
    const result = await registerClient.savePortalConsent({ body: { versionId } });
    return extractResponse(result, 200, onRedirectToLogin);
  },
};

function buildProductParams(
  organizationId: string,
  page?: number,
  size?: number,
  sort?: string,
  category?: string,
  status?: string,
  eprelCode?: string,
  gtinCode?: string,
  productCode?: string,
  productFileId?: string
) {
  return {
    ...(page !== undefined ? { page } : {}),
    ...(size !== undefined ? { size } : {}),
    ...(sort ? { sort } : {}),
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(eprelCode ? { eprelCode } : {}),
    ...(gtinCode ? { gtinCode } : {}),
    ...(productCode ? { productCode } : {}),
    ...(productFileId ? { productFileId } : {}),
    ...(organizationId ? { organizationId } : {}),
  };
}


function logApiError(error: any, originalResponse?: any) {
  if (DEBUG_CONSOLE) {
    const pretty = (val: any) =>
      typeof val === "string"
        ? val
        : val !== undefined
          ? JSON.stringify(val, null, 2)
          : "N/A";
    console.groupCollapsed?.("[API ERROR] RegisterApi");
    console.error("Message:", pretty(error?.message));
    console.error("Error name:", error?.name ?? "N/A");
    console.error("Stack:", pretty(error?.stack));
    logIoTsValidationErrors(error, originalResponse);
    console.error("Full error:", pretty(error));
    console.groupEnd?.();
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
      // eslint-disable-next-line functional/no-let
      let productLog = '';
      if (
        pathArr[0] === 'content' &&
        pathArr.length > 2 &&
        originalResponse?.content
      ) {
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
          const productSummary = mainKeys.reduce((acc, key) => {
            // eslint-disable-next-line functional/immutable-data
            acc[key] = product[key];
            return acc;
          }, {} as Record<string, any>);
          productLog = `\n  [PRODUCT ERROR CONTEXT] Product at index ${index}: ${JSON.stringify(productSummary, null, 2)}`;
        }
      }
      console.error(
        `  [${idx}] path: ${pathStr}, expected: ${e.context?.[e.context.length-1]?.type?.name}, actual: ${JSON.stringify(e.value)}${productLog}`
      );
    });
  }
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
    try {
      const params = buildProductParams(
        xOrganizationSelected,
        page,
        size,
        sort,
        category,
        status,
        eprelCode,
        gtinCode,
        productCode,
        productFileId
      );

      const result = await registerClient.getProducts(params);
      if (!result || typeof result !== 'object') {
        logApiError(new Error('Invalid response from backend'), result);
        return undefined;
      }
      const productList = await extractResponse(result, 200, onRedirectToLogin) as ProductListDTO;
      const content = productList?.content ?? [];
      if (Array.isArray(content) && content.length > 0) {
        return content[0];
      }
      if (DEBUG_CONSOLE) {
        console.warn('No products found with the specified parameters.');
      }
      return undefined;
    } catch (error) {
      logApiError(error);
      return undefined;
    }
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
  ): Promise<ProductListDTO | undefined> => {
    try {
      const params = buildProductParams(
        xOrganizationSelected,
        page,
        size,
        sort,
        category,
        status,
        eprelCode,
        gtinCode,
        productCode,
        productFileId
      );

      const result = await registerClient.getProducts(params);
      if (!result || typeof result !== 'object') {
        logApiError(new Error('Risposta non valida dal backend'), result);
        return undefined;
      }
      try {
        const productList = await extractResponse(result, 200, onRedirectToLogin) as ProductListDTO;
        if (!productList || typeof productList !== 'object') {
          logApiError(new Error('Invalid ProductListDTO'), productList);
          return undefined;
        }
        return productList;
      } catch (error) {
        const responseObj = (result && typeof result === 'object' && 'body' in result)
          ? (result as any).body
          : undefined;
        logApiError(error, responseObj);
        return undefined;
      }
    } catch (error) {
      logApiError(error);
      return undefined;
    }
  },
  getProductFiles: async (page?: number, size?: number): Promise<UploadsListDTO> => {
    try {
      const params = {
        ...(page !== undefined ? { page } : {}),
        ...(size !== undefined ? { size } : {}),
      };

      const result = await registerClient.getProductFilesList(params);
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },
  getBatchFilterItems: async (xOrganizationSelected: string): Promise<BatchList> => {
    try {
      const trimmed = (xOrganizationSelected ?? '').trim();

      const params: Record<string, string> = {};

      if (trimmed) {
        // eslint-disable-next-line functional/immutable-data
        params['x-organization-selected'] = trimmed;
      }

      const result = await registerClient.getBatchNameList(params);
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },
  uploadProductList: async (csv: File, category: string): Promise<RegisterUploadResponseDTO> => {
    const result = await registerClient.uploadProductList({ csv, category });
    return extractResponse(result, 200, onRedirectToLogin);
  },
  uploadProductListVerify: async (csv: File, category: string): Promise<RegisterUploadResponseDTO> => {
    const result = await registerClient.verifyProductList({ csv, category });
    return extractResponse(result, 200, onRedirectToLogin);
  },
  // eslint-disable-next-line complexity
  downloadErrorReport: async (
    productFileId: string
  // eslint-disable-next-line sonarjs/cognitive-complexity
  ): Promise<{ data: CsvDTO; filename: string }> => {
    const response = await registerClient.downloadErrorReport({ productFileId });
    if (DEBUG_CONSOLE) {
      try {
        console.debug('RegisterApi.downloadErrorReport raw response:', response);
      } catch (e) {
        console.debug('RegisterApi.downloadErrorReport raw response');
      }
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
      // Try existing extractor first
      const extracted = extractCsvData(response);
      if (extracted && Object.keys(extracted).length > 0) {
        return extracted;
      }

      const asAny = rawResponse as any;

      const isNonEmpty = (v: any): v is string => typeof v === 'string' && v.length > 0;

      // synchronous candidates to check first (include `response` itself because sometimes the fetch wrapper returns a raw string)
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
          if (DEBUG_CONSOLE) {
            console.debug('downloadErrorReport: used fallback CSV content from synchronous raw shape');
          }
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
          if (DEBUG_CONSOLE) {
            console.debug('downloadErrorReport: used fallback CSV content from async text() call');
          }
          return { data: txt };
        }
      }

      if (DEBUG_CONSOLE) {
        console.warn('CSV data missing in the response after trying async fallbacks');
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
  getInstitutionsList: async (): Promise<InstitutionsResponse> => {
    try {
      const result = await registerClient.getInstitutionsList({});
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },
  getInstitutionById: async (institutionId: string): Promise<InstitutionsResponse> => {
    try {
      const result = await registerClient.retrieveInstitutionById({ institutionId });
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },

  setSupervisionedStatusList: async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatusEnum,
    motivation: string
  ): Promise<ProductsUpdateDTO> => {
    try {
      const body = { gtinCodes, currentStatus, motivation };
      const result = await registerClient.updateProductStatusSupervised({
        body
      });
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },

 setApprovedStatusList: async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
  motivation: string
  ): Promise<ProductsUpdateDTO> => {
    try {
      const body = { gtinCodes, currentStatus, motivation };
      const result = await registerClient.updateProductStatusApproved(
        { body }
      );
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },

  setWaitApprovedStatusList: async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatusEnum,
    motivation: string
  ): Promise<ProductsUpdateDTO> => {
    try {
      const body = { gtinCodes, currentStatus, motivation };
      const result = await registerClient.updateProductStatusWaitApproved(
        { body }
      );
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },

  setRejectedStatusList: async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatusEnum,
    motivation: string,
    formalMotivation: string
  ): Promise<ProductsUpdateDTO> => {
    try {
      const body = {
        gtinCodes,
        currentStatus,
        motivation, 
        formalMotivation
      };
      const result = await registerClient.updateProductStatusRejected(
        { body }
      );
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },

  setRestoredStatusList: async (
      gtinCodes: Array<string>,
      currentStatus: ProductStatusEnum,
      motivation: string
  ): Promise<ProductsUpdateDTO> => {
    try {
      const body = { gtinCodes, currentStatus, motivation };
      const result = await registerClient.updateProductStatusRestored(
          { body }
      );
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      logApiError(error);
      throw error;
    }
  },
};
