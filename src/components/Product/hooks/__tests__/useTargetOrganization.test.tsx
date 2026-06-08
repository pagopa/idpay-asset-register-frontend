import { renderHook } from '@testing-library/react';
import { useTargetOrganization } from '../useTargetOrganization';

describe('useTargetOrganization', () => {
  it('uses the user organization when configured from user', () => {
    const { result } = renderHook(() =>
      useTargetOrganization({
        organizationId: 'prop-org',
        user: { org_id: 'user-org' },
        filtersValue: {},
        tableConfig: { organizationSource: 'user' } as any,
      })
    );

    expect(result.current.targetId).toBe('user-org');
  });

  it('falls back to empty user organization', () => {
    const { result } = renderHook(() =>
      useTargetOrganization({
        organizationId: 'prop-org',
        user: {},
        filtersValue: {},
        tableConfig: { organizationSource: 'user' } as any,
      })
    );

    expect(result.current.targetId).toBe('');
  });

  it('uses producer filter before institution id when configured from filter', () => {
    const { result } = renderHook(() =>
      useTargetOrganization({
        organizationId: 'prop-org',
        user: { org_id: 'user-org' },
        filtersValue: { producer: 'filtered-producer' },
        institutionId: 'institution-producer',
        tableConfig: { organizationSource: 'filter' } as any,
      })
    );

    expect(result.current.targetId).toBe('filtered-producer');
  });

  it('falls back to organization id and then empty value for filter source', () => {
    const withOrganization = renderHook(() =>
      useTargetOrganization({
        organizationId: 'prop-org',
        user: {},
        filtersValue: {},
        tableConfig: { organizationSource: 'filter' } as any,
      })
    );

    expect(withOrganization.result.current.targetId).toBe('prop-org');

    const withoutOrganization = renderHook(() =>
      useTargetOrganization({
        organizationId: '',
        user: {},
        filtersValue: {},
        tableConfig: { organizationSource: 'filter' } as any,
      })
    );

    expect(withoutOrganization.result.current.targetId).toBe('');
  });

  it('returns an empty target for unknown organization source', () => {
    const { result } = renderHook(() =>
      useTargetOrganization({
        organizationId: 'prop-org',
        user: { org_id: 'user-org' },
        filtersValue: { producer: 'filtered-producer' },
        tableConfig: {} as any,
      })
    );

    expect(result.current.targetId).toBe('');
  });
});
