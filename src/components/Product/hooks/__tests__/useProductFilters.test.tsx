import { renderHook, act } from '@testing-library/react';
import { useProductFilters } from '../useProductFilters';

describe('useProductFilters', () => {
  it('should create a list of filters', () => {
    const filters = {
      testFilter1: { value: 'test value 1', label: 'test label 1' },
      testFilter2: { value: 'test value 2', label: 'test label 2' }
    }
    const { result } = renderHook(() =>
      useProductFilters({ filters })
    );
    expect(result.current.filtersLabel).toBe('test label 1, test label 2')
  })
  it('should use value when label is missing', () => {
    const filters = {
      testFilter1: { value: 'test value 1' },
      testFilter2: { value: 'test value 2' }
    }
    const { result } = renderHook(() =>
      useProductFilters({ filters })
    );
    expect(result.current.filtersLabel).toBe('test value 1, test value 2')
  })
  it('should return undefined when filters is missing', () => {
    const { result } = renderHook(() =>
      useProductFilters({filters: undefined})
    );
    expect(result.current.filtersLabel).toBe(undefined)
  })
});
