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
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import { FiltersProps, filtersRender, SelectProps } from './filtersRender';

type Props = {
  open: boolean;
  toggleFiltersDrawer: (isOpen: boolean) => void;
  batchFilterItems: SelectProps;
  errorStatus: boolean;
  filters: Record<string, {value: string; label: string}>;
  setFilters: (value: Record<string, {value: string; label: string}>) => void;
  setPage: Dispatch<SetStateAction<number>>;
};


export default function FiltersDrawer({
  open,
  toggleFiltersDrawer,
  batchFilterItems,
  filters,
  setFilters,
  setPage,
}: Props) {
  const { t } = useScopedTranslation();
  const { config } = useInitiativeConfig();
  const [draftFilters, setDraftFilters] = useState<Record<string, {value: string; label: string}>>(filters);

  useEffect(() => setDraftFilters(filters), [filters]);

  const handleFilters = useCallback((filters: typeof draftFilters) => {
    setPage(0);
    toggleFiltersDrawer(false);
    setFilters(filters);
  }, []);

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
        {config && config.tables?.products?.filters.map(({ type, ...item }: FiltersProps) => {
          const isBatch = item.id === "productFileId";
          const template = isBatch ? batchFilterItems : config?.templates?.[item.id];
          return <FormControl key={item.id} fullWidth size="small" margin="normal">
            {type === "select" && <InputLabel id={`${item.id}-filter-select-label`}>
              {t(item.labelKey)}
            </InputLabel>}
            {filtersRender[type]({ item, t, template, filters: draftFilters, setFilters: (value) => setDraftFilters( prev => ({ ...prev, ...value })) })
            }
          </FormControl>;
        })}

        <Button
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
          onClick={() => handleFilters({})}
        >
          {t('pages.products.filterLabels.deleteFilters')}
        </Button>
      </Box>
    </Drawer>
  );
}
