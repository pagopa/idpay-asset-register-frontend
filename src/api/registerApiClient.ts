import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { DEBUG_CONSOLE } from '../utils/constants';
import { Api, BatchList, CsvDTO, InstitutionResponse, InstitutionsResponse, PortalConsentDTO, ProductDTO, ProductListDTO, ProductStatus, ProductsUpdateDTO, RegisterUploadResponseDTO, RequestParams, UploadProductListParams, UploadsListDTO, UserPermissionDTO, VerifyProductListParams } from "./generated/register";

const sanitizeHeaders = (config: InternalAxiosRequestConfig, token: string) => {
  if(token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  const headerKeys = Object.keys(config.headers.toJSON());
  headerKeys.forEach((key) => {
    const value = config.headers.get(key);
    const isInvalid = 
      value === null || 
      value === undefined || 
      value === '' || 
      value === 'undefined' || 
      value === 'null';

    if (isInvalid) {
      config.headers.delete(key);
    }
  });
  return config;
};

export const registerClient = new Api({
  baseURL: ENV.URL_API.OPERATION,
});

const internalAxios = registerClient.instance;

internalAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storageTokenOps.read();
  return sanitizeHeaders(config, token);
});

internalAxios.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      onRedirectToLogin();
    }
    return Promise.reject(error);
  }
);

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
  userPermission: async (): Promise<AxiosResponse<UserPermissionDTO>> => {
    try {
      return await registerClient.permissions.userPermission({});
    } catch (error) {
      logApiError(error, "userPermission");
      return {} as AxiosResponse<UserPermissionDTO>;
    }
  },

  getPortalConsent: async (): Promise<AxiosResponse<PortalConsentDTO>> => {
    try {
      return await registerClient.consent.getPortalConsent({});
    } catch (error) {
      logApiError(error, "getPortalConsent");
      return {} as AxiosResponse<PortalConsentDTO>;
    }
  },

  savePortalConsent: async (versionId: string | undefined): Promise<AxiosResponse<void> | undefined> => {
    try {
      return await registerClient.consent.savePortalConsent({ versionId });
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
        `  [${idx}] path: ${pathStr}, expected: ${e.context?.[e.context.length - 1]?.type?.name}, actual: ${JSON.stringify(e.value)}${productLog}`
      );
    });
  }
}

type StatusUpdater = (
  gtinCodes: Array<string>,
  currentStatus: ProductStatus,
  motivation: string,
  formalMotivation?: string
) => Promise<ProductsUpdateDTO>;

function makeStatusUpdater(
  apiMethod: (data: ProductsUpdateDTO, params?: RequestParams) => Promise<any>,
  needsFormalMotivation = false
): StatusUpdater {
  return async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatus,
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
      const result = await apiMethod(body);
      return result ?? {};
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
    try {
      const productListValidation = await registerClient.products.getProducts(params);
      const productList = (productListValidation as any)?.value ?? {};
      const content = productList?.content ?? [];
      if (Array.isArray(content) && content.length > 0) {
        return content[0];
      }
      return undefined;
    } catch (error) {
      return { status: 200, value: { content: [] } } as unknown as ProductDTO;
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
  ): Promise<AxiosResponse<ProductListDTO>> => {
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
    try {
      return await registerClient.products.getProducts(params);
    } catch (error) {
      return { content: [] } as unknown as AxiosResponse<ProductListDTO>;
    }
  },

  getProductFiles: async (page?: number, size?: number): Promise<AxiosResponse<UploadsListDTO>> => {
    const params = buildParams({ page, size });
    try {
      return await registerClient.productFiles.getProductFilesList(params);
    } catch (error) {
      return { status: 200, value: { content: [] } } as unknown as AxiosResponse<UploadsListDTO>;
    }
  },

  getBatchFilterItems: async (xOrganizationSelected: string): Promise<BatchList> => {
    const trimmed = (xOrganizationSelected ?? '').trim();
    const params: Record<string, string> = {};
    if (trimmed) {

      // eslint-disable-next-line functional/immutable-data
      params['x-organization-selected'] = trimmed;
    }
    try {
      const batchListValidation = await registerClient.productFiles.getBatchNameList(params);
      const result: BatchList =
        Array.isArray((batchListValidation as any)?.right)
          ? (batchListValidation as any).right
          : Array.isArray((batchListValidation as any)?.value)
            ? (batchListValidation as any).value
            : Array.isArray(batchListValidation)
              ? (batchListValidation as BatchList)
              : [];
      return result;
    } catch (error) {
      return [] as BatchList;
    }
  },

  uploadProductList: async (csv: File, category: UploadProductListParams["category"]): Promise<AxiosResponse<RegisterUploadResponseDTO>> => {
    try {
      return await registerClient.productFiles.uploadProductList({ category }, { csv });
    } catch (error) {
      logApiError(error, "uploadProductList");
      return {} as AxiosResponse<RegisterUploadResponseDTO>;
    }
  },
  uploadProductListVerify: async (csv: File, category: VerifyProductListParams["category"]): Promise<AxiosResponse<RegisterUploadResponseDTO>> => {
    try {
      return await registerClient.productFiles.verifyProductList({ category }, { csv });
    } catch (error) {
      logApiError(error, "uploadProductListVerify");
      return {} as AxiosResponse<RegisterUploadResponseDTO>;
    }
  },
  // eslint-disable-next-line complexity
  downloadErrorReport: async (
    productFileId: string
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ): Promise<{ data: CsvDTO; filename: string; warning?: string }> => {
    const response = await registerClient.productFiles.downloadErrorReport({ productFileId });
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
        const extracted = response;
        return (extracted ?? {}) as CsvDTO;
      } catch (error) {
        logApiError(error, response);
        return {} as unknown as CsvDTO;
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

  getInstitutionsList: async (): Promise<AxiosResponse<InstitutionsResponse>> => {
    try {
      return registerClient.institutions.getInstitutionsList({});
    } catch (error) {
      return { status: 200, value: { institutions: [] } } as unknown as AxiosResponse<InstitutionsResponse>;
    }
  },

  getInstitutionById: async (institutionId: string): Promise<AxiosResponse<InstitutionResponse>> => {
    try {
      return registerClient.institutions.retrieveInstitutionById({ institutionId });
    } catch (error) {
      return { status: 200, value: { institutions: [] } } as unknown as AxiosResponse<InstitutionResponse>;
    }
  },

  setSupervisionedStatusList: makeStatusUpdater(registerClient.products.updateProductStatusSupervised),
  setApprovedStatusList: makeStatusUpdater(registerClient.products.updateProductStatusApproved),
  setWaitApprovedStatusList: makeStatusUpdater(registerClient.products.updateProductStatusWaitApproved),
  setRejectedStatusList: makeStatusUpdater(registerClient.products.updateProductStatusRejected, true),
  setRestoredStatusList: makeStatusUpdater(registerClient.products.updateProductStatusRestored),
};
