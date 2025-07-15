import {RegisterApi} from "../api/registerApiClient";
import {RegisterUploadResponseDTO} from "../api/generated/register/RegisterUploadResponseDTO";
import {CsvDTO} from "../api/generated/register/CsvDTO";
import {UploadsListDTO} from "../api/generated/register/UploadsListDTO";
import {InstitutionsResponse} from "../api/generated/register/InstitutionsResponse";


export const uploadProductList = (
    csv: File,
    category: string
): Promise<RegisterUploadResponseDTO> =>
    RegisterApi.uploadProductList( csv, category ).then((res) => res);

export const downloadErrorReport = (
    productFileId: string
): Promise<{data: CsvDTO; filename: string}> =>
    RegisterApi.downloadErrorReport(productFileId).then((res) => res);

export const getProductFilesList = async (
    page?: number,
    size?: number,
    sort?: string
  ): Promise<UploadsListDTO> => {
    try {
      return await RegisterApi.getProductFiles(page, size, sort);
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