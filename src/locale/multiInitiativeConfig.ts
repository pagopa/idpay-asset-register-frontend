/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEBUG_CONSOLE } from '../utils/constants';
export type InitiativeTablesConfig = {
  role?: string;
  logicalName?: string;
  subRoles?: Record<string, any>;
  tables?: Record<string, any>;
};

const applySubRolePermissions = (config: any, subRole?: string): InitiativeTablesConfig => {
  if (!config || !subRole) {
    return config ?? {};
  }

  const permissions = config?.subRoles?.[subRole]?.permissions?.tables;

  if (!Array.isArray(permissions) || !config?.tables) {
    return {
      ...config,
      tables: {},
    };
  }

  const filteredTables = Object.fromEntries(
    Object.entries(config.tables).filter(([tableKey]) => permissions.includes(tableKey))
  );

  return {
    ...config,
    tables: filteredTables,
  };
};

export const getLogicalRoleName = (
  config: InitiativeTablesConfig,
  role?: string
): string | undefined => {
  if (!config) {
    return undefined;
  }

  if (!role) {
    return config.logicalName;
  }

  return config.subRoles?.[role]?.logicalName ?? config.logicalName;
};

const normalizeRole = (role?: string): string | undefined => {
  const r = role?.trim().toLowerCase();
  if (!r) {
    return undefined;
  }

  // Base role is always the first segment before "_"
  return r.split('_')[0];
};

const resolveSubRole = (role?: string): string | undefined => {
  if (!role) {
    return undefined;
  }

  // If role contains "_", it is considered a subRole
  return role.includes('_') ? role : undefined;
};

/* eslint-disable sonarjs/cognitive-complexity */
export const loadItInitiativeConfig = async (
  initiativeName: string | undefined,
  role?: string
): Promise<InitiativeTablesConfig> => {
  if (!initiativeName) {
    return {};
  }

  const safeInitiativeName = initiativeName.trim();

  if (DEBUG_CONSOLE) {
    console.log('initiativeName raw:', initiativeName);
    console.log('initiativeFolder used:', safeInitiativeName);
    console.log('role raw:', role);
  }

  // Runtime validation: role must be a string (compile-time is enforced by OpenAPI generated types)
  if (typeof role !== 'string') {
    try {
      const mod = await import(`./it/${safeInitiativeName}/default/config.json`);
      return (mod as any).default ?? {};
    } catch {
      return {};
    }
  }

  const normalizedRole = normalizeRole(role);

  if (DEBUG_CONSOLE) {
    console.log('role normalized:', normalizedRole);
  }

  try {
    const basePath = `./it/${safeInitiativeName}/`;

    // Try loading role-specific folder (based on baseRole)
    if (normalizedRole) {
      try {
        const roleMod = await import(`${basePath}${normalizedRole}/config.json`);
        const roleConfig = (roleMod as any).default ?? {};
        const subRole = resolveSubRole(role);

        // ✅ Load default config to inherit common settings (like errors)
        try {
          const defaultMod = await import(`${basePath}default/config.json`);
          const defaultConfig = (defaultMod as any).default ?? {};

          return applySubRolePermissions(
            {
              ...defaultConfig,
              ...roleConfig,
              errors: {
                ...defaultConfig?.errors,
                ...roleConfig?.errors,
              },
            },
            subRole
          );
        } catch {
          return applySubRolePermissions(roleConfig, subRole);
        }
      } catch {
        // ✅ Fallback semplice: carica default
        const defaultMod = await import(`${basePath}default/config.json`);
        const defaultConfig = (defaultMod as any).default ?? {};
        return applySubRolePermissions(defaultConfig, resolveSubRole(role));
      }
    }

    // If no role provided, fallback to default folder
    const mod = await import(`${basePath}default/config.json`);
    const subRole = resolveSubRole(role);
    return applySubRolePermissions((mod as any).default ?? {}, subRole);
  } catch {
    return {};
  }
};
