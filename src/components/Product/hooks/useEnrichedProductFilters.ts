import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TFunction } from 'i18next';
import { SelectProps } from '../../FiltersDrawer/filtersRender';
import { InitiativeConfig } from '../../../model/config/ConfigSchema';

type Params = {
  typedConfig: InitiativeConfig;
  filtersConfig: any;
  batchFilter: Record<string, SelectProps>;
  t: TFunction;
  isInvitalia: boolean;
};

export function useEnrichedProductFilters({ isInvitalia, typedConfig, filtersConfig, batchFilter, t }: Params) {
  const institutionList = useSelector((state: any) => state.invitalia?.institutionList);
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

  // eslint-disable-next-line sonarjs/cognitive-complexity
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
            ...(isInvitalia ? {
              SUPERVISED: {
                labelKey: 'chip.productStatusLabel.supervised',
                color: 'primary',
              },
              WAIT_APPROVED: {
                labelKey: 'chip.productStatusLabel.waitApproved',
                color: 'info',
              }
            } : {}),
            UPLOADED: {
              labelKey: 'chip.productStatusLabel.uploaded',
              color: 'default',
            },
            APPROVED: {
              labelKey: 'chip.productStatusLabel.approved',
              color: 'success',
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

      if (filter.id === 'producer') {
        const producerOptions = institutionList
          ? Object.fromEntries(
            institutionList.map((item: any) => [item.institutionId, { label: item.description }])
          )
          : {};

        return { ...filter, options: producerOptions };
      }

      return filter;
    });
  }, [filtersConfig, batchFilter, institutionList]);

  return { enrichedFiltersConfig };
}
