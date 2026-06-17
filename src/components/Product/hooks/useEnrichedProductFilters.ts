import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TFunction } from 'i18next';
import { SelectProps } from '../../FiltersDrawer/filtersRender';
import { InitiativeConfig } from '../../../model/config/ConfigSchema';
import { USERS_TYPES } from '../../../utils/constants';

type Params = {
  typedConfig: InitiativeConfig;
  filtersConfig: any;
  batchFilter: Record<string, SelectProps>;
  t: TFunction;
  isInvitalia: boolean;
  currentRoleKey?: string;
};

export function useEnrichedProductFilters({ isInvitalia, typedConfig, filtersConfig, batchFilter, t, currentRoleKey }: Params) {
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

  const buildStatusOptions = (filter: any) => {
    const baseOptions = {
      ...(isInvitalia || currentRoleKey === USERS_TYPES.SUPPORT
        ? {
            SUPERVISED: {
              labelKey: 'chip.productStatusLabel.supervised',
              color: 'primary',
            },
            WAIT_APPROVED: {
              labelKey: 'chip.productStatusLabel.waitApproved',
              color: 'info',
            },
          }
        : {}),
      ...(currentRoleKey === USERS_TYPES.SUPPORT
        ? {
            WAIT_APPROVED: {
              labelKey: 'chip.productStatusLabel.waitApproved',
              color: 'info',
            },
          }
        : {}),
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
    };

    const roleStatusConfig =
      filter.filtersBehavior?.statusOptionsByRole?.[
        currentRoleKey as string
      ] as Array<string> | undefined;

    if (roleStatusConfig) {
      return roleStatusConfig.reduce<Record<string, any>>((acc, key) => {
        const option = (baseOptions as Record<string, any>)[key];
        return option ? { ...acc, [key]: option } : acc;
      }, {});
    }

    return baseOptions;
  };

  const buildProducerOptions = () =>
    institutionList
      ? Object.fromEntries(
          institutionList.map((item: any) => [
            item.institutionId,
            { label: item.description },
          ])
        )
      : {};

  const mapFilter = (filter: any) => {
    if (
      ('useInitiativeCategories' in filter && filter.useInitiativeCategories) ||
      filter.id === 'category'
    ) {
      return { ...filter, options: buildCategoryOptions() };
    }

    if (filter.id === 'status') {
      return { ...filter, options: buildStatusOptions(filter) };
    }

    if (filter.id === 'productFileId') {
      return { ...filter, options: batchFilter };
    }

    if (filter.id === 'producer') {
      return { ...filter, options: buildProducerOptions() };
    }

    return filter;
  };

  const enrichedFiltersConfig = useMemo(() => {
    if (!filtersConfig) {
      return filtersConfig;
    }
    return filtersConfig.map(mapFilter);
  }, [
    filtersConfig,
    batchFilter,
    institutionList,
    currentRoleKey,
    isInvitalia,
    typedConfig
  ]);

  return { enrichedFiltersConfig };
}
