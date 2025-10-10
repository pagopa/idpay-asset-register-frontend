import { RegisterApi } from '../../api/registerApiClient';
import {
    uploadProductList,
    uploadProductListVerify,
    downloadErrorReport,
    getProductFilesList,
    getProducts,
    getInstitutionsList,
    getInstitutionById,
    setSupervisionedStatusList,
    setApprovedStatusList,
    setWaitApprovedStatusList,
    setRejectedStatusList,
    setRestoredStatusList,
    getBatchFilterList,
} from '../registerService';

jest.mock('../../api/registerApiClient');
jest.mock('../../utils/constants', () => ({
    DEBUG_CONSOLE: true,
}));

describe('Product Service', () => {
    const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
    const mockCategory = 'test-category';

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'groupCollapsed').mockImplementation();
        jest.spyOn(console, 'groupEnd').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('uploadProductList', () => {
        it('should upload product list successfully', async () => {
            const mockResponse = { id: '123', status: 'success' };
            (RegisterApi.uploadProductList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await uploadProductList(mockFile, mockCategory);

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.uploadProductList).toHaveBeenCalledWith(mockFile, mockCategory);
        });

        it('should handle error and return empty object', async () => {
            const error = new Error('Upload failed');
            (RegisterApi.uploadProductList as jest.Mock).mockRejectedValue(error);

            const result = await uploadProductList(mockFile, mockCategory);

            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle non-Error objects', async () => {
            (RegisterApi.uploadProductList as jest.Mock).mockRejectedValue('String error');

            const result = await uploadProductList(mockFile, mockCategory);

            expect(result).toEqual({});
        });
    });

    describe('uploadProductListVerify', () => {
        it('should verify product list successfully', async () => {
            const mockResponse = { id: '123', verified: true };
            (RegisterApi.uploadProductListVerify as jest.Mock).mockResolvedValue(mockResponse);

            const result = await uploadProductListVerify(mockFile, mockCategory);

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.uploadProductListVerify).toHaveBeenCalledWith(mockFile, mockCategory);
        });

        it('should handle error and return empty object', async () => {
            const error = new Error('Verify failed');
            (RegisterApi.uploadProductListVerify as jest.Mock).mockRejectedValue(error);

            const result = await uploadProductListVerify(mockFile, mockCategory);

            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('downloadErrorReport', () => {
        it('should download error report successfully', async () => {
            const mockData = { rows: [] };
            const mockFilename = 'error-report.csv';
            const mockResponse = { data: mockData, filename: mockFilename };
            (RegisterApi.downloadErrorReport as jest.Mock).mockResolvedValue(mockResponse);

            const result = await downloadErrorReport('file-123');

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.downloadErrorReport).toHaveBeenCalledWith('file-123');
        });

        it('should handle error and return empty data', async () => {
            const error = new Error('Download failed');
            (RegisterApi.downloadErrorReport as jest.Mock).mockRejectedValue(error);

            const result = await downloadErrorReport('file-123');

            expect(result).toEqual({ data: {}, filename: '' });
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getProductFilesList', () => {
        it('should get product files list successfully with pagination', async () => {
            const mockResponse = {
                content: [{ id: '1', name: 'file1' }],
                pageNo: 1,
                pageSize: 10,
                totalElements: 100,
                totalPages: 10,
            };
            (RegisterApi.getProductFiles as jest.Mock).mockResolvedValue(mockResponse);

            const result = await getProductFilesList(1, 10);

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.getProductFiles).toHaveBeenCalledWith(1, 10);
        });

        it('should handle error and return empty list', async () => {
            const error = new Error('Fetch failed');
            (RegisterApi.getProductFiles as jest.Mock).mockRejectedValue(error);

            const result = await getProductFilesList();

            expect(result).toEqual({
                content: [],
                pageNo: 0,
                pageSize: 0,
                totalElements: 0,
                totalPages: 0,
            });
        });

        it('should call without pagination parameters', async () => {
            const mockResponse = {
                content: [],
                pageNo: 0,
                pageSize: 0,
                totalElements: 0,
                totalPages: 0,
            };
            (RegisterApi.getProductFiles as jest.Mock).mockResolvedValue(mockResponse);

            await getProductFilesList();

            expect(RegisterApi.getProductFiles).toHaveBeenCalledWith(undefined, undefined);
        });
    });

    describe('getProducts', () => {
        const organizationId = 'org-123';

        it('should get products successfully with all parameters', async () => {
            const mockResponse = {
                content: [{ id: '1', name: 'Product 1' }],
                pageNo: 1,
                pageSize: 10,
                totalElements: 50,
                totalPages: 5,
            };
            (RegisterApi.getProductList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await getProducts(
                organizationId,
                1,
                10,
                'name',
                'category1',
                'APPROVED',
                'EPREL123',
                'GTIN456',
                'PROD789',
                'FILE123'
            );

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.getProductList).toHaveBeenCalledWith(
                organizationId,
                1,
                10,
                'name',
                'category1',
                'APPROVED',
                'EPREL123',
                'GTIN456',
                'PROD789',
                'FILE123'
            );
        });

        it('should get products with minimal parameters', async () => {
            const mockResponse = {
                content: [],
                pageNo: 1,
                pageSize: 10,
                totalElements: 0,
                totalPages: 0,
            };
            (RegisterApi.getProductList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await getProducts(organizationId);

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.getProductList).toHaveBeenCalledWith(
                organizationId,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            );
        });

        it('should handle null response and return default object', async () => {
            (RegisterApi.getProductList as jest.Mock).mockResolvedValue(null);

            const result = await getProducts(organizationId);

            expect(result).toEqual({
                content: [],
                pageNo: 1000000,
                pageSize: 1000000,
                totalElements: 1000000,
                totalPages: 1000000,
            });
        });

        it('should handle error and return empty list', async () => {
            const error = new Error('API failed');
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(error);

            const result = await getProducts(organizationId);

            expect(result).toEqual({
                content: [],
                pageNo: 0,
                pageSize: 0,
                totalElements: 0,
                totalPages: 0,
            });
        });
    });

    describe('getInstitutionsList', () => {
        it('should get institutions list successfully', async () => {
            const mockResponse = { institutions: [{ id: '1', name: 'Inst1' }] };
            (RegisterApi.getInstitutionsList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await getInstitutionsList();

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.getInstitutionsList).toHaveBeenCalled();
        });

        it('should handle error and return empty institutions list', async () => {
            const error = new Error('Fetch failed');
            (RegisterApi.getInstitutionsList as jest.Mock).mockRejectedValue(error);

            const result = await getInstitutionsList();

            expect(result).toEqual({ institutions: [] });
        });
    });

    describe('getInstitutionById', () => {
        it('should get institution by id successfully', async () => {
            const mockResponse = { id: '123', name: 'Institution 1' };
            (RegisterApi.getInstitutionById as jest.Mock).mockResolvedValue(mockResponse);

            const result = await getInstitutionById('123');

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.getInstitutionById).toHaveBeenCalledWith('123');
        });

        it('should handle error and return empty object', async () => {
            const error = new Error('Not found');
            (RegisterApi.getInstitutionById as jest.Mock).mockRejectedValue(error);

            const result = await getInstitutionById('123');

            expect(result).toEqual({});
        });
    });

    describe('setSupervisionedStatusList', () => {
        it('should set supervised status successfully', async () => {
            const mockResponse = { success: true };
            (RegisterApi.setSupervisionedStatusList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await setSupervisionedStatusList(
                ['GTIN1', 'GTIN2'],
                'APPROVED',
                'Status changed'
            );

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.setSupervisionedStatusList).toHaveBeenCalledWith(
                ['GTIN1', 'GTIN2'],
                'APPROVED',
                'Status changed'
            );
        });

        it('should handle error and return empty object', async () => {
            const error = new Error('Status update failed');
            (RegisterApi.setSupervisionedStatusList as jest.Mock).mockRejectedValue(error);

            const result = await setSupervisionedStatusList(['GTIN1'], 'APPROVED', 'test');

            expect(result).toEqual({});
        });
    });

    describe('setApprovedStatusList', () => {
        it('should set approved status successfully', async () => {
            const mockResponse = { success: true };
            (RegisterApi.setApprovedStatusList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await setApprovedStatusList(['GTIN1'], 'SUPERVISED', 'Approved');

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.setApprovedStatusList).toHaveBeenCalledWith(['GTIN1'], 'SUPERVISED', 'Approved');
        });

        it('should handle error', async () => {
            (RegisterApi.setApprovedStatusList as jest.Mock).mockRejectedValue(new Error('Failed'));

            const result = await setApprovedStatusList(['GTIN1'], 'SUPERVISED', 'Approved');

            expect(result).toEqual({});
        });
    });

    describe('setWaitApprovedStatusList', () => {
        it('should set wait approved status successfully', async () => {
            const mockResponse = { success: true };
            (RegisterApi.setWaitApprovedStatusList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await setWaitApprovedStatusList(['GTIN1'], 'SUPERVISED', 'Waiting');

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.setWaitApprovedStatusList).toHaveBeenCalledWith(
                ['GTIN1'],
                'SUPERVISED',
                'Waiting'
            );
        });

        it('should handle error', async () => {
            (RegisterApi.setWaitApprovedStatusList as jest.Mock).mockRejectedValue(new Error('Failed'));

            const result = await setWaitApprovedStatusList(['GTIN1'], 'SUPERVISED', 'Waiting');

            expect(result).toEqual({});
        });
    });

    describe('setRejectedStatusList', () => {
        it('should set rejected status successfully', async () => {
            const mockResponse = { success: true };
            (RegisterApi.setRejectedStatusList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await setRejectedStatusList(
                ['GTIN1'],
                'APPROVED',
                'Rejected reason',
                'Formal rejection'
            );

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.setRejectedStatusList).toHaveBeenCalledWith(
                ['GTIN1'],
                'APPROVED',
                'Rejected reason',
                'Formal rejection'
            );
        });

        it('should handle error', async () => {
            (RegisterApi.setRejectedStatusList as jest.Mock).mockRejectedValue(new Error('Failed'));

            const result = await setRejectedStatusList(['GTIN1'], 'APPROVED', 'reason', 'formal');

            expect(result).toEqual({});
        });
    });

    describe('setRestoredStatusList', () => {
        it('should set restored status successfully', async () => {
            const mockResponse = { success: true };
            (RegisterApi.setRestoredStatusList as jest.Mock).mockResolvedValue(mockResponse);

            const result = await setRestoredStatusList(['GTIN1'], 'REJECTED', 'Restored');

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.setRestoredStatusList).toHaveBeenCalledWith(['GTIN1'], 'REJECTED', 'Restored');
        });

        it('should handle error', async () => {
            (RegisterApi.setRestoredStatusList as jest.Mock).mockRejectedValue(new Error('Failed'));

            const result = await setRestoredStatusList(['GTIN1'], 'REJECTED', 'Restored');

            expect(result).toEqual({});
        });
    });

    describe('getBatchFilterList', () => {
        it('should get batch filter list successfully', async () => {
            const mockResponse = [{ id: '1', name: 'Batch 1' }];
            (RegisterApi.getBatchFilterItems as jest.Mock).mockResolvedValue(mockResponse);

            const result = await getBatchFilterList('org-123');

            expect(result).toEqual(mockResponse);
            expect(RegisterApi.getBatchFilterItems).toHaveBeenCalledWith('org-123');
        });

        it('should handle error and return empty array', async () => {
            const error = new Error('Fetch failed');
            (RegisterApi.getBatchFilterItems as jest.Mock).mockRejectedValue(error);

            const result = await getBatchFilterList('org-123');

            expect(result).toEqual([]);
        });
    });

    describe('Error logging with different error types', () => {
        it('should log error with message property', async () => {
            const errorWithMessage = { message: 'Test error' };
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(errorWithMessage);

            await getProducts('org-123');

            expect(console.error).toHaveBeenCalled();
        });

        it('should log error with stack property', async () => {
            const errorWithStack = { stack: 'Error\n  at func1\n  at func2\n  at func3\n  at func4\n  at func5\n  at func6' };
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(errorWithStack);

            await getProducts('org-123');

            expect(console.error).toHaveBeenCalled();
        });

        it('should log error with response status and statusText', async () => {
            const errorWithResponse = {
                message: 'API Error',
                response: { status: 500, statusText: 'Internal Server Error' },
            };
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(errorWithResponse);

            await getProducts('org-123');

            expect(console.error).toHaveBeenCalled();
        });

        it('should log error with response data', async () => {
            const errorWithData = {
                response: {
                    status: 400,
                    data: { error: 'Invalid request', details: 'Missing field' },
                },
            };
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(errorWithData);

            await getProducts('org-123');

            expect(console.error).toHaveBeenCalled();
        });

        it('should log error with config url and method', async () => {
            const errorWithConfig = {
                config: { url: '/api/products', method: 'GET' },
            };
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(errorWithConfig);

            await getProducts('org-123');

            expect(console.error).toHaveBeenCalled();
        });

        it('should not log when DEBUG_CONSOLE is false', async () => {
            jest.resetModules();
            jest.doMock('../../utils/constants', () => ({
                DEBUG_CONSOLE: false,
            }));

            const error = new Error('Test error');
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(error);

            await getProducts('org-123');

            // Console should still be called from uploadProductList but not logged
            expect(console.error).not.toHaveBeenCalledWith(
                expect.stringContaining('Error in RegisterApi')
            );
        });
    });

    describe('Error handling with array response data', () => {
        it('should handle error with array response data', async () => {
            const errorWithArrayData = {
                response: {
                    data: ['error1', 'error2', 'error3'],
                },
            };
            (RegisterApi.getProductList as jest.Mock).mockRejectedValue(errorWithArrayData);

            await getProducts('org-123');

            expect(console.error).toHaveBeenCalled();
        });
    });
});