import { useMemo, useState } from 'react';
import { BatchFilterItems } from '../helpers';

type UseProductFiltersParams = {
  institutions: Array<any>;
  batchFilterItems: Array<BatchFilterItems>;
};

export const useProductFilters = ({ institutions, batchFilterItems }: UseProductFiltersParams) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [producerFilter, setProducerFilter] = useState<string>('');
  const [batchFilter, setBatchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [eprelCodeFilter, setEprelCodeFilter] = useState<string>('');
  const [gtinCodeFilter, setGtinCodeFilter] = useState<string>('');

  const resetFilters = () => {
    setCategoryFilter('');
    setStatusFilter('');
    setProducerFilter('');
    setBatchFilter('');
    setEprelCodeFilter('');
    setGtinCodeFilter('');
  };

  const filtersLabel = useMemo(() => {
    const norm = (s?: string) => (s ? s.trim() : '');

    const producer = producerFilter?.trim()
      ? institutions?.find((p: any) => p.institutionId === producerFilter)?.description ||
        producerFilter.trim()
      : '';

    const batch = batchFilter?.trim()
      ? batchFilterItems?.find((b) => b?.productFileId === batchFilter)?.batchName ||
        batchFilter.trim()
      : '';

    return [
      norm(categoryFilter),
      norm(statusFilter),
      norm(producer),
      norm(batch),
      norm(eprelCodeFilter),
      norm(gtinCodeFilter),
    ]
      .filter((s): s is string => !!s)
      .join(', ');
  }, [
    categoryFilter,
    statusFilter,
    producerFilter,
    institutions,
    batchFilter,
    batchFilterItems,
    eprelCodeFilter,
    gtinCodeFilter,
  ]);

  return {
    categoryFilter,
    setCategoryFilter,
    producerFilter,
    setProducerFilter,
    batchFilter,
    setBatchFilter,
    statusFilter,
    setStatusFilter,
    eprelCodeFilter,
    setEprelCodeFilter,
    gtinCodeFilter,
    setGtinCodeFilter,
    filtersLabel,
    resetFilters,
  };
};
