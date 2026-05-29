import React, { useState } from 'react';
import { Box, Paper, TablePagination, CircularProgress } from '@mui/material';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import EmptyListTable from '../../pages/components/EmptyListTable';
import ProductsTable from '../../pages/components/ProductsTable';
import { ProductDTO, ProductStatus } from '../../api/generated/register';
import { setWaitApprovedStatusList } from '../../services/registerService';
import { DEBUG_CONSOLE, EMPTY_DATA, USERS_NAMES } from '../../utils/constants';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import NewFilter from './NewFilter';
import ProductStatusActionBar from './ProductStatusActionBar';
import { useProductFilters } from './hooks/useProductFilters';
import ProductModal from './ProductModal';
import { getStatusChecks, modalStatusMsg } from './ProductDataGrid.helpers';
import ProductConfirmDialog from './ProductConfirmDialog';
import MsgResult, { MsgResultProps } from './MsgResult';

type Props = {
  initiativeId: string;
  isInvitaliaUser: boolean;
  isInvitaliaAdmin: boolean;
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
};

const msgInitialValue = { message: '' };

const ProductDataGridView: React.FC<Props> = ({
  initiativeId,
  isInvitaliaUser,
  isInvitaliaAdmin,
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
}) => {
  const { t } = useScopedTranslation();
  const { filtersLabel } = useProductFilters({ filters });
  const theme = useTheme();

  const [message, setMessage] = useState<MsgResultProps>(msgInitialValue);
  const [modalAction, setModalAction] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmRestore = async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatus,
    motivation: string
  ) => {
    try {
      await setWaitApprovedStatusList(initiativeId, gtinCodes, currentStatus, motivation);
      setMessage(modalStatusMsg.waitApproved);
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error(error);
      }
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleModalAction = (action: string) => {
    const { selectedStatuses, someUploaded, length } = getStatusChecks(selected, tableData);
    if (length) {
      if (isInvitaliaAdmin && someUploaded) {
        setMessage(modalStatusMsg.errorYourselfApproved);
        setTimeout(() => setMessage(msgInitialValue), 3000);
        return;
      }

      const uniqueStatuses = Array.from(new Set(selectedStatuses));
      if (uniqueStatuses.length > 1) {
        setMessage(modalStatusMsg.errorMixSelected);
        setTimeout(() => setMessage(msgInitialValue), 3000);
        return;
      }
      setModalAction(action);
      setIsModalOpen(true);
    }
  };

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
            hookLoading={hookLoading}
            setModalAction={handleModalAction}
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
            deleteIcon={<CloseIcon sx={{ color: `${theme.palette.primary.contrastText} !important` }} />}
          />
        ) : (
          <span />
        )}
        {tableData?.length > 0 && <NewFilter onClick={() => handleToggleFiltersDrawer(true)} />}
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
            sx={{ backgroundColor: 'transparent' }}
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

      <ProductModal
        initiativeId={initiativeId}
        open={isModalOpen}
        onClose={(cancelled) => {
          setIsModalOpen(false);
          if (cancelled) {
            setMessage(msgInitialValue);
          }
        }}
        actionType={modalAction}
        // onUpdateTable={updaDataTable}
        selectedProducts={
          tableData
            .filter((row) => row.gtinCode && selected.includes(row.gtinCode))
            .map((row) => ({
              status: row.status as ProductStatus,
              productName: row.productName,
              gtinCode: row.gtinCode,
              category: row.category,
            })) as Array<{
              status: ProductStatus;
              productName?: string;
              gtinCode: string;
              category?: string;
            }>
        }
        onSuccess={() => { }}
      />

      <ProductConfirmDialog
        open={isDialogOpen}
        cancelButtonText={t('invitaliaModal.waitApproved.buttonTextCancel')}
        confirmButtonText={`${t('invitaliaModal.waitApproved.buttonTextConfirm')} (${selected.length
          })`}
        title={t('invitaliaModal.waitApproved.listTitle')}
        message={t('pages.invitaliaModal.waitApproved.description', { user: USERS_NAMES.INVITALIA_L2 })}
        onCancel={() => setIsDialogOpen(false)}
        onConfirm={async () => {
          const currentStatus =
            (tableData.find((row) => row.gtinCode === selected[0])
              ?.status as unknown as ProductStatus) || ProductStatus.SUPERVISED;
          try {
            await handleConfirmRestore(selected, currentStatus, EMPTY_DATA);
            // updaDataTable();
            setIsDialogOpen(false);
          } catch (error) {
            if (DEBUG_CONSOLE) {
              console.error('Error during restore:', error);
            }
          }
        }}
        onSuccess={() => {
          setMessage(msgInitialValue);
          const currentStatus =
            (tableData.find((row) => row.gtinCode === selected[0])
              ?.status as unknown as ProductStatus) || ProductStatus.SUPERVISED;
          if (currentStatus === ProductStatus.UPLOADED) {
            setMessage(modalStatusMsg.waitApproved);
          }
        }}
      />

      <MsgResult {...message} bottom={80} />
    </>
  );
};

export default ProductDataGridView;
