import { renderHook } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { useProductFilters } from '../useProductFilters';

describe('useProductFilters', () => {
  it('should create a list of filters when enriched config is provided', () => {
    const filters = {
      testFilter1: { value: 'test value 1', label: 'test label 1' },
      testFilter2: { value: 'test value 2', label: 'test label 2' },
    };
    const { result } = renderHook(() =>
      useProductFilters({
        filters,
        enrichedFiltersConfig: [{ id: 'testFilter1' }, { id: 'testFilter2' }],
      })
    );
    expect(result.current.filtersLabel).toBe('test label 1, test label 2');
  });

  it('should use value when label is missing and enriched config is provided', () => {
    const filters = {
      testFilter1: { value: 'test value 1' },
      testFilter2: { value: 'test value 2' },
    };
    const { result } = renderHook(() =>
      useProductFilters({
        filters,
        enrichedFiltersConfig: [{ id: 'testFilter1' }, { id: 'testFilter2' }],
      })
    );
    expect(result.current.filtersLabel).toBe('test value 1, test value 2');
  });

  it('should return undefined when filters is missing', () => {
    const { result } = renderHook(() =>
      useProductFilters({ filters: undefined as any, enrichedFiltersConfig: [] })
    );
    expect(result.current.filtersLabel).toBe(undefined);
  });
});
