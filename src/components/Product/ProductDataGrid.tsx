import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, TablePagination, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, getBatchFilterList } from '../../services/registerService';
import { PAGINATION_ROWS_PRODUCTS, EMPTY_DATA } from '../../utils/constants';
import {
  batchIdSelector,
  batchNameSelector,
  setBatchId,
  setBatchName,
} from '../../redux/slices/productsSlice';
import EmptyListTable from '../../pages/components/EmptyListTable';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { INVITALIA } from '../../utils/constants';
import { fetchUserFromLocalStorage } from '../../helpers';
import ProductsTable from '../../pages/components/ProductsTable';
import { BatchFilterItems, BatchFilterList, Order } from './helpers';
import DetailDrawer from './DetailDrawer';
import ProductDetail from './ProductDetail';
import FilterBar from './FilterBar';
import ProductModal from './ProductModal';

type ProductDataGridProps = {
  organizationId: string;
  children?: React.ReactNode;
};

const buttonStyle = {
  height: 48,
  fontWeight: 600,
  fontSize: 16,
  marginRight: 2,
};

const ProductDataGrid: React.FC<ProductDataGridProps> = ({ organizationId, children }) => {
  const dispatch = useDispatch();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof ProductDTO>('category');
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsQty, setItemsQty] = useState<number | undefined>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
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

  const [selected, setSelected] = useState<Array<string>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<string | undefined>(undefined);

  // Reset selezione checkbox quando i dati della tabella vengono aggiornati (refresh/ripristina)
  useEffect(() => {
    setSelected([]);
  }, [tableData]);

  const batchName = useSelector(batchNameSelector);
  const batchId = useSelector(batchIdSelector);
  const { t } = useTranslation();

  const fetchProductList = () => {
    setLoading(true);
    callProductsApi(organizationId);
  };

  const updaDataTable = () => {
    fetchProductList();
  };

  const handleOpenModal = (action: string) => {
    setModalAction(action);
    setModalOpen(true);
  };

  const callProductsApi = (organizationId: string) => {
    const sortKey = `${orderBy},${order}`;
    void getProducts(
      organizationId,
      page,
      rowsPerPage,
      sortKey,
      categoryFilter ? t(`pages.products.categories.${categoryFilter?.toLowerCase()}`) : '',
      statusFilter ? t(`pages.products.categories.${statusFilter?.toLowerCase()}`) : '',
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
        setLoading(false);
      })
      .catch(() => handleStateForError())
      .finally(() => setFiltering(false));
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
    setLoading(true);
    if (batchId === '') {
      void getProducts(organizationId, page, rowsPerPage)
        .then((res) => {
          const { content, pageNo, totalElements } = res;
          setTableData(content ? Array.from(content) : []);
          setPage(pageNo || 0);
          setItemsQty(totalElements);
          setPaginatorFrom(pageNo !== undefined ? pageNo * rowsPerPage + 1 : paginatorFrom);
          setPaginatorTo(
            totalElements && totalElements > rowsPerPage ? rowsPerPage : totalElements
          );
          setLoading(false);
        })
        .catch(() => {
          setTableData([]);
          setLoading(false);
        });
    }
    void getBatchFilterList(organizationId)
      .then((res) => {
        const { left } = res as BatchFilterList;
        const values = left[0].value;
        setBatchFilterItems([...values]);
      })
      .catch(() => {
        setBatchFilterItems([]);
      });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setLoading(true);
    callProductsApi(organizationId);
    // eslint-disable-next-line
  }, [page, orderBy, order, rowsPerPage]);

  useEffect(() => {
    setLoading(true);
    if (!filtering) {
      setLoading(false);
      return;
    }
    callProductsApi(organizationId);
    // eslint-disable-next-line
  }, [filtering]);

  const handleDeleteFiltersButtonClick = () => {
    setCategoryFilter('');
    setStatusFilter('');
    setBatchFilter('');
    setEprelCodeFilter('');
    setGtinCodeFilter('');
    setApiErrorOccurred(false);
    setFiltering(true);
  };

  const handleToggleDrawer = (newOpen: boolean) => {
    setDrawerOpened(newOpen);
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

  const renderTable = () => {
    const commonProps = {
      tableData,
      emptyData: EMPTY_DATA,
      order,
      orderBy,
      onRequestSort: handleRequestSort,
      handleListButtonClick,
      selected,
      setSelected,
    };

    if (tableData?.length > 0) {
      if (loading) {
        return (
          <CircularProgress
            size={36}
            sx={{
              color: '#0055AA',
              position: 'absolute',
              top: '50%',
              left: '50%',
            }}
          />
        );
      }
      return <ProductsTable {...commonProps} />;
    }

    if (children) {
      return children;
    }
    return null;
  };

  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const isInvitaliaUser = user?.org_role === INVITALIA;

  return (
    <>
      <FilterBar
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setFiltering={setFiltering}
        batchFilter={batchFilter}
        setBatchFilter={setBatchFilter}
        batchFilterItems={batchFilterItems}
        eprelCodeFilter={eprelCodeFilter}
        setEprelCodeFilter={setEprelCodeFilter}
        gtinCodeFilter={gtinCodeFilter}
        setGtinCodeFilter={setGtinCodeFilter}
        errorStatus={apiErrorOccurred}
        tableData={tableData}
        handleDeleteFiltersButtonClick={handleDeleteFiltersButtonClick}
        loading={loading}
      />
      {tableData?.length === 0 && !loading && (
        <EmptyListTable message="pages.products.noFileLoaded" />
      )}
      <Paper sx={{ width: '100%', mb: 2, pb: 3, backgroundColor: grey.A100 }}>
        {renderTable()}
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
        {tableData?.length > 0 && !loading && isInvitaliaUser && (
          <Box mt={2} display="flex" flexDirection="row" justifyContent="flex-start">
            <Button
              color="primary"
              variant="contained"
              sx={{
                ...buttonStyle,
                width: '138px',
              }}
              disabled={selected.length === 0}
              onClick={() => handleOpenModal('supervisioned')}
            >
              Contrassegna
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{
                ...buttonStyle,
                width: '92px',
              }}
              disabled={selected.length === 0}
              onClick={() => handleOpenModal('rejected')}
            >
              Escludi
            </Button>
          </Box>
        )}
      </Paper>
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        gtinCodes={selected}
        actionType={modalAction}
        organizationId={organizationId}
        onUpdateTable={updaDataTable}
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
          open={true}
          onUpdateTable={updaDataTable}
          onClose={() => handleToggleDrawer(false)}
        />
      </DetailDrawer>
    </>
  );
};

export default ProductDataGrid;
