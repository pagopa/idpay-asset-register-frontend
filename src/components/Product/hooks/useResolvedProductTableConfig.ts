import {
  InitiativeConfig,
  LegacyInitiativeConfig,
  ProductTableConfig,
} from '../../../model/config/ConfigSchema';

type FullConfig = InitiativeConfig | LegacyInitiativeConfig;

function resolveTableConfig(config?: FullConfig): ProductTableConfig | undefined {
  if (!config) {
    return undefined;
  }

  if ('ui' in config && config.ui) {
    return config.ui.tables.products;
  }

  if ('tables' in config && config.tables) {
    return config.tables.products;
  }

  return undefined;
}

export function useResolvedProductTableConfig(config?: FullConfig) {
  const tableConfig = resolveTableConfig(config);

  const paginationConfig = tableConfig?.pagination;
  const filtersConfig = tableConfig?.filters;

  const templateConfig = config && 'templates' in config ? config.templates : undefined;

  return {
    tableConfig,
    paginationConfig,
    filtersConfig,
    templateConfig,
  };
}
