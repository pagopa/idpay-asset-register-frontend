import { useEffect, useState } from 'react';
import { loadItInitiativeConfig } from '../locale/multiInitiativeConfig';
import { useCurrentInitiative } from './useCurrentInitiative';
import { useIDPayUser } from './useIDPayUser';

export const useInitiativeConfig = () => {
  const initiative = useCurrentInitiative();
  const user = useIDPayUser();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<boolean>(false);

  const mapNewStructureToLegacy = (cfg: any) => {
    const { roles, templates, ui } = cfg;

    return {
      role: roles?.name,
      logicalName: roles?.logicalName,
      subRoles: roles?.subRoles,
      errors: roles?.errors,
      templates,
      tables: ui?.tables,
    };
  };

  const normalizeConfig = (rawConfig: any) =>
    rawConfig?.roles ? mapNewStructureToLegacy(rawConfig) : rawConfig;

  useEffect(() => {
    if (!initiative || !user?.org_role) {
      return;
    }

    setLoading(true);

    const startDate = (initiative as any)?.startDate;

    void loadItInitiativeConfig(initiative?.initiativeName, user.org_role, true, startDate)
      .then((cfg) => {
        if ((cfg as any)?.roleConfigMissing) {
          setConfigError(true);
          setConfig(null);
        } else {
          setConfig(normalizeConfig(cfg));
          setConfigError(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initiative, user?.org_role]);

  return { config, loading, configError };
};
