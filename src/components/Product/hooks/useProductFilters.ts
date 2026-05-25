import { useMemo } from "react";

type UseProductFiltersParams = {
  filters: Record<string, {value: string; label?: string}>;
};

export const useProductFilters = ({ filters }: UseProductFiltersParams) => {
  const filtersLabel = useMemo(() => Object.values(filters).reduce((acc, value) => acc + `${acc ? ', ' : ''}` + (value?.label ?? value?.value), ''), [filters]);

  return { filtersLabel};
};
