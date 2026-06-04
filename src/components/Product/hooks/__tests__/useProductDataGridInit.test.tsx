import { renderHook, waitFor } from '@testing-library/react';
import { getBatchFilterList, getProducers } from '../../../../services/registerService';
import { useProductDataGridInit } from '../useProductDataGridInit';

jest.mock('../../../../services/registerService', () => ({
  getBatchFilterList: jest.fn(),
  getProducers: jest.fn(),
}));

describe('useProductDataGridInit', () => {
  beforeEach(() => {
    (getBatchFilterList as jest.Mock).mockResolvedValue({ data: [] });
    (getProducers as jest.Mock).mockResolvedValue({ data: { content: [] } });
  });

  it('initializes without crashing and returns batchFilterItems array', async () => {
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
    await waitFor(() => expect(getBatchFilterList).toHaveBeenCalledWith('1', 'org'));
  });

  it('fetches producers for invitalia users and loads batch filters for the selected institution', async () => {
    const dispatch = jest.fn();
    const setInstitutionList = jest.fn((payload) => ({ type: 'setInstitutionList', payload }));

    (getProducers as jest.Mock).mockResolvedValue({
      data: {
        content: [
          {
            producerId: 'producer-1',
            producerName: 'Producer One',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
          },
          {},
        ],
      },
    });
    (getBatchFilterList as jest.Mock).mockResolvedValue({
      data: [{ productFileId: 'file-1', batchName: 'batch.csv' }],
    });

    const { result } = renderHook(() =>
      useProductDataGridInit({
        initiativeId: 'initiative-1',
        organizationId: 'org-1',
        isInvitaliaUser: true,
        isInvitaliaAdmin: false,
        institutionId: 'producer-1',
        dispatch,
        setInstitutionList,
      })
    );

    await waitFor(() =>
      expect(result.current.batchFilterItems).toEqual([
        { productFileId: 'file-1', batchName: 'batch.csv' },
      ])
    );

    expect(getProducers).toHaveBeenCalledWith('initiative-1');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setInstitutionList',
      payload: [
        {
          institutionId: 'producer-1',
          description: 'Producer One',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
        {
          institutionId: '',
          description: '',
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    expect(getBatchFilterList).toHaveBeenCalledWith('initiative-1', 'producer-1');
  });

  it('falls back to empty batch filters when loading fails', async () => {
    (getBatchFilterList as jest.Mock).mockRejectedValue(new Error('batch error'));

    const { result } = renderHook(() =>
      useProductDataGridInit({
        initiativeId: 'initiative-1',
        organizationId: 'org-1',
        isInvitaliaUser: false,
        isInvitaliaAdmin: false,
        institutionId: '',
        dispatch: jest.fn(),
        setInstitutionList: jest.fn(),
      })
    );

    await waitFor(() => expect(result.current.batchFilterItems).toEqual([]));
    expect(getBatchFilterList).toHaveBeenCalledWith('initiative-1', 'org-1');
  });
});
