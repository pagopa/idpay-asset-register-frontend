import { renderHook, waitFor } from '@testing-library/react';
import { useProductsTable } from '../useProductsTable';
import * as registerService from '../../../../services/registerService';

jest.mock('../../../../services/registerService');

let mockDebugConsole = false;
jest.mock('../../../../utils/constants', () => {
  const actual = jest.requireActual('../../../../utils/constants');
  return {
    ...actual,
    get DEBUG_CONSOLE() {
      return mockDebugConsole;
    },
  };
});

const mockGetProducts = registerService.getProducts as jest.Mock;

describe('useProductsTable', () => {
  const defaultParams = {
    refreshKey: 0,
    initiativeId: '1',
    organizationId: 'org',
    orderBy: 'category' as const,
    order: 'asc' as const,
    page: 0,
    rowsPerPage: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDebugConsole = false;
  });

  it('fetches products successfully', async () => {
    mockGetProducts.mockResolvedValue({
      data: {
        content: [{ gtinCode: '1', status: 'UPLOADED' }],
        pageNo: 0,
        totalElements: 1,
      },
    });

    const { result } = renderHook(() =>
      useProductsTable(defaultParams)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tableData.length).toBe(1);
    expect(result.current.itemsQty).toBe(1);
    expect(result.current.paginatorFrom).toBe(1);
    expect(result.current.paginatorTo).toBe(1);
  });

  it('handles API error', async () => {
    mockGetProducts.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() =>
      useProductsTable(defaultParams)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tableData).toEqual([]);
    expect(result.current.apiErrorOccurred).toBe(true);
  });

  it('logs API errors when debug logging is enabled', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockDebugConsole = true;
    mockGetProducts.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useProductsTable(defaultParams));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(consoleError).toHaveBeenCalledWith(
      'Error fetching products:',
      expect.any(Error)
    );
  });

  it('normalizes filters and calculates a partial page range', async () => {
    mockGetProducts.mockResolvedValue({
      data: {
        content: [{ gtinCode: '1' }],
        pageNo: 1,
        totalElements: 25,
      },
    });

    const { result } = renderHook(() =>
      useProductsTable({
        ...defaultParams,
        page: 1,
        category: 'cookinghobs',
        status: '',
        eprelCode: 'eprel',
        gtinCode: 'gtin',
        productCode: 'product',
        productFileId: 'file',
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetProducts).toHaveBeenCalledWith(
      '1',
      'org',
      1,
      10,
      'category,asc',
      'COOKINGHOBS',
      undefined,
      'eprel',
      'gtin',
      'product',
      'file'
    );
    expect(result.current.paginatorFrom).toBe(11);
    expect(result.current.paginatorTo).toBe(20);
  });

  it('keeps default pagination and uses empty data when response values are absent', async () => {
    mockGetProducts.mockResolvedValue({
      data: {
        content: undefined,
        pageNo: undefined,
        totalElements: 0,
      },
    });

    const { result } = renderHook(() => useProductsTable(defaultParams));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tableData).toEqual([]);
    expect(result.current.paginatorFrom).toBe(1);
    expect(result.current.paginatorTo).toBe(0);
  });

  it('does not fetch when filter source has no organization or product file', async () => {
    const { result } = renderHook(() =>
      useProductsTable({
        ...defaultParams,
        organizationId: '',
        organizationSource: 'filter',
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetProducts).not.toHaveBeenCalled();
    expect(result.current.tableData).toEqual([]);
  });

  it('fetches for filter source when a product file is provided', async () => {
    mockGetProducts.mockResolvedValue({
      data: { content: [], pageNo: 0, totalElements: 0 },
    });

    const { result } = renderHook(() =>
      useProductsTable({
        ...defaultParams,
        organizationId: '',
        organizationSource: 'filter',
        productFileId: 'file',
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetProducts).toHaveBeenCalled();
  });
});
