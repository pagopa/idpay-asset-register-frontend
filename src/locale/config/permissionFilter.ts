import { InitiativeTablesConfig } from '../multiInitiativeConfig';

export const applySubRolePermissions = (
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
