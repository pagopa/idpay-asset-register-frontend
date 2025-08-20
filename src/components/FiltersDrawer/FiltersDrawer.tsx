import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import {
    Button, Chip,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { INVITALIA, PRODUCTS_CATEGORY, PRODUCTS_STATES } from '../../utils/constants';
import { institutionListSelector } from '../../redux/slices/invitaliaSlice';
import { fetchUserFromLocalStorage } from '../../helpers';
import { BatchFilterItems } from '../Product/helpers';

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
};

export const getChipColor = (status?: PRODUCTS_STATES | string): "default" | "primary" | "indigo" | "success" | "error" | "secondary" | "info" | "warning" | undefined => {
    switch (status) {
        case PRODUCTS_STATES.SUSPENDED:
            return 'default';
        case PRODUCTS_STATES.WAIT_APPROVED:
            return 'info';
        case PRODUCTS_STATES.SUPERVISIONED:
            return 'primary';
        case PRODUCTS_STATES.APPROVED:
            return 'success' ;
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
                                      }: Props) {
    const menuProps = useMemo(() => ({ PaperProps: { style: { maxHeight: 350 } } }), []);
    const selectSx = useMemo(() => ({ paddingRight: '38px !important' }), []);
    const user = useMemo(() => fetchUserFromLocalStorage(), []);
    const markInteracted = useCallback(() => setHasInteractedWithFilters(true), []);
    const [hasInteractedWithFilters, setHasInteractedWithFilters] = useState(false);
    const institutionsList = useSelector(institutionListSelector);
    const { t } = useTranslation();
    const noFilterSetted = (): boolean => areFiltersEmpty;
    const isInvitaliaUser = user?.org_role === INVITALIA;
    const handleFilter = () => {
        setFiltering(true);
        toggleFiltersDrawer(false);
    };
    const handleDeleteFilters = () => {
        handleDeleteFiltersButtonClick();
        toggleFiltersDrawer(false);
    };

    const onSelect =
        (setter: Dispatch<SetStateAction<string>>) =>
            (event: SelectChangeEvent<string>) => {
                setter(event.target.value as string);
                markInteracted();
            };

    const onInput =
        (setter: Dispatch<SetStateAction<string>>) =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                setter(event.target.value.trim());
                markInteracted();
            };

    const areFiltersEmpty = useMemo(
        () =>
            ![categoryFilter, producerFilter, statusFilter, batchFilter, eprelCodeFilter, gtinCodeFilter]
                .filter(Boolean)
                .some((v) => (v.trim())),
        [batchFilter, categoryFilter, eprelCodeFilter, gtinCodeFilter, producerFilter, statusFilter]
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={() => toggleFiltersDrawer(false)}
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
                        value={statusFilter}
                        label={t('pages.products.filterLabels.status')}
                        MenuProps={menuProps}
                        onChange={onSelect(setStatusFilter)}
                        sx={selectSx}
                    >
                        {Object.keys(PRODUCTS_STATES).map((status) => (
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
                            value={producerFilter}
                            label={t('pages.products.filterLabels.producer')}
                            MenuProps={menuProps}
                            onChange={onSelect(setProducerFilter)}
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
                        value={batchFilter}
                        label={t('pages.products.filterLabels.batch')}
                        MenuProps={menuProps}
                        onChange={onSelect(setBatchFilter)}
                        sx={selectSx}
                    >
                        {batchFilterItems?.map((batch) => (
                            <MenuItem key={batch?.productFileId} value={batch?.productFileId}>
                                {batch?.batchName}
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
                        value={categoryFilter}
                        label={t('pages.products.filterLabels.category')}
                        MenuProps={menuProps}
                        onChange={onSelect(setCategoryFilter)}
                        sx={selectSx}
                    >
                        {Object.keys(PRODUCTS_CATEGORY).map((category) => (
                            <MenuItem key={category} value={t(`pages.products.categories.${category}`)}>
                                {t(`pages.products.categories.${category}`)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    size="small"
                    id="eprel-code-text"
                    label={t('pages.products.filterLabels.eprelCode')}
                    variant="outlined"
                    margin="normal"
                    value={eprelCodeFilter}
                    onChange={onInput(setEprelCodeFilter)}
                />

                <TextField
                    fullWidth
                    size="small"
                    id="gtin-code-text"
                    label={t('pages.products.filterLabels.gtinCode')}
                    variant="outlined"
                    margin="normal"
                    value={gtinCodeFilter}
                    onChange={onInput(setGtinCodeFilter)}
                />

                <Button
                    disabled={noFilterSetted()}
                    variant="outlined"
                    fullWidth
                    sx={{ height: 44, minWidth: 100, marginY: '24px' }}
                    onClick={handleFilter}
                >
                    {t('pages.products.filterLabels.filter')}
                </Button>

                <Button
                    disabled={!hasInteractedWithFilters && noFilterSetted() && !errorStatus}
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
