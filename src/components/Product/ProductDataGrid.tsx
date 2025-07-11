import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TablePagination,
  Typography,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import { RegisterApi } from '../../api/registerApiClient';
import { UploadsErrorDTO } from '../../api/generated/register/UploadsErrorDTO';
import { ProductListDTO } from '../../api/generated/register/ProductListDTO';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { BatchList } from '../../api/generated/register/BatchList';
import { displayRows, emptyData } from '../../utils/constants';
import {
  getComparator,
  Order,
  EnhancedTableProps,
  HeadCell,
  BatchFilterItems,
  BatchFilterList,
} from './helpers';
import DetailDrawer from './DetailDrawer';
import ProductDetail from './ProductDetail';
import MessagePage from './MessagePage';
import EprelLinks from './EprelLinks';
import FilterBar from './FilterBar';

const getProductList = async (
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

const getBatchFilterList = async (): Promise<BatchList> => {
  try {
    return await RegisterApi.getBatchFilterItems();
  } catch (error: any) {
    if (error?.response && error?.response?.data) {
      const apiError: UploadsErrorDTO = error.response.data;
      throw apiError;
    }
    throw error;
  }
};

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof ProductDTO) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const { t } = useTranslation();

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'category',
      numeric: false,
      disablePadding: false,
      textAlign: 'center',
      label: `${t('pages.products.listHeader.category')}`,
    },
    {
      id: 'energyClass',
      numeric: false,
      disablePadding: false,
      textAlign: 'center',
      label: `${t('pages.products.listHeader.energeticClass')}`,
    },
    {
      id: 'eprelCode',
      numeric: false,
      disablePadding: false,
      textAlign: 'center',
      label: `${t('pages.products.listHeader.eprelCode')}`,
    },
    {
      id: 'gtinCode',
      numeric: false,
      disablePadding: false,
      textAlign: 'center',
      label: `${t('pages.products.listHeader.gtinCode')}`,
    },
    {
      id: 'batchName',
      numeric: false,
      disablePadding: false,
      textAlign: 'centlefter',
      label: `${t('pages.products.listHeader.batch')}`,
    },
  ];

  return (
    <TableHead sx={{ backgroundColor: grey?.A100 }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell?.id}
            align={headCell?.textAlign ? headCell?.textAlign : 'left'}
            padding="normal"
            sortDirection={orderBy === headCell?.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell?.id}
              direction={orderBy === headCell?.id ? order : 'asc'}
              onClick={createSortHandler(headCell?.id)}
              hideSortIcon={true}
              disabled={headCell.id === 'energyClass' || headCell.id === 'eprelCode'}
            >
              {headCell?.label}
              {orderBy === headCell?.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const ProductGrid = () => {
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

  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    void getProductList(page, displayRows)
      .then((res) => {
        const { content, pageNo, totalElements } = res;
        setTableData(content ? Array.from(content) : []);
        setPage(pageNo || 0);
        setItemsQty(totalElements);
        setPaginatorFrom(pageNo !== undefined ? pageNo * displayRows + 1 : paginatorFrom);
        setPaginatorTo(totalElements && totalElements > displayRows ? displayRows : totalElements);
        setLoading(false);
      })
      .catch(() => {
        setTableData([]);
        setLoading(false);
      });

    void getBatchFilterList()
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
    void getProductList(
      page,
      displayRows,
      'asc',
      categoryFilter ? t(`pages.products.categories.${categoryFilter.toLowerCase()}`) : '',
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
        setLoading(false);
      })
      .catch(() => {
        setTableData([]);
        setLoading(false);
      })
      .finally(() => setFiltering(false));
  }, [page, filtering]);

  const handleDeleteFiltersButtonClick = () => {
    setCategoryFilter('');
    setBatchFilter('');
    setEprelCodeFilter('');
    setGtinCodeFilter('');
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

  const visibleRows = [...tableData].sort(getComparator(order, orderBy));

  return (
    <>
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
        tableData={tableData}
        handleDeleteFiltersButtonClick={handleDeleteFiltersButtonClick}
      />

      <Paper
        sx={{
          width: '100%',
          mb: 2,
          pb: 3,
          backgroundColor: grey.A100,
        }}
      >
        <TableContainer>
          {tableData.length > 0 && !loading ? (
            <Table sx={{ minWidth: 750 }} size="small" aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
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
          ) : tableData.length <= 0 && !loading ? (
            <MessagePage
              message={t('pages.products.emptyList')}
              goBack
              onGoBack={handleDeleteFiltersButtonClick}
            />
          ) : (
            <MessagePage message={t(`pages.products.loading`)} />
          )}
        </TableContainer>
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

      <DetailDrawer open={drawerOpened} toggleDrawer={handleToggleDrawer}>
        <ProductDetail data={drawerData} />
      </DetailDrawer>
    </>
  );
};
export default ProductGrid;
