/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEBUG_CONSOLE } from '../utils/constants';

export type InitiativeTablesConfig = {
  roles?: {
    name?: string;
    logicalName?: string;
    subRoles?: Record<string, any>;
    errors?: Record<string, any>;
  };
  templates?: Record<string, any>;
  ui?: {
    tables?: Record<string, any>;
  };
};

export const DEFAULT_INITIATIVE_NAMESPACE = 'default';

const validateInitiativeConfig = (config: any): boolean =>
  Boolean(config && typeof config === 'object');

const applySubRolePermissions = (config: any, subRole?: string): InitiativeTablesConfig => {
  if (!config || !subRole) {
    return config ?? {};
  }

  const permissions = config?.roles?.subRoles?.[subRole]?.permissions?.tables;

  const tables = config?.ui?.tables;

  if (!Array.isArray(permissions) || !tables) {
    return { ...config, ui: { ...config?.ui, tables: {} } };
  }

  const filteredTables = Object.fromEntries(
    Object.entries(tables).filter(([tableKey]) => permissions.includes(tableKey))
  );

  return { ...config, ui: { ...config?.ui, tables: filteredTables } };
};

export const getLogicalRoleName = (
  config: InitiativeTablesConfig,
  role?: string
): string | undefined => {
  if (!config) {
    return undefined;
  }
  if (!role) {
    return config.roles?.logicalName;
  }
  return config.roles?.subRoles?.[role]?.logicalName ?? config.roles?.logicalName;
};

const normalizeRole = (role?: string): string | undefined => {
  const r = role?.trim().toLowerCase();
  if (!r) {
    return undefined;
  }
  return r.split('_')[0];
};

const resolveSubRole = (role?: string): string | undefined => {
  if (!role) {
    return undefined;
  }
  return role.includes('_') ? role : undefined;
};

const loadGlobalDefaultConfig = async (role?: string) => {
  const mod = await import(`./it/${DEFAULT_INITIATIVE_NAMESPACE}/config.json`);
  return applySubRolePermissions((mod as any).default ?? {}, resolveSubRole(role));
};

const loadInitiativeDefaultConfig = async (basePath: string, role?: string) => {
  const mod = await import(`${basePath}default/config.json`);
  return applySubRolePermissions((mod as any).default ?? {}, resolveSubRole(role));
};

const loadRoleSpecificConfig = async (basePath: string, normalizedRole: string, role?: string) => {
  const roleMod = await import(`${basePath}${normalizedRole}/config.json`);
  const roleConfig = (roleMod as any).default ?? {};
  const subRole = resolveSubRole(role);

  try {
    const defaultMod = await import(`${basePath}default/config.json`);
    const defaultConfig = (defaultMod as any).default ?? {};

    return applySubRolePermissions(
      {
        roles: {
          ...defaultConfig?.roles,
          ...roleConfig?.roles,
          errors: {
            ...defaultConfig?.roles?.errors,
            ...roleConfig?.roles?.errors,
          },
        },
        templates: {
          ...defaultConfig?.templates,
          ...roleConfig?.templates,
        },
        ui: {
          ...defaultConfig?.ui,
          ...roleConfig?.ui,
        },
      },
      subRole
    );
  } catch {
    return applySubRolePermissions(roleConfig, subRole);
  }
};

const resolveAndValidate = async (
  loader: () => Promise<InitiativeTablesConfig>
): Promise<InitiativeTablesConfig> => {
  const config = await loader();
  return validateInitiativeConfig(config) ? config : {};
};

const handleFallback = async (
  initiativeName: string,
  role?: string,
  allowFallback?: boolean
): Promise<InitiativeTablesConfig> => {
  if (allowFallback && initiativeName !== DEFAULT_INITIATIVE_NAMESPACE) {
    return loadGlobalDefaultConfig(role);
  }
  return {};
};

export const loadItInitiativeConfig = async (
  initiativeName: string | undefined,
  role?: string,
  allowFallback: boolean = true
): Promise<InitiativeTablesConfig> => {
  if (!initiativeName) {
    return {};
  }

  const safeInitiativeName = initiativeName.trim();
  const basePath = `./it/${safeInitiativeName}/`;

  if (DEBUG_CONSOLE) {
    console.log('initiativeName raw:', initiativeName);
    console.log('initiativeFolder used:', safeInitiativeName);
    console.log('role raw:', role);
  }

  const loadWithoutRole = async () => {
    if (safeInitiativeName === DEFAULT_INITIATIVE_NAMESPACE) {
      return loadGlobalDefaultConfig(role);
    }
    return loadInitiativeDefaultConfig(basePath, role);
  };

  if (typeof role !== 'string') {
    try {
      return resolveAndValidate(() => loadInitiativeDefaultConfig(basePath));
    } catch {
      return {};
    }
  }

  const normalizedRole = normalizeRole(role);

  if (DEBUG_CONSOLE) {
    console.log('role normalized:', normalizedRole);
  }

  const loadWithRole = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return await loadRoleSpecificConfig(basePath, normalizedRole!, role);
    } catch {
      return loadWithoutRole();
    }
  };

  try {
    const loader = normalizedRole ? loadWithRole : loadWithoutRole;
    return await resolveAndValidate(loader);
  } catch {
    return handleFallback(initiativeName, role, allowFallback);
  }
};
