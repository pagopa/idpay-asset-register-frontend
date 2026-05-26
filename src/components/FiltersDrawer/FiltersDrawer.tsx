import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { FiltersProps, filtersRender, SelectProps } from './filtersRender';

type Props = {
  open: boolean;
  toggleFiltersDrawer: (isOpen: boolean) => void;
  batchFilterItems: Record<string, SelectProps>;
  producerFilterItems?: Record<string, SelectProps>;
  errorStatus: boolean;
  filters: Record<string, { value: string; label?: string }>;
  setFilters: (value: Record<string, { value: string; label?: string }>) => void;
  setPage: Dispatch<SetStateAction<number>>;
  filtersConfig: any;
  templateConfig: any;
};


export default function FiltersDrawer({
  open,
  toggleFiltersDrawer,
  batchFilterItems,
  producerFilterItems,
  filters,
  setFilters,
  setPage,
  filtersConfig,
  templateConfig
}: Props) {
  const { t } = useScopedTranslation();
  const [draftFilters, setDraftFilters] = useState<Record<string, { value: string; label?: string }>>(filters);
  const [errors, setErrors] = useState<Array<string>>([]);
  const templateMap: Record<string, any> = {
    producer: producerFilterItems,
    productFileId: batchFilterItems
  };

  useEffect(() => setDraftFilters(filters), [filters]);

  const handleFilters = useCallback((filters: typeof draftFilters) => {
    setPage(0);
    toggleFiltersDrawer(false);
    setFilters(filters);
  }, []);

  const handleErrors = useCallback((id: string, isError: boolean) => {
    setErrors((prev) => isError ? !prev?.includes(id) ? [...(prev || []), id] : prev
      : prev?.filter(error => error !== id) || []);
  }, []);

  const handleDraftFilters = useCallback((id: string, value: { value: string; label?: string }) => {
    const newFilters = Object.entries(draftFilters).reduce((acc, [filterKey, filterValue]) =>
      ({ ...acc, ...(filterKey !== id ? { [filterKey]: filterValue } : {}) }), value.value ? { [id]: value } : {});
    setDraftFilters(newFilters);
  }, [draftFilters]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        toggleFiltersDrawer(false);
      }}
      data-testid="detail-drawer"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          minWidth: '400px',
          gap: 1,
        }}
      >
        <Typography variant="overline">{t('pages.products.filterLabels.filter')}</Typography>
        <IconButton
          data-testid="open-detail-button"
          onClick={() => toggleFiltersDrawer(false)}
          sx={{ color: 'text.secondary', ml: 'auto' }}
          aria-label="Close filters"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box paddingX="24px" maxWidth="417px">
        {filtersConfig && filtersConfig.map(({ type, ...item }: FiltersProps) => {
          const template = templateMap?.[item.id] || templateConfig?.[item.id];
          const filtersParams = { item, t, template, errors, setErrors: handleErrors, filters: draftFilters, setFilters: handleDraftFilters };

          return <FormControl key={item.id} fullWidth size="small" margin="normal">
            {type === "select" && <InputLabel id={`${item.id}-filter-select-label`}>
              {t(item.labelKey)}
            </InputLabel>}
            {filtersRender[type](filtersParams)
            }
          </FormControl>;
        })}

        <Button
          disabled={!Object.keys(draftFilters).length || !!errors.length}
          variant="outlined"
          fullWidth
          sx={{ height: 44, minWidth: 100, marginY: '24px' }}
          onClick={() => handleFilters(draftFilters)}
        >
          {t('pages.products.filterLabels.filter')}
        </Button>

        <Button
          disabled={!Object.keys(draftFilters).length}
          variant="text"
          fullWidth
          sx={{ height: 44, minWidth: 100 }}
          onClick={() => {
            handleFilters({});
            setErrors([]);
          }}
        >
          {t('pages.products.filterLabels.deleteFilters')}
        </Button>
      </Box>
    </Drawer>
  );
}
