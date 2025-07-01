import {RegisterUploadResponseDTO} from "../api/generated/register/RegisterUploadResponseDTO";
import {RegisterApi} from "../api/registerApiClient";

export const uploadProductList = (
    file: File,
    category: string
): Promise<RegisterUploadResponseDTO> =>
    RegisterApi.uploadProductList( file, category ).then((res) => res);

