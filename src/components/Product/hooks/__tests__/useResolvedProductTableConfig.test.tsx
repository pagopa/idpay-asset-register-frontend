import { renderHook } from '@testing-library/react';
import { useResolvedProductTableConfig } from '../useResolvedProductTableConfig';

describe('useResolvedProductTableConfig', () => {
  it('returns empty values when config is missing', () => {
    const { result } = renderHook(() => useResolvedProductTableConfig());

    expect(result.current).toEqual({
      tableConfig: undefined,
      paginationConfig: undefined,
      filtersConfig: undefined,
      templateConfig: undefined,
    });
  });

  it('resolves table config from ui config', () => {
    const products = {
      pagination: { defaultRowsPerPage: 20 },
      filters: [{ id: 'status' }],
    };
    const templates = { categories: { fridge: {} } };

    const { result } = renderHook(() =>
      useResolvedProductTableConfig({
        ui: {
          tables: {
            products,
          },
        },
        templates,
      } as any)
    );

    expect(result.current).toEqual({
      tableConfig: products,
      paginationConfig: products.pagination,
      filtersConfig: products.filters,
      templateConfig: templates,
    });
  });

  it('resolves table config from legacy tables config', () => {
    const products = {
      pagination: { defaultRowsPerPage: 5 },
      filters: [{ id: 'category' }],
    };

    const { result } = renderHook(() =>
      useResolvedProductTableConfig({
        tables: {
          products,
        },
      } as any)
    );

    expect(result.current.tableConfig).toBe(products);
    expect(result.current.paginationConfig).toBe(products.pagination);
    expect(result.current.filtersConfig).toBe(products.filters);
    expect(result.current.templateConfig).toBeUndefined();
  });

  it('returns no table config when neither ui nor legacy tables are available', () => {
    const { result } = renderHook(() => useResolvedProductTableConfig({ categories: {} } as any));

    expect(result.current.tableConfig).toBeUndefined();
  });
});
