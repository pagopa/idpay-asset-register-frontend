import React from 'react';
import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { MIPagination } from '@pagopa/mui-italia/components/MIPagination';
import EmptyListTable from '../../pages/components/EmptyListTable';
import ProductsTable from '../../pages/components/ProductsTable';
import { ProductDTO } from '../../api/generated/register';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import NewFilter from './NewFilter';
import ProductStatusActionBar from './ProductStatusActionBar';
import { useProductFilters } from './hooks/useProductFilters';

type Props = {
  isInvitaliaUser: boolean;
  isInvitaliaAdmin: boolean;
  isInitiativeClosed?: boolean;
  tableData: Array<ProductDTO>;
  hookLoading: boolean;
  itemsQty: number;
  paginatorFrom: number;
  paginatorTo: number;
  page: number;
  rowsPerPage: number;
  order: any;
  orderBy: keyof ProductDTO;
  filters: Record<string, { value: string; label?: string }>;
  enrichedFiltersConfig?: Array<{ id: string }>;
  selected: Array<string>;
  effectiveColumns: Array<any>;
  paginationConfig: any;
  tableConfig: any;
  selectionAllowedStatuses?: Array<string>;
  refreshKey: number;
  onRequestSort: any;
  handleListButtonClick: any;
  setSelected: any;
  handleChangePage: (event: React.ChangeEvent<unknown>, page: number) => void;
  handleChangeRowsPerPage: (limit: number) => void;
  handleDeleteFiltersButtonClick: () => void;
  handleToggleFiltersDrawer: (v: boolean) => void;
  handleOpenModalWithStatusCheck: (action: string) => void;
};

const ProductDataGridView: React.FC<Props> = ({
  isInvitaliaUser,
  isInvitaliaAdmin,
  isInitiativeClosed = false,
  tableData,
  hookLoading,
  itemsQty,
  paginatorFrom,
  paginatorTo,
  page,
  rowsPerPage,
  order,
  orderBy,
  filters,
  enrichedFiltersConfig,
  selected,
  effectiveColumns,
  paginationConfig,
  tableConfig,
  selectionAllowedStatuses,
  refreshKey,
  onRequestSort,
  handleListButtonClick,
  setSelected,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDeleteFiltersButtonClick,
  handleToggleFiltersDrawer,
  handleOpenModalWithStatusCheck,
}) => {
  const { t } = useScopedTranslation();
  const { filtersLabel } = useProductFilters({ filters, enrichedFiltersConfig });
  const theme = useTheme();
  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box flexGrow={1}>
          <TitleBox
            title={t('pages.products.title')}
            subTitle={
              isInvitaliaUser ? t('pages.products.subtitleL1L2') : t('pages.products.subtitle')
            }
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
            data-testid="title"
          />
        </Box>

        <Box flexShrink={0} ml={2}>
          <ProductStatusActionBar
            tableData={tableData}
            selected={selected}
            isInvitaliaUser={isInvitaliaUser}
            isInvitaliaAdmin={isInvitaliaAdmin}
            isInitiativeClosed={isInitiativeClosed}
            hookLoading={hookLoading}
            handleOpenModalWithStatusCheck={handleOpenModalWithStatusCheck}
          />
        </Box>
      </Box>

      <Box display="flex" alignItems="end" justifyContent="space-between" gap={2} mb={3}>
        {filtersLabel ? (
          <Chip
            size="medium"
            label={filtersLabel}
            sx={{
              color: `${theme.palette.primary.contrastText} !important`,
              backgroundColor: `${theme.palette.primary.main} !important`,
            }}
            onDelete={handleDeleteFiltersButtonClick}
            deleteIcon={
              <CloseIcon sx={{ color: `${theme.palette.primary.contrastText} !important` }} />
            }
          />
        ) : (
          <span />
        )}
        {(tableData?.length > 0 || filtersLabel) && <NewFilter onClick={() => handleToggleFiltersDrawer(true)} />}
      </Box>

      <Paper elevation={0} sx={{ width: '100%', mb: 2, pb: 3, backgroundColor: 'transparent' }}>
        {hookLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : tableData?.length === 0 ? (
          <EmptyListTable message="pages.products.noFileLoaded" />
        ) : (
          <Box sx={{ width: '100%' }} data-testid="products-table">
            <ProductsTable
              key={refreshKey}
              tableData={tableData}
              columns={effectiveColumns}
              selection={tableConfig?.selection}
              selectionAllowedStatuses={selectionAllowedStatuses}
              order={order}
              orderBy={orderBy}
              onRequestSort={onRequestSort}
              handleListButtonClick={handleListButtonClick}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        )}

        {!hookLoading &&
          paginationConfig &&
          Array.isArray(paginationConfig.rowsPerPageOptions) &&
          paginationConfig.rowsPerPageOptions.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            px={1}
            py={1}
            sx={{ backgroundColor: itemsQty > 0 ? 'divider' : 'transparent' }}
          >
            {itemsQty > 0 && (
              <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                {t('pages.products.rowsPerPage')}
              </Typography>
            )}
            {itemsQty > 0 && (
              <Box flexGrow={1} minWidth={0}>
                <MIPagination
                  count={Math.ceil(itemsQty / rowsPerPage)}
                  page={page + 1}
                  onChange={(event, selectedPage) => handleChangePage(event, selectedPage - 1)}
                  getItemAriaLabel={(type, pageNumber, selected) => {
                    if (type === 'previous') {
                      return t('pages.products.previousPage');
                    }
                    if (type === 'next') {
                      return t('pages.products.nextPage');
                    }
                    return `${t(selected ? 'pages.products.currentPage' : 'pages.products.goToPage')} ${pageNumber}`;
                  }}
                  itemsPerPageOptions={{
                    options: paginationConfig.rowsPerPageOptions,
                    limit: rowsPerPage,
                    onLimitChange: (limit) => handleChangeRowsPerPage(Number(limit)),
                    inputProps: { 'aria-label': t('pages.products.rowsPerPage') },
                  }}
                />
              </Box>
            )}
            <Box component="span" sx={visuallyHidden} aria-live="polite">
              {`${itemsQty > 0 ? paginatorFrom : 0} - ${itemsQty > 0 ? paginatorTo : 0} ${t('pages.products.tablePaginationFrom')} ${itemsQty}`}
            </Box>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default ProductDataGridView;
