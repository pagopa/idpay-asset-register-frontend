import {
    uploadProductList,
    uploadProductListVerify,
    downloadErrorReport,
    getProductFilesList,
    getProducts,
    getInstitutionsList,
    getInstitutionById,
} from '../registerService';
import { RegisterApi } from '../../api/registerApiClient';

jest.mock('../../api/registerApiClient', () => ({
    RegisterApi: {
        uploadProductList: jest.fn(),
        uploadProductListVerify: jest.fn(),
        downloadErrorReport: jest.fn(),
        getProductFiles: jest.fn(),
        getProductList: jest.fn(),
        getInstitutionsList: jest.fn(),
        getInstitutionById: jest.fn(),
    },
}));

describe('Register Service', () => {
    const mockFile = new File(['csv content'], 'test.csv', { type: 'text/csv' });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadProductList', () => {
        it('calls API and returns response', async () => {
            const mockResponse = { id: '123' };
            (RegisterApi.uploadProductList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await uploadProductList(mockFile, 'CATEGORY');
            expect(RegisterApi.uploadProductList).toHaveBeenCalledWith(mockFile, 'CATEGORY');
            expect(result).toEqual(mockResponse);
        });

        it('propagates API errors', async () => {
            const mockError = new Error('Upload failed');
            (RegisterApi.uploadProductList as jest.Mock).mockRejectedValue(mockError);

            await expect(uploadProductList(mockFile, 'CATEGORY')).rejects.toThrow('Upload failed');
        });
    });

    describe('uploadProductListVerify', () => {
        it('calls API and returns response', async () => {
            const mockResponse = { id: '456' };
            (RegisterApi.uploadProductListVerify as jest.Mock).mockResolvedValue(mockResponse);

            const result = await uploadProductListVerify(mockFile, 'CATEGORY');
            expect(RegisterApi.uploadProductListVerify).toHaveBeenCalledWith(mockFile, 'CATEGORY');
            expect(result).toEqual(mockResponse);
        });

        it('propagates API errors', async () => {
            const mockError = new Error('Verify failed');
            (RegisterApi.uploadProductListVerify as jest.Mock).mockRejectedValue(mockError);

            await expect(uploadProductListVerify(mockFile, 'CATEGORY')).rejects.toThrow('Verify failed');
        });
    });

    describe('downloadErrorReport', () => {
        it('calls API and returns response', async () => {
            const mockResponse = { data: { content: 'error' }, filename: 'report.csv' };
            (RegisterApi.downloadErrorReport as jest.Mock).mockResolvedValue(mockResponse);

            const result = await downloadErrorReport('file-id');
            expect(RegisterApi.downloadErrorReport).toHaveBeenCalledWith('file-id');
            expect(result).toEqual(mockResponse);
        });

        it('propagates API errors', async () => {
            const mockError = new Error('Download failed');
            (RegisterApi.downloadErrorReport as jest.Mock).mockRejectedValue(mockError);

            await expect(downloadErrorReport('file-id')).rejects.toThrow('Download failed');
        });
    });

    describe('getProductFilesList', () => {
        it('returns data when API call succeeds', async () => {
            const mockData = { content: [] };
            (RegisterApi.getProductFiles as jest.Mock).mockResolvedValue(mockData);

            const result = await getProductFilesList(1, 10);
            expect(RegisterApi.getProductFiles).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual(mockData);
        });

        it('calls API with undefined parameters', async () => {
            const mockData = { content: [] };
            (RegisterApi.getProductFiles as jest.Mock).mockResolvedValue(mockData);

            const result = await getProductFilesList();
            expect(RegisterApi.getProductFiles).toHaveBeenCalledWith(undefined, undefined);
            expect(result).toEqual(mockData);
        });

        it('throws API error data when response has error.response.data', async () => {
            const mockErrorData = { message: 'API Error', code: 400 };
            const mockError = {
                response: {
                    data: mockErrorData
                }
            };
            (RegisterApi.getProductFiles as jest.Mock).mockRejectedValue(mockError);

            await expect(getProductFilesList(1, 10)).rejects.toEqual(mockErrorData);
        });

        it('throws original error when no error.response.data', async () => {
            const mockError = new Error('Network error');
            (RegisterApi.getProductFiles as jest.Mock).mockRejectedValue(mockError);

            await expect(getProductFilesList(1, 10)).rejects.toThrow('Network error');
        });

        it('throws original error when error.response exists but no data', async () => {
            const mockError = {
                response: {}
            };
            (RegisterApi.getProductFiles as jest.Mock).mockRejectedValue(mockError);

            await expect(getProductFilesList(1, 10)).rejects.toEqual(mockError);
        });
    });

    describe('getProducts', () => {
        it('returns data when API call succeeds with all parameters', async () => {
            const mockData = { content: [] };
            (RegisterApi.getProductList as jest.Mock).mockResolvedValue(mockData);

            const result = await getProducts('org-id', 1, 10, 'asc', 'cat', 'eprel', 'gtin', 'prod', 'file');
            expect(RegisterApi.getProductList).toHaveBeenCalledWith(
                'org-id', 1, 10, 'asc', 'cat', 'eprel', 'gtin', 'prod', 'file', undefined
            );
            expect(result).toEqual(mockData);
        });

        it('returns data when API call succeeds with minimal parameters', async () => {
            const mockData = { content: [] };
            (RegisterApi.getProductList as jest.Mock).mockResolvedValue(mockData);

            const result = await getProducts('org-id');
            expect(RegisterApi.getProductList).toHaveBeenCalledWith(
                'org-id', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined
            );
            expect(result).toEqual(mockData);
        });

        it('throws API error data when response has error.response.data', async () => {
            const mockErrorData = { message: 'Products API Error', code: 403 };
            const mockError = {
                response: {
                    data: mockErrorData
                }
            };
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(mockError);

            await expect(getProducts('org-id')).rejects.toEqual(mockErrorData);
        });

        it('throws original error when no error.response.data', async () => {
            const mockError = new Error('Products network error');
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(mockError);

            await expect(getProducts('org-id')).rejects.toThrow('Products network error');
        });

        it('throws original error when error.response exists but no data', async () => {
            const mockError = {
                response: {}
            };
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(mockError);

            await expect(getProducts('org-id')).rejects.toEqual(mockError);
        });
    });

    describe('getInstitutionsList', () => {
        it('returns data when API call succeeds', async () => {
            const mockData = { institutions: [] };
            (RegisterApi.getInstitutionsList as jest.Mock).mockResolvedValue(mockData);

            const result = await getInstitutionsList();
            expect(RegisterApi.getInstitutionsList).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });

        it('throws API error data when response has error.response.data', async () => {
            const mockErrorData = { message: 'Institutions API Error', code: 500 };
            const mockError = {
                response: {
                    data: mockErrorData
                }
            };
            (RegisterApi.getInstitutionsList as jest.Mock).mockRejectedValue(mockError);

            await expect(getInstitutionsList()).rejects.toEqual(mockErrorData);
        });

        it('throws original error when no error.response.data', async () => {
            const mockError = new Error('Institutions network error');
            (RegisterApi.getInstitutionsList as jest.Mock).mockRejectedValue(mockError);

            await expect(getInstitutionsList()).rejects.toThrow('Institutions network error');
        });

        it('throws original error when error.response exists but no data', async () => {
            const mockError = {
                response: {}
            };
            (RegisterApi.getInstitutionsList as jest.Mock).mockRejectedValue(mockError);

            await expect(getInstitutionsList()).rejects.toEqual(mockError);
        });
    });

    describe('getInstitutionById', () => {
        it('returns data when API call succeeds', async () => {
            const mockData = { id: 'inst-1' };
            (RegisterApi.getInstitutionById as jest.Mock).mockResolvedValue(mockData);

            const result = await getInstitutionById('inst-1');
            expect(RegisterApi.getInstitutionById).toHaveBeenCalledWith('inst-1');
            expect(result).toEqual(mockData);
        });

        it('throws API error data when response has error.response.data', async () => {
            const mockErrorData = { message: 'Institution not found', code: 404 };
            const mockError = {
                response: {
                    data: mockErrorData
                }
            };
            (RegisterApi.getInstitutionById as jest.Mock).mockRejectedValue(mockError);

            await expect(getInstitutionById('inst-1')).rejects.toEqual(mockErrorData);
        });

        it('throws original error when no error.response.data', async () => {
            const mockError = new Error('Institution network error');
            (RegisterApi.getInstitutionById as jest.Mock).mockRejectedValue(mockError);

            await expect(getInstitutionById('inst-1')).rejects.toThrow('Institution network error');
        });

        it('throws original error when error.response exists but no data', async () => {
            const mockError = {
                response: {}
            };
            (RegisterApi.getInstitutionById as jest.Mock).mockRejectedValue(mockError);

            await expect(getInstitutionById('inst-1')).rejects.toEqual(mockError);
        });
    });
});