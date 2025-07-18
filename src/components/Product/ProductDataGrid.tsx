import React, { useState, useEffect } from 'react';
import {
  Paper,
  Button,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Typography,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import { useDispatch, useSelector } from 'react-redux';
import { RegisterApi } from '../../api/registerApiClient';
import { UploadsErrorDTO } from '../../api/generated/register/UploadsErrorDTO';
import { ProductListDTO } from '../../api/generated/register/ProductListDTO';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { BatchList } from '../../api/generated/register/BatchList';
import { displayRows, emptyData } from '../../utils/constants';
import {
  batchIdSelector,
  batchNameSelector,
  setBatchId,
  setBatchName,
} from '../../redux/slices/productsSlice';
import { Order, BatchFilterItems, BatchFilterList } from './helpers';
import DetailDrawer from './DetailDrawer';
import ProductDetail from './ProductDetail';
import MessagePage from './MessagePage';
import EprelLinks from './EprelLinks';
import FilterBar from './FilterBar';
import EnhancedTableHead from './EnhancedTableHead';

const getProductList = async (
  xOrganizationSelected: string,
  page?: number,
  size?: number,
  sort?: string,
  category?: string,
  eprelCode?: string,
  gtinCode?: string,
  productCode?: string,
  productFileId?: string
): Promise<ProductListDTO> => {
  try {
    return await RegisterApi.getProducts(
      xOrganizationSelected,
      page,
      size,
      sort,
      category,
      eprelCode,
      gtinCode,
      productCode,
      productFileId
    );
  } catch (error: any) {
    if (error?.response && error?.response?.data) {
      const apiError: UploadsErrorDTO = error.response.data;
      throw apiError;
    }
    throw error;
  }
};

const getBatchFilterList = async (xOrganizationSelected: string): Promise<BatchList> => {
  try {
    return await RegisterApi.getBatchFilterItems(xOrganizationSelected);
  } catch (error: any) {
    if (error?.response && error?.response?.data) {
      const apiError: UploadsErrorDTO = error.response.data;
      throw apiError;
    }
    throw error;
  }
};

type ProductGridProps = {
  organizationId: string;
};

const ProductGrid: React.FC<ProductGridProps> = ({ organizationId }) => {
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
  const [filtering, setFiltering] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Array<ProductDTO>>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(displayRows);
  const [paginatorFrom, setPaginatorFrom] = useState<number | undefined>(1);
  const [paginatorTo, setPaginatorTo] = useState<number | undefined>(0);
  const [batchFilterItems, setBatchFilterItems] = useState<Array<BatchFilterItems>>([]);
  const [apiErrorOccurred, setApiErrorOccurred] = useState<boolean>(false);
  const batchName = useSelector(batchNameSelector);
  const batchId = useSelector(batchIdSelector);

  const sortKey = orderBy && `${orderBy},${order}`;
  console.log('<1>', { order, orderBy, sortKey, batchFilterItems });

  const { t } = useTranslation();

  const callProductsApi = (organizationId: string) => {
    const sortKey = `${orderBy},${order}`;

    void getProductList(
      organizationId,
      page,
      displayRows,
      sortKey,
      categoryFilter ? t(`pages.products.categories.${categoryFilter?.toLowerCase()}`) : '',
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
          setPaginatorFrom(pageNo * displayRows + 1);
          setPaginatorTo(
            displayRows * (pageNo + 1) < totalElements ? displayRows * (pageNo + 1) : totalElements
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
      void getProductList(organizationId, page, displayRows)
        .then((res) => {
          const { content, pageNo, totalElements } = res;
          setTableData(content ? Array.from(content) : []);
          setPage(pageNo || 0);
          setItemsQty(totalElements);
          setPaginatorFrom(pageNo !== undefined ? pageNo * displayRows + 1 : paginatorFrom);
          setPaginatorTo(
            totalElements && totalElements > displayRows ? displayRows : totalElements
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
        console.log('§>>', { values });

        setBatchFilterItems([...values]);
      })
      .catch(() => {
        setBatchFilterItems([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    callProductsApi(organizationId);
  }, [page, orderBy, order]);

  useEffect(() => {
    setLoading(true);
    if (!filtering) {
      setLoading(false);
      return;
    }
    callProductsApi(organizationId);
  }, [filtering]);

  const handleDeleteFiltersButtonClick = () => {
    setCategoryFilter('');
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
    setRowsPerPage(parseInt(event.target.value, displayRows));
    setPage(0);
  };

  const handleListButtonClick = (row: any) => {
    setDrawerData(row);
    setDrawerOpened(true);
  };

  const visibleRows = tableData;

  return (
    <>
      {tableData?.length > 0 && (
        <FilterBar
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
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
        />
      )}
      {tableData?.length === 0 && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            height: '70%',
            gap: '24px',
            borderRadius: '4px',
            pt: '24px',
            pr: '24px',
            pl: '24px',
            cursor: 'pointer',
          }}
          data-testid="uploads-table"
        >
          <Table>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  {t('pages.products.noFileLoaded')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Paper
        sx={{
          width: '100%',
          mb: 2,
          pb: 3,
          backgroundColor: grey.A100,
        }}
      >
        {!loading ? (
          <TableContainer>
            <Table sx={{ minWidth: 750 }} size="small" aria-labelledby="tableTitle">
              {tableData.length > 0 && (
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
              )}
              <TableBody sx={{ backgroundColor: 'white' }}>
                {visibleRows.map((row, index) => (
                  <TableRow tabIndex={-1} key={index} sx={{ height: '25px' }}>
                    <TableCell sx={{ textAlign: 'left' }}>
                      <Typography variant="body2">
                        {row?.category
                          ? t(`commons.categories.${row?.category?.toLowerCase()}`)
                          : emptyData}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Typography variant="body2">
                        {row?.energyClass ? row?.energyClass : emptyData}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <EprelLinks row={row} />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Typography variant="body2">
                        {row?.gtinCode ? row?.gtinCode : emptyData}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row?.batchName ? row?.batchName : emptyData}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Button variant="text" onClick={() => handleListButtonClick(row)}>
                        <ArrowForwardIosIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <MessagePage message={t(`pages.products.loading`)} />
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
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              },
            }}
          />
        )}
      </Paper>

      <DetailDrawer
        data-testid="detail-drawer"
        open={drawerOpened}
        toggleDrawer={handleToggleDrawer}
      >
        <ProductDetail data-testid="product-detail" data={drawerData} />
      </DetailDrawer>
    </>
  );
};
export default ProductGrid;
