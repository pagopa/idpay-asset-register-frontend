import { useEffect, useState } from 'react';
import { loadItInitiativeConfig } from '../locale/multiInitiativeConfig';
import { buildNamespaceKey } from '../utils/buildNamespaceKey';
import { useCurrentInitiative } from './useCurrentInitiative';
import { useIDPayUser } from './useIDPayUser';

export const useInitiativeConfig = () => {
  const initiative = useCurrentInitiative();
  const user = useIDPayUser();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!initiative || !user?.org_role) {
      return;
    }

    setLoading(true);

    const initiativeName =
      initiative?.initiativeName && initiative?.startDate
        ? buildNamespaceKey(initiative.initiativeName, initiative.startDate)
        : (initiative as any)?.displayName ?? initiative?.initiativeId;

    void loadItInitiativeConfig(initiativeName, user.org_role)
      .then((cfg) => {
        setConfig(cfg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initiative, user?.org_role]);

  return { config, loading };
};
