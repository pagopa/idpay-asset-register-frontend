import { renderHook } from '@testing-library/react';
import { useProductDataGridInit } from '../useProductDataGridInit';

describe('useProductDataGridInit', () => {
  it('initializes without crashing and returns batchFilterItems array', () => {
    const { result } = renderHook(() =>
      useProductDataGridInit({
        initiativeId: '1',
        organizationId: 'org',
        isInvitaliaUser: false,
        isInvitaliaAdmin: false,
        institutionId: '',
        producerFilter: '',
        setProducerFilter: jest.fn(),
        setStatusFilter: jest.fn(),
        dispatch: jest.fn(),
        setInstitutionList: jest.fn(),
      })
    );

    expect(result.current).toHaveProperty('batchFilterItems');
    expect(Array.isArray(result.current.batchFilterItems)).toBe(true);
  });
});
