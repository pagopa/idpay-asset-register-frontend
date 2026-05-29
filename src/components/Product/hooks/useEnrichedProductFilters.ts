import { useMemo } from 'react';
import { TFunction } from 'i18next';
import { SelectProps } from '../../FiltersDrawer/filtersRender';
import { InitiativeConfig } from '../../../model/config/ConfigSchema';

type Params = {
  typedConfig: InitiativeConfig;
  filtersConfig: any;
  batchFilter: Record<string, SelectProps>;
  t: TFunction;
};

export function useEnrichedProductFilters({ typedConfig, filtersConfig, batchFilter, t }: Params) {
  const buildCategoryOptions = () => {
    const configCategories = typedConfig.categories;
    const templateCategories = typedConfig.templates?.categories ?? {};

    if (!configCategories || Object.keys(configCategories).length === 0) {
      return Object.fromEntries(
        Object.keys(templateCategories).map((key: string) => {
          const upperKey = key.toUpperCase();
          return [
            upperKey,
            {
              label: t(`categories.${key}.label`),
            },
          ];
        })
      );
    }

    return Object.fromEntries(
      Object.entries(configCategories).map(([key, value]) => [
        key,
        {
          label: value.labelKey ? t(value.labelKey, { returnObjects: false }) : key,
        },
      ])
    );
  };

  const enrichedFiltersConfig = useMemo(() => {
    if (!filtersConfig) {
      return filtersConfig;
    }

    return filtersConfig.map((filter: any) => {
      if (
        ('useInitiativeCategories' in filter && filter.useInitiativeCategories) ||
        filter.id === 'category'
      ) {
        return { ...filter, options: buildCategoryOptions() };
      }

      if (filter.id === 'status') {
        return {
          ...filter,
          options: {
            UPLOADED: {
              labelKey: 'chip.productStatusLabel.uploaded',
              color: 'default',
            },
            WAIT_APPROVED: {
              labelKey: 'chip.productStatusLabel.waitApproved',
              color: 'warning',
            },
            APPROVED: {
              labelKey: 'chip.productStatusLabel.approved',
              color: 'success',
            },
            SUPERVISED: {
              labelKey: 'chip.productStatusLabel.supervised',
              color: 'info',
            },
            REJECTED: {
              labelKey: 'chip.productStatusLabel.rejected',
              color: 'error',
            },
          },
        };
      }

      if (filter.id === 'productFileId') {
        return { ...filter, options: batchFilter };
      }

      return filter;
    });
  }, [filtersConfig, batchFilter]);

  return { enrichedFiltersConfig };
}
