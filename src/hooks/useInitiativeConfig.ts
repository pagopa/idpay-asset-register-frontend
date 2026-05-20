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
  const [configError, setConfigError] = useState<boolean>(false);

  useEffect(() => {
    if (!initiative || !user?.org_role) {
      return;
    }

    setLoading(true);

    const startDate = (initiative as any)?.startDate ?? '';

    const initiativeNamespace =
      initiative?.initiativeName && startDate
        ? buildNamespaceKey(initiative.initiativeName, startDate)
        : (initiative as any)?.displayName ?? initiative?.initiativeId ?? '';

    void loadItInitiativeConfig(initiativeNamespace, user.org_role)
      .then((cfg) => {
        if ((cfg as any)?.roleConfigMissing) {
          setConfigError(true);
          setConfig(null);
        } else {
          setConfig(cfg);
          setConfigError(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initiative, user?.org_role]);

  return { config, loading, configError };
};
