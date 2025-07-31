import {RegisterApi} from "../api/registerApiClient";
import {RegisterUploadResponseDTO} from "../api/generated/register/RegisterUploadResponseDTO";
import {CsvDTO} from "../api/generated/register/CsvDTO";
import {UploadsListDTO} from "../api/generated/register/UploadsListDTO";
import {InstitutionsResponse} from "../api/generated/register/InstitutionsResponse";
import {InstitutionResponse} from "../api/generated/register/InstitutionResponse";
import { UpdateResponseDTO } from "../api/generated/register/UpdateResponseDTO";
import { BatchList } from "../api/generated/register/BatchList";
import { ProductListDTO } from "../api/generated/register/ProductListDTO";



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
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  };


export const getProducts = async (
  xOrganizationSelected: string,
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
  } catch (error: any) {
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
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export const setSupervisionedStatusList = async (
  xOrganizationSelected: string,
  gtinCodes: Array<string>,
  motivation: string
): Promise<UpdateResponseDTO> => {
  try {
   return await RegisterApi.setSupervisionedStatusList(xOrganizationSelected,gtinCodes,motivation);
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
 };

 
 export const setApprovedStatusList = async (
  xOrganizationSelected: string,
  gtinCodes: Array<string>,
  motivation: string
): Promise<UpdateResponseDTO> => {
  try {
    return await RegisterApi.setApprovedStatusList(xOrganizationSelected, gtinCodes, motivation);
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

 export const setRejectedStatusList = async (
  xOrganizationSelected: string,
  gtinCodes: Array<string>,
  motivation: string
): Promise<UpdateResponseDTO> => {
  try {
   return await RegisterApi.setRejectedStatusList(xOrganizationSelected,gtinCodes,motivation);
  } catch (error: any) {
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
     if (error?.response && error?.response?.data) {
       throw error.response.data;
     }
     throw error;
   }
 };
