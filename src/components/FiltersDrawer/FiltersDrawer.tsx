import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import {
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { PRODUCTS_CATEGORIES, PRODUCTS_STATES, USERS_TYPES } from '../../utils/constants';
import { institutionListSelector } from '../../redux/slices/invitaliaSlice';
import { fetchUserFromLocalStorage, truncateString } from '../../helpers';
import { BatchFilterItems } from '../Product/helpers';
import { filterInputWithSpaceRule } from '../../helpers';

type Props = {
  open: boolean;
  toggleFiltersDrawer: (isOpen: boolean) => void;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  producerFilter: string;
  setProducerFilter: Dispatch<SetStateAction<string>>;
  batchFilter: string;
  setBatchFilter: Dispatch<SetStateAction<string>>;
  categoryFilter: string;
  setCategoryFilter: Dispatch<SetStateAction<string>>;
  eprelCodeFilter: string;
  setEprelCodeFilter: Dispatch<SetStateAction<string>>;
  gtinCodeFilter: string;
  setGtinCodeFilter: Dispatch<SetStateAction<string>>;
  batchFilterItems: Array<BatchFilterItems>;
  errorStatus: boolean;
  handleDeleteFiltersButtonClick: () => void;
  setFiltering: Dispatch<SetStateAction<boolean>>;
  setPage: Dispatch<SetStateAction<number>>;
};

export const getChipColor = (
  status?: PRODUCTS_STATES | string
):
  | 'default'
  | 'primary'
  | 'indigo'
  | 'success'
  | 'error'
  | 'secondary'
  | 'info'
  | 'warning'
  | undefined => {
  switch (status) {
    case PRODUCTS_STATES.UPLOADED:
      return 'default';
    case PRODUCTS_STATES.WAIT_APPROVED:
      return 'info';
    case PRODUCTS_STATES.SUPERVISED:
      return 'primary';
    case PRODUCTS_STATES.APPROVED:
      return 'success';
    case PRODUCTS_STATES.REJECTED:
      return 'error';
    default:
      return 'default';
  }
};

export default function FiltersDrawer({
  open,
  toggleFiltersDrawer,
  statusFilter,
  setStatusFilter,
  producerFilter,
  setProducerFilter,
  batchFilter,
  setBatchFilter,
  categoryFilter,
  setCategoryFilter,
  batchFilterItems,
  eprelCodeFilter,
  setEprelCodeFilter,
  gtinCodeFilter,
  setGtinCodeFilter,
  errorStatus,
  handleDeleteFiltersButtonClick,
  setFiltering,
  setPage,
}: Props) {
  const { t } = useTranslation();
  const [draftStatus, setDraftStatus] = useState(statusFilter);
  const [draftProducer, setDraftProducer] = useState(producerFilter);
  const [draftBatch, setDraftBatch] = useState(batchFilter);
  const [draftCategory, setDraftCategory] = useState(categoryFilter);
  const [draftEprel, setDraftEprel] = useState(eprelCodeFilter);
  const [draftGtin, setDraftGtin] = useState(gtinCodeFilter);
  const [showEprelError, setShowEprelError] = useState(false);
  const [showGtinError, setShowGtinError] = useState(false);

  const isValidNumeric = (value: string) => /^\d+$/.test(value);
  const isValidGtin = (value: string) => /^[a-zA-Z0-9]{1,14}$/.test(value);
  const menuProps = useMemo(() => ({ PaperProps: { style: { maxHeight: 350 } } }), []);
  const selectSx = useMemo(() => ({ paddingRight: '38px !important' }), []);
  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const isDirty = useMemo(
    () =>
      draftStatus !== statusFilter ||
      draftProducer !== producerFilter ||
      draftBatch !== batchFilter ||
      draftCategory !== categoryFilter ||
      draftEprel !== eprelCodeFilter ||
      draftGtin !== gtinCodeFilter,
    [
      draftStatus,
      draftProducer,
      draftBatch,
      draftCategory,
      draftEprel,
      draftGtin,
      statusFilter,
      producerFilter,
      batchFilter,
      categoryFilter,
      eprelCodeFilter,
      gtinCodeFilter,
    ]
  );
  const appliedEmpty = useMemo(
    () =>
      ![categoryFilter, producerFilter, statusFilter, batchFilter, eprelCodeFilter, gtinCodeFilter]
        .filter(Boolean)
        .some((v) => v.trim()),
    [categoryFilter, producerFilter, statusFilter, batchFilter, eprelCodeFilter, gtinCodeFilter]
  );
  const institutionsList = useSelector(institutionListSelector);
  const isInvitaliaUser = [USERS_TYPES.INVITALIA_L1, USERS_TYPES.INVITALIA_L2].includes(
    user?.org_role as USERS_TYPES
  );

  useEffect(() => {
    if (open) {
      setDraftStatus(statusFilter);
      setDraftProducer(producerFilter);
      setDraftBatch(batchFilter);
      setDraftCategory(categoryFilter);
      setDraftEprel(eprelCodeFilter);
      setDraftGtin(gtinCodeFilter);
    }
  }, [
    open,
    statusFilter,
    producerFilter,
    batchFilter,
    categoryFilter,
    eprelCodeFilter,
    gtinCodeFilter,
  ]);

  const handleFilter = () => {
    if (draftEprel.length > 0 && !isValidNumeric(draftEprel)) {
      setShowEprelError(true);
      return;
    }
    if (draftGtin.length > 0 && !isValidGtin(draftGtin)) {
      setShowGtinError(true);
      return;
    }
    setShowEprelError(false);
    setShowGtinError(false);
    setStatusFilter(draftStatus);
    setProducerFilter(draftProducer);
    setBatchFilter(draftBatch);
    setCategoryFilter(draftCategory);
    setEprelCodeFilter(draftEprel);
    setGtinCodeFilter(draftGtin);

    setPage(0);
    setFiltering(true);
    toggleFiltersDrawer(false);
  };

  const handleDeleteFilters = () => {
    handleDeleteFiltersButtonClick();
    setDraftStatus('');
    setDraftProducer('');
    setDraftBatch('');
    setDraftCategory('');
    setDraftEprel('');
    setDraftGtin('');
    setPage(0);
    toggleFiltersDrawer(false);
  };

  const onDraftSelect =
    (setter: Dispatch<SetStateAction<string>>) => (event: SelectChangeEvent<string>) => {
      setter(event.target.value as string);
    };

  const resetDraftsToApplied = () => {
    setDraftStatus(statusFilter);
    setDraftProducer(producerFilter);
    setDraftBatch(batchFilter);
    setDraftCategory(categoryFilter);
    setDraftEprel(eprelCodeFilter);
    setDraftGtin(gtinCodeFilter);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        resetDraftsToApplied();
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
          aria-label="Chiudi filtri"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box paddingX="24px" maxWidth="417px">
        <FormControl fullWidth size="small" margin="normal">
          <InputLabel id="status-filter-select-label">
            {t('pages.products.filterLabels.status')}
          </InputLabel>
          <Select
            labelId="status-filter-select-label"
            id="status-filter-select"
            value={draftStatus}
            label={t('pages.products.filterLabels.status')}
            MenuProps={menuProps}
            onChange={onDraftSelect(setDraftStatus)}
            sx={selectSx}
          >
            {(Object.keys(PRODUCTS_STATES) as Array<PRODUCTS_STATES>)
              .filter(
                (status) =>
                  isInvitaliaUser ||
                  ![PRODUCTS_STATES.WAIT_APPROVED, PRODUCTS_STATES.SUPERVISED].includes(status)
              )
              .map((status) => (
                <MenuItem key={status} value={t(`pages.products.categories.${status}`)}>
                  <Chip
                    color={getChipColor(status)}
                    label={t(`pages.products.categories.${status}`)}
                  />
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {isInvitaliaUser && (
          <FormControl fullWidth size="small" margin="normal">
            <InputLabel id="producer-filter-select-label">
              {t('pages.products.filterLabels.producer')}
            </InputLabel>
            <Select
              labelId="producer-filter-select-label"
              id="producer-filter-select"
              value={draftProducer}
              label={t('pages.products.filterLabels.producer')}
              MenuProps={menuProps}
              onChange={(e) => setDraftProducer(e.target.value as string)}
              sx={selectSx}
            >
              {institutionsList?.map((producer) => (
                <MenuItem key={producer.institutionId} value={producer.institutionId}>
                  {producer.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl fullWidth size="small" margin="normal">
          <InputLabel id="batch-filter-select-label">
            {t('pages.products.filterLabels.batch')}
          </InputLabel>
          <Select
            labelId="batch-filter-select-label"
            id="batch-filter-select"
            value={draftBatch}
            label={t('pages.products.filterLabels.batch')}
            MenuProps={menuProps}
            onChange={onDraftSelect(setDraftBatch)}
            sx={selectSx}
          >
            {batchFilterItems?.map((batch) => (
              <MenuItem key={batch?.productFileId} value={batch?.productFileId}>
                <Tooltip title={batch?.batchName}>
                  <span>{truncateString(batch?.batchName, 35)}</span>
                </Tooltip>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" margin="normal">
          <InputLabel id="category-filter-select-label">
            {t('pages.products.filterLabels.category')}
          </InputLabel>
          <Select
            labelId="category-filter-select-label"
            id="category-filter-select"
            value={draftCategory}
            label={t('pages.products.filterLabels.category')}
            MenuProps={menuProps}
            onChange={onDraftSelect(setDraftCategory)}
            sx={selectSx}
          >
            {Object.keys(PRODUCTS_CATEGORIES).map((category) => (
              <MenuItem key={category} value={t(`pages.products.categories.${category}`)}>
                {t(`pages.products.categories.${category}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(() => {
          const showErrorEprel =
            showEprelError && draftEprel.length > 0 && !isValidNumeric(draftEprel);
          const helperEprel = showErrorEprel ? 'Il codice deve essere numerico' : undefined;
          return (
            <TextField
              fullWidth
              size="small"
              id="eprel-code-text"
              label={t('pages.products.filterLabels.eprelCode')}
              variant="outlined"
              margin="normal"
              value={draftEprel}
              onChange={(e) => {
                setDraftEprel(filterInputWithSpaceRule(e.target.value));
                if (showEprelError) {
                  setShowEprelError(false);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text').replace(/\s+/g, '');
                setDraftEprel(filterInputWithSpaceRule(text));
                if (showEprelError) {
                  setShowEprelError(false);
                }
              }}
              error={showErrorEprel}
              helperText={helperEprel}
              InputProps={{ inputProps: { inputMode: 'numeric', pattern: '[0-9]*' } }}
            />
          );
        })()}

        {(() => {
          const showErrorGtin = showGtinError && draftGtin.length > 0 && !isValidGtin(draftGtin);
          const helperGtin = showErrorGtin ? 'Il codice deve avere 14 caratteri' : undefined;
          return (
            <TextField
              fullWidth
              size="small"
              id="gtin-code-text"
              label={t('pages.products.filterLabels.gtinCode')}
              variant="outlined"
              margin="normal"
              value={draftGtin}
              onChange={(e) => {
                setDraftGtin(filterInputWithSpaceRule(e.target.value));
                if (showGtinError) {
                  setShowGtinError(false);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text').replace(/\s+/g, '');
                setDraftGtin(filterInputWithSpaceRule(text));
                if (showGtinError) {
                  setShowGtinError(false);
                }
              }}
              error={showErrorGtin}
              helperText={helperGtin}
              InputProps={{ inputProps: { maxLength: 14 } }}
            />
          );
        })()}

        <Button
          disabled={!isDirty}
          variant="outlined"
          fullWidth
          sx={{ height: 44, minWidth: 100, marginY: '24px' }}
          onClick={handleFilter}
        >
          {t('pages.products.filterLabels.filter')}
        </Button>

        <Button
          disabled={appliedEmpty && !errorStatus}
          variant="text"
          fullWidth
          sx={{ height: 44, minWidth: 100 }}
          onClick={handleDeleteFilters}
        >
          {t('pages.products.filterLabels.deleteFilters')}
        </Button>
      </Box>
    </Drawer>
  );
}
