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
import { InitiativeNotFoundError } from './config/errors';
import { mergeConfigs } from './config/mergeConfigs';
import { applySubRolePermissions } from './config/permissionFilter';
import { getInitiativeBasePath } from './multiInitiativeBasePath';

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

const loadGlobalDefaultConfig = async (role?: string): Promise<InitiativeTablesConfig> => {
  const mod = await import(`./it/${DEFAULT_INITIATIVE_NAMESPACE}/config.json`);
  const config = (mod as { default?: InitiativeTablesConfig }).default ?? {};
  return applySubRolePermissions(config, resolveSubRole(role));
};

const loadInitiativeDefaultConfig = async (
  basePath: string,
  role?: string
): Promise<InitiativeTablesConfig> => {
  try {
    const mod = await import(`${basePath}default/config.json`);
    const config = (mod as { default?: InitiativeTablesConfig }).default ?? {};
    return applySubRolePermissions(config, resolveSubRole(role));
  } catch (error: any) {
    const isModuleNotFound =
      error?.code === 'MODULE_NOT_FOUND' || error?.message?.includes('Cannot find module');

    if (isModuleNotFound) {
      throw new InitiativeNotFoundError(basePath);
    }

    throw error;
  }
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

const resolveBasePathSafe = (initiativeName: string, startDate?: string): string => {
  const official = getInitiativeBasePath(initiativeName, startDate);
  return official && official !== './it//' ? official : `./it/${initiativeName}/`;
};

const executeInitiativeLoad = async (
  basePath: string,
  safeInitiativeName: string,
  role?: string
): Promise<InitiativeTablesConfig> => {
  const loadWithoutRole = async (): Promise<InitiativeTablesConfig> =>
    safeInitiativeName === DEFAULT_INITIATIVE_NAMESPACE
      ? loadGlobalDefaultConfig(role)
      : loadInitiativeDefaultConfig(basePath, role);

  if (typeof role !== 'string') {
    return resolveAndValidate(() => loadInitiativeDefaultConfig(basePath));
  }

  const normalizedRole = normalizeRole(role);

  if (DEBUG_CONSOLE) {
    console.log('role normalized:', normalizedRole);
  }

  const loader = normalizedRole
    ? async () => {
        try {
          return await loadRoleSpecificConfig(basePath, normalizedRole, role);
        } catch {
          return loadWithoutRole();
        }
      }
    : loadWithoutRole;

  return resolveAndValidate(loader);
};

export const loadItInitiativeConfig = async (
  initiativeName?: string,
  role?: string,
  allowFallback: boolean = true,
  startDate?: string
): Promise<InitiativeTablesConfig> => {
  if (!initiativeName) {
    return {};
  }

  const basePath = resolveBasePathSafe(initiativeName, startDate);
  const safeInitiativeName = basePath.replace('./it/', '').replace('/', '');

  if (DEBUG_CONSOLE) {
    console.log('initiativeName raw:', initiativeName);
    console.log('initiativeFolder used:', safeInitiativeName);
    console.log('role raw:', role);
  }

  try {
    return await executeInitiativeLoad(basePath, safeInitiativeName, role);
  } catch (error) {
    if (error instanceof InitiativeNotFoundError) {
      if (DEBUG_CONSOLE) {
        console.log(error.message);
      }
      return handleFallback(initiativeName, role, allowFallback);
    }
    throw error;
  }
};
