import { UploadsListDTO } from "../api/generated/register/UploadsListDTO";
import { UploadsErrorDTO } from "../api/generated/register/UploadsErrorDTO";
import { RegisterApi } from "../api/registerApiClient";



export const getProductFilesList = async (
    page?: number,
    size?: number,
    sort?: string
  ): Promise<UploadsListDTO> => {
    try {
      return await RegisterApi.getProductFiles(page, size, sort);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const apiError: UploadsErrorDTO = error.response.data;
        throw apiError;
      }
      throw error;
    }
  };
  
