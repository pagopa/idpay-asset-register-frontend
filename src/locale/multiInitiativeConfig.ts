/**
 * Multi-initiative configuration loader.
 *
 * Merge order (deterministic):
 *   1. Global default
 *   2. Initiative default
 *   3. Role override
 *   4. Sub-role permissions filter
 *
 * Folder structure:
 *
 * src/locale/it/
 * ├── default/                  → global base configuration
 * └── <initiativeName>/
 *     ├── default/config.json   → initiative overrides
 *     └── <role>/config.json    → role overrides
 *
 * If initiative is missing, fallback to global default.
 *
 * IMPORTANT: The merge order must not change.
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
const isModuleNotFoundError = (error: any): boolean =>
  error?.code === 'MODULE_NOT_FOUND' || error?.message?.includes('Cannot find module');

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
    const globalMod = await import(`./it/${DEFAULT_INITIATIVE_NAMESPACE}/config.json`);
    const globalConfig = (globalMod as { default?: InitiativeTablesConfig }).default ?? {};

    const mod = await import(`${basePath}default/config.json`);
    const initiativeConfig = (mod as { default?: InitiativeTablesConfig }).default ?? {};

    const merged = mergeConfigs(globalConfig, initiativeConfig);

    return applySubRolePermissions(merged, resolveSubRole(role));
  } catch (error: any) {
    if (isModuleNotFoundError(error)) {
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
  try {
    const globalMod = await import(`./it/${DEFAULT_INITIATIVE_NAMESPACE}/config.json`);
    const globalConfig = (globalMod as { default?: InitiativeTablesConfig }).default ?? {};

    const defaultMod = await import(`${basePath}default/config.json`);
    const initiativeDefault = (defaultMod as { default?: InitiativeTablesConfig }).default ?? {};

    const roleMod = await import(`${basePath}${normalizedRole}/config.json`);
    const roleConfig = (roleMod as { default?: InitiativeTablesConfig }).default ?? {};

    const mergedInitiative = mergeConfigs(globalConfig, initiativeDefault);
    const merged = mergeConfigs(mergedInitiative, roleConfig);

    return applySubRolePermissions(merged, resolveSubRole(role));
  } catch (error: any) {
    if (isModuleNotFoundError(error)) {
      throw new InitiativeNotFoundError(basePath);
    }

    throw error;
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
    return resolveAndValidate(loadWithoutRole);
  }

  const normalizedRole = normalizeRole(role);

  if (DEBUG_CONSOLE) {
    console.log('role normalized:', normalizedRole);
  }

  if (!normalizedRole) {
    return resolveAndValidate(loadWithoutRole);
  }

  try {
    return await resolveAndValidate(() => loadRoleSpecificConfig(basePath, normalizedRole, role));
  } catch (error) {
    if (error instanceof InitiativeNotFoundError || isModuleNotFoundError(error)) {
      return resolveAndValidate(loadWithoutRole);
    }

    throw error;
  }
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

  try {
    return await executeInitiativeLoad(basePath, safeInitiativeName, role);
  } catch (error) {
    if (error instanceof InitiativeNotFoundError) {
      return handleFallback(initiativeName, role, allowFallback);
    }
    throw error;
  }
};
