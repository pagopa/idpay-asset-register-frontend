import { UploadsListDTO } from "../api/generated/register/UploadsListDTO";
import { UploadsErrorDTO } from "../api/generated/register/UploadsErrorDTO";
import { RegisterApi } from "../api/registerApiClient";

interface GetProductFilesListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const getProductFilesList = async (
    params: GetProductFilesListParams = {}
  ): Promise<UploadsListDTO> => {
    try {
      return await RegisterApi.getProductFiles(params);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const apiError: UploadsErrorDTO = error.response.data;
        throw apiError;
      }
      throw error;
    }
  };
  
