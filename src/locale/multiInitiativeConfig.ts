/**
 * Initiative configuration loading schema
 *
 * Folder structure:
 *
 * src/locale/it/
 * ├── default/                         → global emergency fallback
 * │
 * └── <initiativeName>/
 *     ├── default/config.json          → base configuration for the initiative
 *     ├── operatore/config.json        → role override (merged over default)
 *     └── invitalia/config.json        → role override (merged over default)
 *
 * Loading logic:
 * 1. Load initiative default config
 * 2. If role exists → load role config and merge over initiative default
 * 3. Apply sub-role permissions filtering (tables visibility)
 * 4. If initiative fails → fallback to global default
 *
 * This file must preserve loading order to avoid regressions.
 */
import { DEBUG_CONSOLE, DEFAULT_INITIATIVE_NAMESPACE } from '../utils/constants';

export type InitiativeTablesConfig = {
  roles?: {
    name?: string;
    logicalName?: string;
    subRoles?: Record<string, unknown>;
    errors?: Record<string, unknown>;
  };
  templates?: Record<string, unknown>;
  ui?: {
    tables?: Record<string, unknown>;
  };
};

const validateInitiativeConfig = (config: unknown): config is InitiativeTablesConfig =>
  Boolean(config && typeof config === 'object');

const normalizeRole = (role?: string): string | undefined => {
  const r = role?.trim().toLowerCase();
  return r ? r.split('_')[0] : undefined;
};

const resolveSubRole = (role?: string): string | undefined =>
  role?.includes('_') ? role : undefined;

const applySubRolePermissions = (
  config: InitiativeTablesConfig,
  subRole?: string
): InitiativeTablesConfig => {
  if (!config || !subRole) {
    return config ?? {};
  }

  const permissions = (config.roles?.subRoles as Record<string, any> | undefined)?.[subRole]
    ?.permissions?.tables;

  const tables = config.ui?.tables as Record<string, unknown> | undefined;

  if (!Array.isArray(permissions) || !tables) {
    return { ...config, ui: { ...config.ui, tables: {} } };
  }

  const filteredTables = Object.fromEntries(
    Object.entries(tables).filter(([key]) => permissions.includes(key))
  );

  return { ...config, ui: { ...config.ui, tables: filteredTables } };
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

  return (
    (config.roles?.subRoles as Record<string, any> | undefined)?.[role]?.logicalName ??
    config.roles?.logicalName
  );
};

const mergeConfigs = <T extends Record<string, any>>(base: T, override: Partial<T>): T => {
  if (!base) {
    return override as T;
  }
  if (!override) {
    return base;
  }

  if (Array.isArray(base) || Array.isArray(override)) {
    return (override ?? base) as T;
  }

  return Object.keys(override).reduce(
    (acc, key) => {
      const baseValue = base[key];
      const overrideValue = override[key];

      const mergedValue =
        baseValue &&
        overrideValue &&
        typeof baseValue === 'object' &&
        typeof overrideValue === 'object' &&
        !Array.isArray(baseValue) &&
        !Array.isArray(overrideValue)
          ? mergeConfigs(baseValue as any, overrideValue as any)
          : overrideValue;

      return {
        ...acc,
        [key]: mergedValue,
      };
    },
    { ...base }
  );
};

const loadGlobalDefaultConfig = async (role?: string): Promise<InitiativeTablesConfig> => {
  const mod = await import(`./it/${DEFAULT_INITIATIVE_NAMESPACE}/config.json`);
  const config = (mod as { default?: InitiativeTablesConfig }).default ?? {};
  return applySubRolePermissions(config, resolveSubRole(role));
};

const loadInitiativeDefaultConfig = async (
  basePath: string,
  role?: string
): Promise<InitiativeTablesConfig> => {
  const mod = await import(`${basePath}default/config.json`);
  const config = (mod as { default?: InitiativeTablesConfig }).default ?? {};
  return applySubRolePermissions(config, resolveSubRole(role));
};

const loadRoleSpecificConfig = async (
  basePath: string,
  normalizedRole: string,
  role?: string
): Promise<InitiativeTablesConfig> => {
  const roleMod = await import(`${basePath}${normalizedRole}/config.json`);
  const roleConfig = (roleMod as { default?: InitiativeTablesConfig }).default ?? {};

  const defaultMod = await import(`${basePath}default/config.json`);
  const initiativeDefault = (defaultMod as { default?: InitiativeTablesConfig }).default ?? {};

  const merged = mergeConfigs(initiativeDefault, roleConfig);

  return applySubRolePermissions(merged, resolveSubRole(role));
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
  initiativeName?: string,
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
      return await loadRoleSpecificConfig(basePath, normalizedRole as string, role);
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
