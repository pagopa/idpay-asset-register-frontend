import React, { useMemo, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { PRODUCTS_CATEGORIES, PRODUCTS_STATES, USERS_TYPES } from '../../utils/constants';
import { fetchUserFromLocalStorage } from '../../helpers';
import { institutionListSelector } from '../../redux/slices/invitaliaSlice';
import { filterInputWithSpaceRule } from '../../helpers';
import { BatchFilterItems } from './helpers';

interface FilterProps {
  categoryFilter: string;
  setCategoryFilter: Dispatch<SetStateAction<string>>;
  producerFilter: string;
  setProducerFilter: Dispatch<SetStateAction<string>>;
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
  loading: boolean;
}

const FILTER_WIDTHS = {
  categoria: '10.08%',
  stato: '10.08%',
  producer: '15%',
  lotto: '25.22%',
  eprel: '10.83%',
  gtin: '15.83%',
  rimuovi: '12.97%',
};

export default function FilterBar({
  categoryFilter,
  setCategoryFilter,
  producerFilter,
  setProducerFilter,
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
  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const isInvitaliaUser = [USERS_TYPES.INVITALIA_L1, USERS_TYPES.INVITALIA_L2].includes(
    user?.org_role as USERS_TYPES
  );
  const [hasInteractedWithFilters, setHasInteractedWithFilters] = useState(false);
  const institutionsList = useSelector(institutionListSelector);

  const noFilterSetted = (): boolean =>
    !categoryFilter.trim() &&
    !producerFilter.trim() &&
    !statusFilter.trim() &&
    !batchFilter.trim() &&
    !eprelCodeFilter.trim() &&
    !gtinCodeFilter.trim();

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value as string);
    setHasInteractedWithFilters(true);
  };

  const handleProducerChange = (event: SelectChangeEvent) => {
    setProducerFilter(event.target.value as string);
    setHasInteractedWithFilters(true);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as string);
    setHasInteractedWithFilters(true);
  };
  const handleBatchChange = (event: SelectChangeEvent) => {
    setBatchFilter(event.target.value as string);
    setHasInteractedWithFilters(true);
  };
  const handleEprelCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEprelCodeFilter(filterInputWithSpaceRule(event.target.value));
    setHasInteractedWithFilters(true);
  };
  const handleGtinCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGtinCodeFilter(filterInputWithSpaceRule(event.target.value));
    setHasInteractedWithFilters(true);
  };

  const handleFilter = () => setFiltering(true);
  const handleDeleteFilters = () => handleDeleteFiltersButtonClick();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          mb: 5,
          width: '100%',
          overflow: 'visible',
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
            sx={{
              paddingRight: '38px !important',
            }}
          >
            {Object.keys(PRODUCTS_CATEGORIES).map((category) => (
              <MenuItem key={category} value={t(`pages.products.categories.${category}`)}>
                {t(`pages.products.categories.${category}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isInvitaliaUser && (
          <FormControl size="small" sx={{ flexBasis: FILTER_WIDTHS.producer }}>
            <InputLabel id="producer-filter-select-label">
              {t('pages.products.filterLabels.producer')}
            </InputLabel>
            <Select
              labelId="producer-filter-select-label"
              id="producer-filter-select"
              value={producerFilter}
              label={t('pages.products.filterLabels.producer')}
              MenuProps={{ PaperProps: { style: { maxHeight: 350 } } }}
              onChange={handleProducerChange}
              sx={{
                paddingRight: '38px !important',
              }}
            >
              {institutionsList?.map((producer) => (
                <MenuItem key={producer.institutionId} value={producer.institutionId}>
                  {producer.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

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
            sx={{
              paddingRight: '38px !important',
            }}
          >
            {Object.keys(PRODUCTS_STATES).map((status) => (
              <MenuItem key={status} value={t(`pages.products.categories.${status}`)}>
                {t(`pages.products.categories.${status}`)}
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
            sx={{
              paddingRight: '38px !important',
            }}
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
          disabled={!hasInteractedWithFilters && noFilterSetted() && !errorStatus}
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
    </>
  );
}
