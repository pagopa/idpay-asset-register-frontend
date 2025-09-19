import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, TablePagination, CircularProgress } from '@mui/material';
import Chip from '@mui/material/Chip';
import FlagIcon from '@mui/icons-material/Flag';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProducts,
  getBatchFilterList,
  getInstitutionsList,
} from '../../services/registerService';
import {
  PAGINATION_ROWS_PRODUCTS,
  EMPTY_DATA,
  USERS_TYPES,
  PRODUCTS_STATES,
  USERS_NAMES,
  MIDDLE_STATES,
  // L1_MOTIVATION_OK,
  DEBUG_CONSOLE,
} from '../../utils/constants';
import { ProductStatusEnum } from '../../api/generated/register/ProductStatus';
import {
  batchIdSelector,
  batchNameSelector,
  setBatchId,
  setBatchName,
} from '../../redux/slices/productsSlice';
import EmptyListTable from '../../pages/components/EmptyListTable';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { fetchUserFromLocalStorage } from '../../helpers';
import ProductsTable from '../../pages/components/ProductsTable';
import { userFromJwtTokenAsJWTUser } from '../../hooks/useLogin';
import {
  institutionListSelector,
  institutionSelector,
  setInstitutionList,
} from '../../redux/slices/invitaliaSlice';
import FiltersDrawer from '../FiltersDrawer/FiltersDrawer';
import { Institution } from '../../model/Institution';
import { setWaitApprovedStatusList } from '../../services/registerService';
import DetailDrawer from '../DetailDrawer/DetailDrawer';
import { BatchFilterItems, Order } from './helpers';
import { getStatusChecks, handleModalSuccess } from './ProductDataGrid.helpers';
import ProductDetail from './ProductDetail';
import ProductModal from './ProductModal';
import NewFilter from './NewFilter';
import ProductConfirmDialog from './ProductConfirmDialog';
import MsgResult from './MsgResult';

type ProductDataGridProps = {
  organizationId: string;
  children?: React.ReactNode;
};

const buttonStyle = {
  height: 48,
  fontWeight: 700,
  fontSize: 16,
  marginRight: 2,
};

const ProductDataGrid: React.FC<ProductDataGridProps> = ({ organizationId, children }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showMsgRejected, setShowMsgRejected] = useState(false);
  const [showMsgWaitApproved, setShowMsgWaitApproved] = useState(false);
  const batchName = useSelector(batchNameSelector);
  const batchId = useSelector(batchIdSelector);
  const institutions = useSelector(institutionListSelector);
  const institution = useSelector(institutionSelector);
  const [order, setOrder] = useState<Order>('asc');
  const [refreshKey, setRefreshKey] = useState(0);
  const [orderBy, setOrderBy] = useState<keyof ProductDTO>('category');
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsQty, setItemsQty] = useState<number | undefined>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [producerFilter, setProducerFilter] = useState<string>('');
  const [batchFilter, setBatchFilter] = useState<string>('');
  const [eprelCodeFilter, setEprelCodeFilter] = useState<string>('');
  const [gtinCodeFilter, setGtinCodeFilter] = useState<string>('');
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const [drawerData, setDrawerData] = useState<ProductDTO>({});
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filtering, setFiltering] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Array<ProductDTO>>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION_ROWS_PRODUCTS);
  const [paginatorFrom, setPaginatorFrom] = useState<number | undefined>(1);
  const [paginatorTo, setPaginatorTo] = useState<number | undefined>(0);
  const [batchFilterItems, setBatchFilterItems] = useState<Array<BatchFilterItems>>([]);
  const [apiErrorOccurred, setApiErrorOccurred] = useState<boolean>(false);
  const [filtersDrawerOpened, setFiltersDrawerOpened] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<string>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<string | undefined>(undefined);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [adminDefaultApplied, setAdminDefaultApplied] = useState(false);
  const [showMsgApproved, setShowMsgApproved] = useState(false);
  const [showMixStatusError, setShowMixStatusError] = useState(false);
  const [showYourselfApprovedError, setShowYourselfApprovedError] = useState(false);

  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const isInvitaliaUser = user?.org_role === USERS_TYPES.INVITALIA_L1;
  const isInvitaliaAdmin = user?.org_role === USERS_TYPES.INVITALIA_L2;

  useEffect(() => {
    setSelected([]);
  }, [tableData]);

  const fetchProductList = () => {
    setLoading(true);
    callProductsApi(organizationId);
  };

  const fetchInstitutions = async () => {
    try {
      const institutionsData = await getInstitutionsList();
      const institutionList = institutionsData.institutions;
      dispatch(setInstitutionList(institutionList as Array<Institution>));
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error('Error fetching institutions:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const updaDataTable = () => {
    setRefreshKey((k) => k + 1);
    fetchProductList();
  };

  const callProductsApi = (organizationId: string) => {
    const sortKey = `${orderBy},${order}`;
    const user = userFromJwtTokenAsJWTUser(localStorage.getItem('token') || '');

    console.log(organizationId);
    void getProducts(
      isInvitaliaUser || isInvitaliaAdmin ? producerFilter : user.org_id,
      page,
      rowsPerPage,
      sortKey,
      categoryFilter ? t(`pages.products.categories.${categoryFilter}`) : '',
      statusFilter ? t(`pages.products.categories.${statusFilter}`) : '',
      eprelCodeFilter,
      gtinCodeFilter,
      undefined,
      batchFilter
    )
      .then((res) => {
        const { content, pageNo, totalElements } = res;
        setTableData(content ? Array.from(content) : []);
        setItemsQty(totalElements);
        if (pageNo !== undefined && totalElements) {
          setPaginatorFrom(pageNo * rowsPerPage + 1);
          setPaginatorTo(
            rowsPerPage * (Number(pageNo) + 1) < totalElements
              ? rowsPerPage * (Number(pageNo) + 1)
              : totalElements
          );
        }
        setApiErrorOccurred(false);
      })
      .catch(() => handleStateForError())
      .finally(() => {
        setLoading(false);
        setFiltering(false);
      });

    dispatch(setBatchName(''));
    dispatch(setBatchId(''));
  };

  const handleStateForError = () => {
    setApiErrorOccurred(true);
    setTableData([]);
    setLoading(false);
  };

  useEffect(() => {
    if (batchId) {
      setBatchFilter(batchId);
      setFiltering(true);
    }
  }, [batchName, batchId, batchFilterItems]);

  useEffect(() => {
    if (isInvitaliaUser && institution?.institutionId) {
      setProducerFilter(institution.institutionId);
    }
    setReady(true);
  }, [isInvitaliaUser, institution?.institutionId]);

  useEffect(() => {
    if (isInvitaliaAdmin && !adminDefaultApplied) {
      setStatusFilter('Da approvare');
      setAdminDefaultApplied(true);
    }

    if (isInvitaliaAdmin || isInvitaliaUser) {
      void fetchInstitutions();
    }

    setLoading(true);
    const targetId = isInvitaliaUser
      ? producerFilter || institution?.institutionId || ''
      : organizationId;

    void getBatchFilterList(targetId)
      .then((res) => {
        setBatchFilterItems(res as Array<BatchFilterItems> | []);
      })
      .catch(() => {
        setBatchFilterItems([]);
      })
      .finally(() => setLoading(false));
  }, [ready, isInvitaliaUser, producerFilter, institution?.institutionId, organizationId]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    setLoading(true);
    callProductsApi(organizationId);
  }, [ready, page, orderBy, order, rowsPerPage, organizationId]);

  useEffect(() => {
    if (!ready || !filtering) {
      return;
    }
    setLoading(true);
    callProductsApi(organizationId);
  }, [ready, filtering, organizationId]);

  const handleDeleteFiltersButtonClick = () => {
    setCategoryFilter('');
    setStatusFilter('');
    setProducerFilter('');
    setBatchFilter('');
    setEprelCodeFilter('');
    setGtinCodeFilter('');
    setApiErrorOccurred(false);
    setFiltering(true);
  };

  const handleToggleDrawer = (newOpen: boolean) => {
    setDrawerOpened(newOpen);
  };

  const handleToggleFiltersDrawer = (newOpen: boolean) => {
    setFiltersDrawerOpened(newOpen);
  };

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof ProductDTO) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleListButtonClick = (row: ProductDTO) => {
    setDrawerData(row);
    setDrawerOpened(true);
  };

  const callWaitApprovedApi = async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatusEnum,
    motivation: string
  ) => {
    try {
      await setWaitApprovedStatusList(gtinCodes, currentStatus, motivation);
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error(error);
      }
    }
  };

  const handleConfirmRestore = async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatusEnum,
    motivation: string
  ) => {
    await callWaitApprovedApi(gtinCodes, currentStatus, motivation);
    setRestoreDialogOpen(false);
    setShowMsgApproved(true);
  };

  const handleOpenModal = (action: string) => {
    if (action === PRODUCTS_STATES.WAIT_APPROVED) {
      setRestoreDialogOpen(true);
    } else {
      setModalAction(action);
      setModalOpen(true);
    }
    return Promise.resolve();
  };

  const handleOpenModalWithStatusCheck = (action: string) => {
    const { allUploaded, allSupervised, allWaitApproved, someUploaded, length } = getStatusChecks(
      selected,
      tableData
    );

    if (length === 0) {
      return;
    }

    if (isInvitaliaAdmin && someUploaded) {
      setShowYourselfApprovedError(true);
      setTimeout(() => setShowYourselfApprovedError(false), 3000);
      return;
    }

    if (allUploaded || allSupervised || (isInvitaliaAdmin && allWaitApproved)) {
      void handleOpenModal(action);
    } else {
      setShowMixStatusError(true);
      setTimeout(() => setShowMixStatusError(false), 3000);
    }
  };

  const filtersLabel = useMemo(() => {
    const norm = (s?: string) => (s ? s.trim() : '');

    const producer = producerFilter?.trim()
      ? institutions?.find((p: any) => p.institutionId === producerFilter)?.description ||
        producerFilter.trim()
      : '';

    const batch = batchFilter?.trim()
      ? batchFilterItems?.find((b) => b?.productFileId === batchFilter)?.batchName ||
        batchFilter.trim()
      : '';

    return [
      norm(categoryFilter),
      norm(statusFilter),
      norm(producer),
      norm(batch),
      norm(eprelCodeFilter),
      norm(gtinCodeFilter),
    ]
      .filter((s): s is string => !!s)
      .join(', ');
  }, [
    categoryFilter,
    statusFilter,
    producerFilter,
    institutions,
    batchFilter,
    batchFilterItems,
    eprelCodeFilter,
    gtinCodeFilter,
  ]);

  const renderActionButtons = () => {
    if (!(tableData?.length > 0 && !loading && selected.length !== 0)) {
      return null;
    }
    const isSomeSupervised = selected.some(
      (gtinCode) =>
        String(tableData.find((row) => row.gtinCode === gtinCode)?.status) ===
        PRODUCTS_STATES.SUPERVISED
    );
    return (
      <Box mb={2} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button
          data-testid="rejectedBtn"
          variant="outlined"
          color="error"
          sx={{ ...buttonStyle }}
          onClick={() =>
            handleOpenModalWithStatusCheck(
              isInvitaliaUser ? PRODUCTS_STATES.REJECTED : MIDDLE_STATES.REJECT_APPROVATION
            )
          }
        >
          {isInvitaliaUser
            ? `${t('invitaliaModal.rejected.buttonText')} (${selected.length})`
            : `${t('invitaliaModal.rejectApprovation.buttonText')} (${selected.length})`}
        </Button>
        {isInvitaliaUser && !isSomeSupervised && (
          <Button
            data-testid="supervisedBtn"
            color="primary"
            variant="outlined"
            sx={{ ...buttonStyle }}
            onClick={() => handleOpenModalWithStatusCheck(PRODUCTS_STATES.SUPERVISED)}
          >
            <FlagIcon /> {` ${t('invitaliaModal.supervised.buttonText')} (${selected.length})`}
          </Button>
        )}
        <Button
          data-testid="waitApprovedBtn"
          color="primary"
          variant="contained"
          sx={{ ...buttonStyle }}
          disabled={
            selected.length === 0 ||
            (selected.some(
              (gtinCode) =>
                String(tableData.find((row) => row.gtinCode === gtinCode)?.status) ===
                PRODUCTS_STATES.WAIT_APPROVED
            ) &&
              isInvitaliaUser)
          }
          onClick={() =>
            handleOpenModalWithStatusCheck(
              isInvitaliaUser ? PRODUCTS_STATES.WAIT_APPROVED : MIDDLE_STATES.ACCEPT_APPROVATION
            )
          }
        >
          {` ${t('invitaliaModal.waitApproved.buttonText')} (${selected.length})`}
        </Button>
      </Box>
    );
  };

  const renderResultMessages = () => (
    <>
      {showMsgWaitApproved && (
        <MsgResult severity="success" message={t('msgResutlt.okWaitApproved')} bottom={80} />
      )}
      {showMsgApproved && (
        <MsgResult
          severity="success"
          message={
            isInvitaliaAdmin ? t('msgResutlt.okL2ButtonApproved') : t('msgResutlt.okButtonApproved')
          }
          bottom={80}
        />
      )}
      {showMsgRejected && (
        <MsgResult
          severity="success"
          message={
            isInvitaliaAdmin ? t('msgResutlt.okL2ButtonRejected') : t('msgResutlt.okButtonRejected')
          }
          bottom={80}
        />
      )}
      {showMixStatusError && (
        <MsgResult severity="error" message={t('msgResutlt.errorMixSelected')} bottom={80} />
      )}
      {showYourselfApprovedError && (
        <MsgResult severity="error" message={t('msgResutlt.errorYourselfApproved')} bottom={80} />
      )}
    </>
  );

  return (
    <>
      {renderActionButtons()}

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
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
        <NewFilter onClick={() => handleToggleFiltersDrawer(true)} />
      </Box>

      {tableData?.length === 0 && !loading && (
        <EmptyListTable message="pages.products.noFileLoaded" />
      )}

      <Paper sx={{ width: '100%', mb: 2, pb: 3, backgroundColor: grey.A100 }}>
        {tableData?.length > 0 ? (
          loading ? (
            <CircularProgress
              size={36}
              sx={{
                color: '#0055AA',
                position: 'absolute',
                top: '50%',
                left: '50%',
              }}
            />
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <ProductsTable
                key={refreshKey}
                tableData={tableData}
                emptyData={EMPTY_DATA}
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                handleListButtonClick={handleListButtonClick}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
          )
        ) : (
          children || null
        )}

        {tableData?.length > 0 && !loading && (
          <TablePagination
            component="div"
            count={itemsQty || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
            labelDisplayedRows={() =>
              `${paginatorFrom} - ${paginatorTo} ${t(
                'pages.products.tablePaginationFrom'
              )} ${itemsQty}`
            }
            sx={{
              '& .MuiTablePagination-actions button': {
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: 'transparent' },
              },
            }}
          />
        )}
      </Paper>

      <ProductModal
        open={modalOpen}
        onClose={(cancelled) => {
          setModalOpen(false);
          if (cancelled) {
            setShowMsgRejected(false);
            setShowMsgApproved(false);
            setShowMsgWaitApproved(false);
          }
        }}
        actionType={modalAction}
        onUpdateTable={updaDataTable}
        selectedProducts={tableData
          .filter((row) => row.gtinCode && selected.includes(row.gtinCode))
          .map((row) => ({
            status: row.status as ProductStatusEnum,
            productName: row.productName,
            gtinCode: row.gtinCode,
            category: row.category,
          }))}
        onSuccess={(action: string | undefined) =>
          handleModalSuccess({
            selected,
            tableData,
            modalAction: action,
            isInvitaliaUser,
            setShowMsgRejected,
            setShowMsgApproved,
            setShowMsgWaitApproved,
          })
        }
      />

      <ProductConfirmDialog
        open={restoreDialogOpen}
        cancelButtonText={t('invitaliaModal.waitApproved.buttonTextCancel')}
        confirmButtonText={`${t('invitaliaModal.waitApproved.buttonTextConfirm')} (${
          selected.length
        })`}
        title={t('invitaliaModal.waitApproved.listTitle')}
        message={t('invitaliaModal.waitApproved.description', { L2: USERS_NAMES.INVITALIA_L2 })}
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={async () => {
          const currentStatus =
            (tableData.find((row) => row.gtinCode === selected[0])
              ?.status as unknown as ProductStatusEnum) || ProductStatusEnum.SUPERVISED;
          try {
            if (isInvitaliaUser && currentStatus === ProductStatusEnum.UPLOADED) {
              setShowMsgWaitApproved(true);
              setShowMsgApproved(false);
              setShowMsgRejected(false);
            } else {
              setShowMsgApproved(true);
              setShowMsgWaitApproved(false);
              setShowMsgRejected(false);
            }
            await handleConfirmRestore(selected, currentStatus, EMPTY_DATA);
            updaDataTable();
            setRestoreDialogOpen(false);
          } catch (error) {
            if (DEBUG_CONSOLE) {
              console.error('Error during restore:', error);
            }
          }
        }}
        onSuccess={() => setShowMsgApproved(true)}
      />

      <DetailDrawer
        data-testid="detail-drawer"
        open={drawerOpened}
        toggleDrawer={handleToggleDrawer}
      >
        <ProductDetail
          data-testid="product-detail"
          data={drawerData}
          isInvitaliaUser={isInvitaliaUser}
          isInvitaliaAdmin={isInvitaliaAdmin}
          open={true}
          onUpdateTable={updaDataTable}
          onClose={() => handleToggleDrawer(false)}
          onShowApprovedMsg={() => {
            setShowMsgApproved(true);
            setShowMsgWaitApproved(false);
            setShowMsgRejected(false);
          }}
          onShowRejectedMsg={() => {
            setShowMsgRejected(true);
            setShowMsgApproved(false);
            setShowMsgWaitApproved(false);
          }}
          onShowWaitApprovedMsg={() => {
            setShowMsgWaitApproved(true);
            setShowMsgApproved(false);
            setShowMsgRejected(false);
          }}
        />
      </DetailDrawer>

      <FiltersDrawer
        open={filtersDrawerOpened}
        toggleFiltersDrawer={handleToggleFiltersDrawer}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        producerFilter={producerFilter}
        setProducerFilter={setProducerFilter}
        batchFilter={batchFilter}
        setBatchFilter={setBatchFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        batchFilterItems={batchFilterItems}
        eprelCodeFilter={eprelCodeFilter}
        setEprelCodeFilter={setEprelCodeFilter}
        gtinCodeFilter={gtinCodeFilter}
        setGtinCodeFilter={setGtinCodeFilter}
        errorStatus={apiErrorOccurred}
        handleDeleteFiltersButtonClick={handleDeleteFiltersButtonClick}
        setFiltering={setFiltering}
        setPage={setPage}
      />
      {renderResultMessages()}
    </>
  );
};

export default ProductDataGrid;
