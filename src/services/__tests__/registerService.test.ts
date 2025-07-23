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
        getProducts: jest.fn(),
        getInstitutionsList: jest.fn(),
        getInstitutionById: jest.fn(),
    },
}));

describe('Register Service', () => {
    const mockFile = new File(['csv content'], 'test.csv', { type: 'text/csv' });

    it('uploadProductList calls API and returns response', async () => {
        const mockResponse = { id: '123' };
        (RegisterApi.uploadProductList as jest.Mock).mockResolvedValue(mockResponse);

        const result = await uploadProductList(mockFile, 'CATEGORY');
        expect(RegisterApi.uploadProductList).toHaveBeenCalledWith(mockFile, 'CATEGORY');
        expect(result).toEqual(mockResponse);
    });

    it('uploadProductListVerify calls API and returns response', async () => {
        const mockResponse = { id: '456' };
        (RegisterApi.uploadProductListVerify as jest.Mock).mockResolvedValue(mockResponse);

        const result = await uploadProductListVerify(mockFile, 'CATEGORY');
        expect(RegisterApi.uploadProductListVerify).toHaveBeenCalledWith(mockFile, 'CATEGORY');
        expect(result).toEqual(mockResponse);
    });

    it('downloadErrorReport calls API and returns response', async () => {
        const mockResponse = { data: { content: 'error' }, filename: 'report.csv' };
        (RegisterApi.downloadErrorReport as jest.Mock).mockResolvedValue(mockResponse);

        const result = await downloadErrorReport('file-id');
        expect(RegisterApi.downloadErrorReport).toHaveBeenCalledWith('file-id');
        expect(result).toEqual(mockResponse);
    });

    it('getProductFilesList returns data or throws API error', async () => {
        const mockData = { content: [] };
        (RegisterApi.getProductFiles as jest.Mock).mockResolvedValue(mockData);

        const result = await getProductFilesList(1, 10, 'asc');
        expect(RegisterApi.getProductFiles).toHaveBeenCalledWith(1, 10, 'asc');
        expect(result).toEqual(mockData);
    });

    it('getProducts returns data or throws API error', async () => {
        const mockData = { content: [] };
        (RegisterApi.getProducts as jest.Mock).mockResolvedValue(mockData);

        const result = await getProducts('org-id', 1, 10, 'asc', 'cat', 'eprel', 'gtin', 'prod', 'file');
        expect(RegisterApi.getProducts).toHaveBeenCalledWith(
            'org-id', 1, 10, 'asc', 'cat', 'eprel', 'gtin', 'prod', 'file'
        );
        expect(result).toEqual(mockData);
    });

    it('getInstitutionsList returns data', async () => {
        const mockData = { institutions: [] };
        (RegisterApi.getInstitutionsList as jest.Mock).mockResolvedValue(mockData);

        const result = await getInstitutionsList();
        expect(RegisterApi.getInstitutionsList).toHaveBeenCalled();
        expect(result).toEqual(mockData);
    });

    it('getInstitutionById returns data', async () => {
        const mockData = { id: 'inst-1' };
        (RegisterApi.getInstitutionById as jest.Mock).mockResolvedValue(mockData);

        const result = await getInstitutionById('inst-1');
        expect(RegisterApi.getInstitutionById).toHaveBeenCalledWith('inst-1');
        expect(result).toEqual(mockData);
    });
});
