import {RegisterUploadResponseDTO} from "../api/generated/register/RegisterUploadResponseDTO";
import {RegisterApi} from "../api/registerApiClient";
import {CsvDTO} from "../api/generated/register/CsvDTO";

export const uploadProductList = (
    csv: File,
    category: string
): Promise<RegisterUploadResponseDTO> =>
    RegisterApi.uploadProductList( csv, category ).then((res) => res);

export const downloadErrorReport = (
    productFileId: string
): Promise<{data: CsvDTO; filename: string}> =>
    RegisterApi.downloadErrorReport(productFileId).then((res) => res);

