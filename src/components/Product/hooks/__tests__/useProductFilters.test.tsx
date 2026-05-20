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
});
