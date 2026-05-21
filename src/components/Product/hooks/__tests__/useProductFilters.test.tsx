import { renderHook, act } from '@testing-library/react';
import { useProductFilters } from '../useProductFilters';

describe('useProductFilters', () => {
  it('initializes filters correctly', () => {
    const { result } = renderHook(() =>
      useProductFilters({
        institutions: [],
        batchFilterItems: [],
      })
    );

    expect(result.current.categoryFilter).toBe('');
    expect(result.current.producerFilter).toBe('');
    expect(result.current.batchFilter).toBe('');
  });

  it('updates category filter', () => {
    const { result } = renderHook(() =>
      useProductFilters({
        institutions: [],
        batchFilterItems: [],
      })
    );

    act(() => {
      result.current.setCategoryFilter('TV');
    });

    expect(result.current.categoryFilter).toBe('TV');
  });

  it('resets filters', () => {
    const { result } = renderHook(() =>
      useProductFilters({
        institutions: [],
        batchFilterItems: [],
      })
    );

    act(() => {
      result.current.setCategoryFilter('TV');
      result.current.setProducerFilter('ABC');
      result.current.resetFilters();
    });

    expect(result.current.categoryFilter).toBe('');
    expect(result.current.producerFilter).toBe('');
  });

  it('builds filters label using configured producer and batch labels', () => {
    const { result } = renderHook(() =>
      useProductFilters({
        institutions: [{ institutionId: 'producer-1', description: 'Producer One' }],
        batchFilterItems: [{ productFileId: 'batch-1', batchName: 'Batch One' }],
      })
    );

    act(() => {
      result.current.setCategoryFilter('  TV  ');
      result.current.setStatusFilter('APPROVED');
      result.current.setProducerFilter('producer-1');
      result.current.setBatchFilter('batch-1');
      result.current.setEprelCodeFilter(' EPREL123 ');
      result.current.setGtinCodeFilter('GTIN123');
    });

    expect(result.current.filtersLabel).toBe(
      'TV, APPROVED, Producer One, Batch One, EPREL123, GTIN123'
    );
  });

  it('uses trimmed producer and batch values when no matching label is found', () => {
    const { result } = renderHook(() =>
      useProductFilters({
        institutions: [{ institutionId: 'producer-1', description: 'Producer One' }],
        batchFilterItems: [{ productFileId: 'batch-1', batchName: 'Batch One' }],
      })
    );

    act(() => {
      result.current.setProducerFilter('  missing-producer  ');
      result.current.setBatchFilter('  missing-batch  ');
    });

    expect(result.current.filtersLabel).toBe('missing-producer, missing-batch');
  });

  it('ignores blank filter values in filters label', () => {
    const { result } = renderHook(() =>
      useProductFilters({
        institutions: undefined as any,
        batchFilterItems: undefined as any,
      })
    );

    act(() => {
      result.current.setCategoryFilter('   ');
      result.current.setStatusFilter('');
      result.current.setProducerFilter('   ');
      result.current.setBatchFilter('   ');
      result.current.setEprelCodeFilter('   ');
      result.current.setGtinCodeFilter('   ');
    });

    expect(result.current.filtersLabel).toBe('');
  });
});
