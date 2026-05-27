import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { InitiativeConfig, LegacyInitiativeConfig } from '../model/config/ConfigSchema';
import {
  loadInitiativeConfigThunk,
  selectActiveInitiativeConfig,
} from '../redux/slices/initiativeConfigSlice';
import type { AppDispatch, RootState } from '../redux/store';
import { useCurrentInitiative } from './useCurrentInitiative';
import { useIDPayUser } from './useIDPayUser';

export const useInitiativeConfig = (): {
  config: LegacyInitiativeConfig | undefined;
  loading: boolean;
  configError: unknown;
} => {
  const initiative = useCurrentInitiative();
  const user = useIDPayUser();
  const dispatch = useDispatch<AppDispatch>();
  const config = useSelector(selectActiveInitiativeConfig) as InitiativeConfig | undefined;
  const loading = useSelector((state: RootState) => state.initiativeConfig.loading);
  const configError = useSelector((state: RootState) => state.initiativeConfig.error);

  useEffect(() => {
    if (!initiative || !user?.org_role) {
      return;
    }

    const startDate = (initiative as any)?.startDate;

    void dispatch(
      loadInitiativeConfigThunk({
        initiativeName: initiative?.initiativeName,
        role: user.org_role,
        startDate,
      })
    );
  }, [initiative, user?.org_role, dispatch]);

  const mapNewStructureToLegacy = (cfg: InitiativeConfig): LegacyInitiativeConfig => {
    const { roles, templates, ui } = cfg ?? {};
    return {
      role: roles?.name,
      logicalName: roles?.logicalName,
      subRoles: roles?.subRoles,
      errors: roles?.errors,
      templates,
      tables: ui?.tables,
    };
  };

  const normalized: LegacyInitiativeConfig | undefined = config?.roles
    ? mapNewStructureToLegacy(config)
    : undefined;

  return {
    config: normalized,
    loading,
    configError,
  };
};
