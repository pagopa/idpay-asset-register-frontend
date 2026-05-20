import React from 'react';
import { Box, Paper, TablePagination, CircularProgress } from '@mui/material';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import { grey } from '@mui/material/colors';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import EmptyListTable from '../../pages/components/EmptyListTable';
import ProductsTable from '../../pages/components/ProductsTable';
import { ProductDTO } from '../../api/generated/register';
import NewFilter from './NewFilter';
import ProductStatusActionBar from './ProductStatusActionBar';

type Props = {
  t: any;
  isInvitaliaUser: boolean;
  tableData: Array<ProductDTO>;
  hookLoading: boolean;
  itemsQty: number;
  paginatorFrom: number;
  paginatorTo: number;
  page: number;
  rowsPerPage: number;
  order: any;
  orderBy: keyof ProductDTO;
  filtersLabel: string;
  selected: Array<string>;
  effectiveColumns: Array<any>;
  paginationConfig: any;
  tableConfig: any;
  refreshKey: number;
  onRequestSort: any;
  handleListButtonClick: any;
  setSelected: any;
  handleChangePage: any;
  handleChangeRowsPerPage: any;
  handleDeleteFiltersButtonClick: () => void;
  handleToggleFiltersDrawer: (v: boolean) => void;
  handleOpenModalWithStatusCheck: (action: string) => void;
};

const ProductDataGridView: React.FC<Props> = ({
  t,
  isInvitaliaUser,
  tableData,
  hookLoading,
  itemsQty,
  paginatorFrom,
  paginatorTo,
  page,
  rowsPerPage,
  order,
  orderBy,
  filtersLabel,
  selected,
  effectiveColumns,
  paginationConfig,
  tableConfig,
  refreshKey,
  onRequestSort,
  handleListButtonClick,
  setSelected,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDeleteFiltersButtonClick,
  handleToggleFiltersDrawer,
  handleOpenModalWithStatusCheck,
}) => (
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
          hookLoading={hookLoading}
          t={t}
          handleOpenModalWithStatusCheck={handleOpenModalWithStatusCheck}
        />
      </Box>
    </Box>

    <Box display="flex" alignItems="end" justifyContent="space-between" gap={2} mb={3}>
      {filtersLabel ? (
        <Chip
          size="medium"
          label={filtersLabel}
          sx={{ color: 'white !important', backgroundColor: '#0073E6 !important' }}
          onDelete={handleDeleteFiltersButtonClick}
          deleteIcon={<CloseIcon sx={{ color: 'white !important' }} />}
        />
      ) : (
        <span />
      )}
      {tableData?.length > 0 && <NewFilter onClick={() => handleToggleFiltersDrawer(true)} />}
    </Box>

    <Paper sx={{ width: '100%', mb: 2, pb: 3, backgroundColor: grey.A100 }}>
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
            order={order}
            orderBy={orderBy}
            onRequestSort={onRequestSort}
            handleListButtonClick={handleListButtonClick}
            selected={selected}
            setSelected={setSelected}
          />
        </Box>
      )}

      {tableData?.length > 0 && !hookLoading && (
        <TablePagination
          component="div"
          count={itemsQty || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={paginationConfig?.rowsPerPageOptions ?? [10, 25, 50, 100]}
          labelRowsPerPage={t('pages.products.elementsPerPage')}
          labelDisplayedRows={() =>
            `${paginatorFrom} - ${paginatorTo} ${t(
              'pages.products.tablePaginationFrom'
            )} ${itemsQty}`
          }
        />
      )}
    </Paper>
  </>
);

export default ProductDataGridView;
