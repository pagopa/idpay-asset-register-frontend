import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useEnrichedProductFilters } from '../useEnrichedProductFilters';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

const t = ((key: string) => `translated:${key}`) as any;

describe('useEnrichedProductFilters', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockReturnValue([
      { institutionId: 'producer-1', description: 'Producer One' },
      { institutionId: 'producer-2', description: 'Producer Two' },
    ]);
  });

  it('returns undefined config when filters are not configured', () => {
    const { result } = renderHook(() =>
      useEnrichedProductFilters({
        isInvitalia: false,
        typedConfig: {} as any,
        filtersConfig: undefined,
        batchFilter: {},
        t,
      })
    );

    expect(result.current.enrichedFiltersConfig).toBeUndefined();
  });

  it('enriches category, status, batch and producer filters', () => {
    const batchFilter = {
      file1: { label: 'Batch One', value: 'Batch One' },
    };

    const { result } = renderHook(() =>
      useEnrichedProductFilters({
        isInvitalia: true,
        typedConfig: {
          categories: {
            fridge: { labelKey: 'categories.fridge.label' },
            oven: {},
          },
        } as any,
        filtersConfig: [
          { id: 'category' },
          { id: 'status' },
          { id: 'productFileId' },
          { id: 'producer' },
          { id: 'model' },
        ],
        batchFilter,
        t,
      })
    );

    expect(result.current.enrichedFiltersConfig).toEqual([
      {
        id: 'category',
        options: {
          fridge: { label: 'translated:categories.fridge.label' },
          oven: { label: 'oven' },
        },
      },
      {
        id: 'status',
        options: expect.objectContaining({
          APPROVED: expect.objectContaining({
            labelKey: 'chip.productStatusLabel.approved',
            color: 'success',
          }),
          WAIT_APPROVED: expect.objectContaining({
            labelKey: 'chip.productStatusLabel.waitApproved',
            color: 'info',
          }),
        }),
      },
      { id: 'productFileId', options: batchFilter },
      {
        id: 'producer',
        options: {
          'producer-1': { label: 'Producer One' },
          'producer-2': { label: 'Producer Two' },
        },
      },
      { id: 'model' },
    ]);
  });

  it('builds category options from template categories when initiative categories are missing', () => {
    const { result } = renderHook(() =>
      useEnrichedProductFilters({
        isInvitalia: false,
        typedConfig: {
          templates: {
            categories: {
              washer: {},
              dryer: {},
            },
          },
        } as any,
        filtersConfig: [{ id: 'category', useInitiativeCategories: true }],
        batchFilter: {},
        t,
      })
    );

    expect(result.current.enrichedFiltersConfig?.[0].options).toEqual({
      WASHER: { label: 'translated:categories.washer.label' },
      DRYER: { label: 'translated:categories.dryer.label' },
    });
  });

  it('uses an empty producer options map when the institution list is missing', () => {
    (useSelector as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useEnrichedProductFilters({
        isInvitalia: false,
        typedConfig: {} as any,
        filtersConfig: [{ id: 'producer' }],
        batchFilter: {},
        t,
      })
    );

    expect(result.current.enrichedFiltersConfig).toEqual([{ id: 'producer', options: {} }]);
  });

  it('excludes Invitalia-only statuses for non-Invitalia users', () => {
    const { result } = renderHook(() =>
      useEnrichedProductFilters({
        isInvitalia: false,
        typedConfig: {} as any,
        filtersConfig: [{ id: 'status' }],
        batchFilter: {},
        t,
      })
    );

    expect(result.current.enrichedFiltersConfig?.[0].options).not.toHaveProperty(
      'WAIT_APPROVED'
    );
    expect(result.current.enrichedFiltersConfig?.[0].options).not.toHaveProperty('SUPERVISED');
  });
});
