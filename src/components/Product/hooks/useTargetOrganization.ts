import { useMemo } from 'react';
import { ProductTableConfig } from '../../../model/config/ConfigSchema';

type Params = {
  organizationId: string;
  user: any;
  filtersValue: Record<string, any>;
  institutionId?: string;
  tableConfig?: ProductTableConfig;
};

export function useTargetOrganization({
  organizationId,
  user,
  filtersValue,
  institutionId,
  tableConfig,
}: Params) {
  const organizationSource = tableConfig?.organizationSource ?? 'user';

  const targetId = useMemo(() => {
    if (organizationSource === 'filter') {
      return filtersValue?.producer || institutionId || '';
    }

    return organizationId || user?.org_id || '';
  }, [organizationSource, filtersValue, institutionId, organizationId, user]);

  return {
    targetId,
  };
}
