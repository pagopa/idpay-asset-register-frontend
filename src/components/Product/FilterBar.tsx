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
import {PRODUCTS_CATEGORY, PRODUCTS_STATES} from '../../utils/constants';
import { BatchFilterItems } from './helpers';

interface FilterProps {
  categoryFilter: string;
  setCategoryFilter: Dispatch<SetStateAction<string>>;
  stateFilter: string;
  setStateFilter: Dispatch<SetStateAction<string>>;
  setFiltering: Dispatch<SetStateAction<boolean>>;
  batchFilter: string;
  setBatchFilter: Dispatch<SetStateAction<string>>;
  batchFilterItems: Array<BatchFilterItems>;
  eprelCodeFilter: string;
  setEprelCodeFilter: Dispatch<SetStateAction<string>>;
  gtinCodeFilter: string;
  setGtinCodeFilter: Dispatch<SetStateAction<string>>;
  tableData: Array<ProductDTO>;
  handleDeleteFiltersButtonClick: () => void;
}

export default function FilterBar(props: FilterProps) {
  const {
    categoryFilter,
    setCategoryFilter,
    stateFilter,
    setStateFilter,
    setFiltering,
    batchFilter,
    setBatchFilter,
    batchFilterItems,
    eprelCodeFilter,
    setEprelCodeFilter,
    gtinCodeFilter,
    setGtinCodeFilter,
    tableData,
    handleDeleteFiltersButtonClick,
  } = props;

  const { t } = useTranslation();

  const handleFilterButtonClick = () => {
    setFiltering(true);
  };

  const selectMenuProps = {
    PaperProps: {
      style: {
        maxHeight: 250,
      },
    },
  };

  const noFilterSetted = (): boolean =>
    categoryFilter === '' && batchFilter === '' && eprelCodeFilter === '' && gtinCodeFilter === '';

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value as string);
  };

  const handleStateFilterChange = (event: SelectChangeEvent) => {
    setStateFilter(event.target.value as string);
  };

  const handleCategoryBatchChange = (event: SelectChangeEvent) => {
    console.log('§ BATCH', event.target.value as string);
    setBatchFilter(event.target.value as string);
  };

  const handleEprelCodeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEprelCodeFilter(event.target.value);
  };

  const handleGtinCodeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGtinCodeFilter(event.target.value);
  };
  return (
    <>
      {tableData?.length > 0 && (
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
          <FormControl fullWidth size="small">
            <InputLabel id="state-filter-select-label">
              {t('pages.invitaliaProductsList.state')}
            </InputLabel>
            <Select
                labelId="state-filter-select-label"
                id="state-filter-select"
                value={stateFilter}
                label={t('pages.invitaliaProductsList.state')}
                MenuProps={selectMenuProps}
                onChange={handleStateFilterChange}
            >
              {Object.keys(PRODUCTS_STATES).map((category) => (
                  <MenuItem key={category} value={t(`pages.invitaliaProductsList.${category}`)}>
                    {t(`pages.invitaliaProductsList.${category}`)}
                  </MenuItem>
              ))}
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
            disabled={noFilterSetted()}
            variant="text"
            sx={{ height: 44, minWidth: 140 }}
            onClick={handleDeleteFiltersButtonClick}
          >
            {t('pages.products.filterLabels.deleteFilters')}
          </Button>
        </Box>
      )}
    </>
  );
}
