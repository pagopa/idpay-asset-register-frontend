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

import { DEBUG_CONSOLE } from '../../../utils/constants';

export function useResolvedProductTableConfig(
  config?: FullConfig,
  initiativeName?: string
) {
  const tableConfig = resolveTableConfig(config);

  if (DEBUG_CONSOLE) {
    const columns = tableConfig?.columns;
    const filters = tableConfig?.filters;
    const detailFields = tableConfig?.detail?.fields;

    const errors: Array<string> = [
      !Array.isArray(columns) || columns.length === 0
        ? 'columns (must be non-empty array)'
        : null,
      !Array.isArray(filters)
        ? 'filters (must be array)'
        : null,
      !Array.isArray(detailFields) || detailFields.length === 0
        ? 'detail.fields (must be non-empty array)'
        : null,
    ].filter((e): e is string => Boolean(e));

    if (errors.length > 0) {
      console.warn(
        `[CONFIG WARNING] Products table misconfigured for initiative "${initiativeName}". Missing: ${errors.join(
          ', '
        )}`
      );
    }
  }

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
