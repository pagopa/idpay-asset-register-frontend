import React, { useState } from 'react';
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
import { PRODUCTS_CATEGORY } from '../../utils/constants';
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

export default function FilterBar(props: FilterProps) {
  const [filtered, setFiltered] = useState<boolean>(false);

  const {
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
  } = props;

  const { t } = useTranslation();

  const handleFilterButtonClick = () => {
    setFiltered(true);
    setFiltering(true);
  };

  const handleDeleteFiltersClick = () => {
    setFiltered(false);
    handleDeleteFiltersButtonClick();
  };

  const selectMenuProps = {
    PaperProps: {
      style: {
        maxHeight: 250,
      },
    },
  };

  // AGGIORNATO: aggiungi statusFilter
  const noFilterSetted = (): boolean =>
    categoryFilter === '' &&
    statusFilter === '' &&
    batchFilter === '' &&
    eprelCodeFilter === '' &&
    gtinCodeFilter === '';

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value as string);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as string);
  };

  const handleCategoryBatchChange = (event: SelectChangeEvent) => {
    setBatchFilter(event.target.value as string);
  };

  const handleEprelCodeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEprelCodeFilter(event.target.value);
  };

  const handleGtinCodeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGtinCodeFilter(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        mb: 5,
      }}
    >
      <FormControl fullWidth size="small">
        <InputLabel id="category-filter-select-label">
          {t('pages.products.filterLabels.category')}
        </InputLabel>
        <Select
          labelId="category-filter-select-label"
          id="category-filter-select"
          value={categoryFilter}
          label={t('pages.products.filterLabels.category')}
          MenuProps={selectMenuProps}
          onChange={handleCategoryFilterChange}
        >
          {Object.keys(PRODUCTS_CATEGORY).map((category) => (
            <MenuItem key={category} value={t(`pages.products.categories.${category}`)}>
              {t(`pages.products.categories.${category}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* AGGIUNTO: filtro per stato */}
      <FormControl fullWidth size="small">
        <InputLabel id="status-filter-select-label">
          {t('pages.products.filterLabels.status')}
        </InputLabel>
        <Select
          labelId="status-filter-select-label"
          id="status-filter-select"
          value={statusFilter}
          label={t('pages.products.filterLabels.status')}
          MenuProps={selectMenuProps}
          onChange={handleStatusFilterChange}
        >
          <MenuItem value="">{t('pages.products.filterLabels.all')}</MenuItem>
          <MenuItem value="APPROVED">{t('pages.products.status.approved')}</MenuItem>
          <MenuItem value="REJECTED">{t('pages.products.status.rejected')}</MenuItem>
          <MenuItem value="PENDING">{t('pages.products.status.pending')}</MenuItem>
          {/* Aggiungi altri status se necessario */}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="batch-filter-select-label">
          {t('pages.products.filterLabels.batch')}
        </InputLabel>
        <Select
          labelId="batch-filter-select-label"
          id="batch-filter-select"
          value={batchFilter}
          label={t('pages.products.filterLabels.batch')}
          MenuProps={selectMenuProps}
          onChange={handleCategoryBatchChange}
        >
          {batchFilterItems?.map((batch) => (
            <MenuItem key={batch?.productFileId} value={batch?.productFileId}>
              {batch?.batchName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        sx={{ minWidth: 175 }}
        size="small"
        id="eprel-code-text"
        label={t('pages.products.filterLabels.eprelCode')}
        variant="outlined"
        value={eprelCodeFilter}
        onChange={handleEprelCodeFilterChange}
      />

      <TextField
        sx={{ minWidth: 175 }}
        size="small"
        id="gtin-code-text"
        label={t('pages.products.filterLabels.gtinCode')}
        variant="outlined"
        value={gtinCodeFilter}
        onChange={handleGtinCodeFilterChange}
      />
      <Button
        disabled={noFilterSetted()}
        variant="outlined"
        sx={{ height: 44, minWidth: 100 }}
        onClick={handleFilterButtonClick}
      >
        {t('pages.products.filterLabels.filter')}
      </Button>
      <Button
        disabled={noFilterSetted() && !errorStatus && !filtered}
        variant="text"
        sx={{ height: 44, minWidth: 140 }}
        onClick={handleDeleteFiltersClick}
      >
        {t('pages.products.filterLabels.deleteFilters')}
      </Button>
    </Box>
  );
}
