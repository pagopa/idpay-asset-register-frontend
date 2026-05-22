import { useMemo } from "react";

type UseProductFiltersParams = {
  setFilters: (filter: Record<string, {value: string; label: string}>) => void;
  filters: Record<string, {value: string; label: string}>;
};

export const useProductFilters = ({ setFilters, filters }: UseProductFiltersParams) => {
  const filtersLabel = useMemo(() => Object.values(filters).reduce((acc, value) => `${acc ? ',' : ''} ${value?.label}`, ''), [filters]);

  const resetFilters = () => setFilters({});

  return { filtersLabel, resetFilters };
};
