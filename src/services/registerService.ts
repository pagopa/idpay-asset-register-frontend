import {RegisterUploadResponseDTO} from "../api/generated/register/RegisterUploadResponseDTO";
import {RegisterApi} from "../api/registerApiClient";

export const uploadProductList = (
    csv: File,
    category: string
): Promise<RegisterUploadResponseDTO> =>
    RegisterApi.uploadProductList( csv, category ).then((res) => res);

export const downloadErrorReport = (
    productFileId: string
): Promise<Blob> =>
    RegisterApi.downloadErrorReport(productFileId).then((res) => res);

