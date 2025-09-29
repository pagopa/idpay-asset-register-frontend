import {RegisterApi} from "../api/registerApiClient";
import { BatchList } from "../api/generated/register/BatchList";
import {RegisterUploadResponseDTO} from "../api/generated/register/RegisterUploadResponseDTO";
import {CsvDTO} from "../api/generated/register/CsvDTO";
import {UploadsListDTO} from "../api/generated/register/UploadsListDTO";
import {InstitutionsResponse} from "../api/generated/register/InstitutionsResponse";
import {InstitutionResponse} from "../api/generated/register/InstitutionResponse";
import {UpdateResponseDTO} from "../api/generated/register/UpdateResponseDTO";
import {ProductListDTO} from "../api/generated/register/ProductListDTO";
import { ProductStatusEnum } from "../api/generated/register/ProductStatus";
import { DEBUG_CONSOLE } from "../utils/constants";


export const uploadProductList = (
    csv: File,
    category: string
): Promise<RegisterUploadResponseDTO> =>
    RegisterApi.uploadProductList( csv, category ).then((res) => res);

export const uploadProductListVerify = (
    csv: File,
    category: string
): Promise<RegisterUploadResponseDTO> =>
    RegisterApi.uploadProductListVerify( csv, category ).then((res) => res);

export const downloadErrorReport = (
    productFileId: string
): Promise<{data: CsvDTO; filename: string}> =>
    RegisterApi.downloadErrorReport(productFileId).then((res) => res);

export const getProductFilesList = async (
    page?: number, size?: number,
  ): Promise<UploadsListDTO> => {
    try {
      return await RegisterApi.getProductFiles(page, size);
    } catch (error: any) {
      logProductError(error);
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  };


function getErrorMessage(error: any) {
  return typeof error === 'object' && error !== null && 'message' in error
    ? (error as { message?: string }).message
    : undefined;
}
function getErrorStack(error: any) {
  return typeof error === 'object' && error !== null && 'stack' in error
    ? (error as { stack?: string }).stack
    : undefined;
}
function getErrorName(error: any) {
  return typeof error === 'object' && error !== null && 'name' in error
    ? (error as { name?: string }).name
    : undefined;
}
function getErrorResponse(error: any) {
  return typeof error === 'object' && error !== null && 'response' in error
    ? (error as any).response
    : undefined;
}
function getErrorResponseData(error: any) {
  const response = getErrorResponse(error);
  return response && 'data' in response ? response.data : undefined;
}
function getErrorResponseStatus(error: any) {
  const response = getErrorResponse(error);
  return response && 'status' in response ? response.status : undefined;
}
function getErrorResponseStatusText(error: any) {
  const response = getErrorResponse(error);
  return response && 'statusText' in response ? response.statusText : undefined;
}
function getErrorConfig(error: any) {
  return typeof error === 'object' && error !== null && 'config' in error
    ? (error as any).config
    : undefined;
}



// eslint-disable-next-line sonarjs/cognitive-complexity
function logProductError(error: any) {
  if (!DEBUG_CONSOLE) {
    return;
  }

  const details = {
    message: getErrorMessage(error),
    stack: getErrorStack(error),
    name: getErrorName(error),
    response: getErrorResponse(error),
    responseData: getErrorResponseData(error),
    responseStatus: getErrorResponseStatus(error),
    responseStatusText: getErrorResponseStatusText(error),
    config: getErrorConfig(error),
  };

  const pretty = (val: any) => {
    if (val === undefined) {return "N/A";}
    if (val === null) {return "null";}
    if (typeof val === "string") {
      if (val.trim() === "") {return '""';}
      return val;
    }
    if (typeof val === "object") {
      try {
        return JSON.stringify(val, null, 2);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  console.groupCollapsed?.(
    "[API ERROR] Product list retrieval"
  );

  // eslint-disable-next-line functional/no-let
  let errorMsg = "";

  const addLine = (label: string, value: any) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "N/A" &&
      !(typeof value === "string" && value.trim() === "") &&
      !(typeof value === "object" && JSON.stringify(value) === "{}")
    ) {
      errorMsg += `${label}: ${pretty(value)}\n`;
    }
  };

  addLine("Message", details.message);
  addLine("Error name", details.name);
  if (details.responseStatus || details.responseStatusText) {
    errorMsg += `Status: ${details.responseStatus ?? ""}${details.responseStatusText ? ` (${details.responseStatusText})` : ""}\n`;
  }
  addLine("Stack", details.stack);
  addLine("Response Data", details.responseData);
  addLine("Config", details.config);

  if (
    details.responseData &&
    typeof details.responseData === "object" &&
    Array.isArray(details.responseData.content)
  ) {
    details.responseData.content.forEach((product: Record<string, any>, idx: number) => {
      errorMsg += `\nProduct [${idx}] keys and values (NOT EXPECTED):`;
      Object.entries(product).forEach(([key, value]) => {
        errorMsg += `\n  "${key}": ${pretty(value)} NOT EXPECTED`;
      });
    });
  }

  if (typeof error === "object" && error !== null) {
    const filteredEntries = Object.entries(error).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "N/A" &&
        !(typeof value === "string" && value.trim() === "") &&
        !(typeof value === "object" && JSON.stringify(value) === "{}")
    );
    if (filteredEntries.length > 0) {
      errorMsg += filteredEntries
        .map(
          ([key, value]) =>
            `Full error key: "${key}" value: ${pretty(value)}`
        )
        .join("\n");
    }
  } else {
    errorMsg += `Full error: ${pretty(error)}`;
  }

  if (errorMsg.trim() !== "") {
    console.groupCollapsed?.(
      "[API ERROR] Product list retrieval"
    );
    console.error(`***\n${errorMsg.trim()}\n***`);
    console.groupEnd?.();
  }
}

export const getProducts = async (
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
): Promise<ProductListDTO> => {
  try {
    return await RegisterApi.getProductList(
      organizationId,
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
  } catch (error: any) {
    logProductError(error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getInstitutionsList = async (): Promise<InstitutionsResponse> => {
  try {
    return await RegisterApi.getInstitutionsList();
  } catch (error: any) {
    logProductError(error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export const getInstitutionById = async (
    institutionId: string
): Promise<InstitutionResponse> => {
  try {
    return await RegisterApi.getInstitutionById(institutionId);
  } catch (error: any) {
    logProductError(error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export const setSupervisionedStatusList = async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
  motivation: string
): Promise<UpdateResponseDTO> => {
  try {
   return await RegisterApi.setSupervisionedStatusList(gtinCodes, currentStatus, motivation);
  } catch (error: any) {
    logProductError(error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
 };

 
 export const setApprovedStatusList = async (
     gtinCodes: Array<string>,
     currentStatus: ProductStatusEnum,
     motivation: string
): Promise<UpdateResponseDTO> => {
  try {
    return await RegisterApi.setApprovedStatusList(gtinCodes, currentStatus, motivation);
  } catch (error: any) {
    logProductError(error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};
 export const setWaitApprovedStatusList = async (
     gtinCodes: Array<string>,
     currentStatus: ProductStatusEnum,
     motivation: string
): Promise<UpdateResponseDTO> => {
  try {
    return await RegisterApi.setWaitApprovedStatusList(gtinCodes, currentStatus, motivation);
  } catch (error: any) {
    logProductError(error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export const setRejectedStatusList = async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
  motivation: string,
  formalMotivation: string
): Promise<UpdateResponseDTO> => {
  try {
    return await RegisterApi.setRejectedStatusList(gtinCodes, currentStatus, motivation, formalMotivation);
  } catch (error: any) {
    logProductError(error);
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

  export const setRestoredStatusList = async (
      gtinCodes: Array<string>,
      currentStatus: ProductStatusEnum,
      motivation: string
  ): Promise<UpdateResponseDTO> => {
    try {
      return await RegisterApi.setRestoredStatusList(gtinCodes, currentStatus, motivation);
    } catch (error: any) {
      logProductError(error);
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  };

 export const getBatchFilterList = async (xOrganizationSelected: string): Promise<BatchList> => {
   try {
     return await RegisterApi.getBatchFilterItems(xOrganizationSelected);
   } catch (error: any) {
     logProductError(error);
     if (error?.response && error?.response?.data) {
       throw error.response.data;
     }
     throw error;
   }
 };
