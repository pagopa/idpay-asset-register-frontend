import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { PRODUCTS_CATEGORY, PRODUCTS_STATES } from '../../utils/constants';
import { BatchFilterItems } from './helpers';

interface FilterProps {
  categoryFilter: string;
  setCategoryFilter: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  setFiltering: Dispatch<SetStateAction<boolean>>;
  batchFilter: string;
  setBatchFilter: Dispatch<SetStateAction<string>>;
  batchFilterItems: Array<BatchFilterItems>;
  eprelCodeFilter: string;
  setEprelCodeFilter: Dispatch<SetStateAction<string>>;
  gtinCodeFilter: string;
  errorStatus: boolean;
  setGtinCodeFilter: Dispatch<SetStateAction<string>>;
  tableData: Array<ProductDTO>;
  handleDeleteFiltersButtonClick: () => void;
}

const FILTER_WIDTHS = {
  categoria: '15.08%',
  stato: '15.08%',
  lotto: '25.22%',
  eprel: '15.83%',
  gtin: '15.83%',
  rimuovi: '12.97%',
};

export default function FilterBar({
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  setFiltering,
  batchFilter,
  setBatchFilter,
  batchFilterItems,
  eprelCodeFilter,
  setEprelCodeFilter,
  gtinCodeFilter,
  setGtinCodeFilter,
  errorStatus,
  handleDeleteFiltersButtonClick,
}: FilterProps) {
  const { t } = useTranslation();

  const noFilterSetted = (): boolean =>
    !categoryFilter && !statusFilter && !batchFilter && !eprelCodeFilter && !gtinCodeFilter;

  const handleCategoryChange = (event: SelectChangeEvent) =>
    setCategoryFilter(event.target.value as string);
  const handleStatusChange = (event: SelectChangeEvent) =>
    setStatusFilter(event.target.value as string);
  const handleBatchChange = (event: SelectChangeEvent) =>
    setBatchFilter(event.target.value as string);
  const handleEprelCodeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEprelCodeFilter(event.target.value);
  const handleGtinCodeChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setGtinCodeFilter(event.target.value);

  const handleFilter = () => setFiltering(true);
  const handleDeleteFilters = () => handleDeleteFiltersButtonClick();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        mb: 5,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <FormControl size="small" sx={{ flexBasis: FILTER_WIDTHS.categoria }}>
        <InputLabel id="category-filter-select-label">
          {t('pages.products.filterLabels.category')}
        </InputLabel>
        <Select
          labelId="category-filter-select-label"
          id="category-filter-select"
          value={categoryFilter}
          label={t('pages.products.filterLabels.category')}
          MenuProps={{ PaperProps: { style: { maxHeight: 350 } } }}
          onChange={handleCategoryChange}
        >
          {Object.keys(PRODUCTS_CATEGORY).map((category) => (
            <MenuItem key={category} value={t(`pages.products.categories.${category}`)}>
              {t(`pages.products.categories.${category}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ flexBasis: FILTER_WIDTHS.stato }}>
        <InputLabel id="status-filter-select-label">
          {t('pages.products.filterLabels.status')}
        </InputLabel>
        <Select
          labelId="status-filter-select-label"
          id="status-filter-select"
          value={statusFilter}
          label={t('pages.products.filterLabels.status')}
          MenuProps={{ PaperProps: { style: { maxHeight: 350 } } }}
          onChange={handleStatusChange}
        >
          <MenuItem value="">{t(PRODUCTS_STATES.APPROVED)}</MenuItem>
          {Object.keys(PRODUCTS_STATES)
            .filter((statusKey) => statusKey !== 'APPROVED')
            .map((statusKey) => (
              <MenuItem key={statusKey} value={statusKey}>
                {t(PRODUCTS_STATES[statusKey as keyof typeof PRODUCTS_STATES])}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ flexBasis: FILTER_WIDTHS.lotto }}>
        <InputLabel id="batch-filter-select-label">
          {t('pages.products.filterLabels.batch')}
        </InputLabel>
        <Select
          labelId="batch-filter-select-label"
          id="batch-filter-select"
          value={batchFilter}
          label={t('pages.products.filterLabels.batch')}
          MenuProps={{ PaperProps: { style: { maxHeight: 350 } } }}
          onChange={handleBatchChange}
        >
          {batchFilterItems?.map((batch) => (
            <MenuItem key={batch?.productFileId} value={batch?.productFileId}>
              {batch?.batchName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        sx={{ flexBasis: FILTER_WIDTHS.eprel }}
        size="small"
        id="eprel-code-text"
        label={t('pages.products.filterLabels.eprelCode')}
        variant="outlined"
        value={eprelCodeFilter}
        onChange={handleEprelCodeChange}
      />

      <TextField
        sx={{ flexBasis: FILTER_WIDTHS.gtin }}
        size="small"
        id="gtin-code-text"
        label={t('pages.products.filterLabels.gtinCode')}
        variant="outlined"
        value={gtinCodeFilter}
        onChange={handleGtinCodeChange}
      />

      <Button
        disabled={noFilterSetted()}
        variant="outlined"
        sx={{ height: 44, minWidth: 100 }}
        onClick={handleFilter}
      >
        {t('pages.products.filterLabels.filter')}
      </Button>
      <Button
        disabled={noFilterSetted() && !errorStatus}
        variant="text"
        sx={{
          height: 44,
          flexBasis: FILTER_WIDTHS.rimuovi,
          minWidth: 100,
        }}
        onClick={handleDeleteFilters}
      >
        {t('pages.products.filterLabels.deleteFilters')}
      </Button>
    </Box>
  );
}
