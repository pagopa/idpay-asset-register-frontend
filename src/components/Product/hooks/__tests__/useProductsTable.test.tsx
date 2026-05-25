import { renderHook, waitFor } from '@testing-library/react';
import { useProductsTable } from '../useProductsTable';
import * as registerService from '../../../../services/registerService';

jest.mock('../../../../services/registerService');

const mockGetProducts = registerService.getProducts as jest.Mock;

describe('useProductsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      useProductsTable({
        initiativeId: '1',
        organizationId: 'org',
        orderBy: 'category',
        order: 'asc',
        page: 0,
        rowsPerPage: 10,
        categoryFilter: '',
        producerFilter: '',
        batchFilter: '',
        eprelCodeFilter: '',
        statusFilter: '',
        gtinCodeFilter: '',
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tableData.length).toBe(1);
    expect(result.current.itemsQty).toBe(1);
  });

  it('handles API error', async () => {
    mockGetProducts.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() =>
      useProductsTable({
        initiativeId: '1',
        organizationId: 'org',
        orderBy: 'category',
        order: 'asc',
        page: 0,
        rowsPerPage: 10,
        categoryFilter: '',
        producerFilter: '',
        batchFilter: '',
        eprelCodeFilter: '',
        statusFilter: '',
        gtinCodeFilter: '',
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tableData).toEqual([]);
  });
});
