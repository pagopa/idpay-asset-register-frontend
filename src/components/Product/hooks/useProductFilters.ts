import { useMemo } from 'react';

type UseProductFiltersParams = {
  filters: Record<string, { value: string; label?: string }>;
  enrichedFiltersConfig?: Array<{ id: string }>;
};

export const useProductFilters = ({ filters, enrichedFiltersConfig }: UseProductFiltersParams) => {
  const filtersLabel = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return undefined;
    }

    const normalize = (v?: string) => (v ? v.trim() : '');

    if (enrichedFiltersConfig && enrichedFiltersConfig.length > 0) {
      const values = enrichedFiltersConfig
        .map((filterDef) => {
          const filter = filters[filterDef.id];
          if (!filter) {
            return '';
          }
          return normalize(filter.label ?? filter.value);
        })
        .filter((v) => !!v);

      return values.length > 0 ? values.join(', ') : undefined;
    }

    return undefined;
  }, [filters, enrichedFiltersConfig]);

  return { filtersLabel };
};
