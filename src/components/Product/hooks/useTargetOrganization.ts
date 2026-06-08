import { useMemo } from 'react';
import { ProductTableConfig } from '../../../model/config/ConfigSchema';
import { USERS_TYPES } from '../../../utils/constants';

type Params = {
  organizationId: string;
  user: any;
  filtersValue: Record<string, any>;
  tableConfig?: ProductTableConfig;
};

export function useTargetOrganization({ organizationId, user, filtersValue, tableConfig }: Params) {
  const organizationSource = tableConfig?.organizationSource;

  const targetId = useMemo(() => {
    if (organizationSource === 'user') {
      if (organizationId) {
        return organizationId;
      }

      if (user?.org_role === USERS_TYPES.OPERATORE && user?.org_id) {
        return user.org_id;
      }

      return '';
    }

    if (organizationSource === 'filter') {
      return filtersValue?.producer || organizationId || '';
    }

    return '';
  }, [organizationSource, filtersValue, organizationId, user]);

  return {
    targetId,
  };
}
