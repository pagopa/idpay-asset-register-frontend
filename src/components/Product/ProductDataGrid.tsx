import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  InputLabel,
  FormControl,
  Link,
  MenuItem,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import { RegisterApi } from '../../api/registerApiClient';
import { UploadsErrorDTO } from '../../api/generated/register/UploadsErrorDTO';
import { ProductListDTO } from '../../api/generated/register/ProductListDTO';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { displayRows, emptyData } from '../../utils/constants';
import EmptyList from '../../pages/components/EmptyList';
import { EnhancedTableProps, getComparator, Order } from './helpers';
import DetailDrawer from './DetailDrawer';
import ProductDetail from './ProductDetail';


interface HeadCell {
  disablePadding: boolean;
  id: keyof ProductDTO;
  label: string;
  numeric: boolean;
  textAlign?: any;
}


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
      label: `${t('pages.products.listHeader.branch')}`,
    },
  ];

  return (
    <TableHead sx={{ backgroundColor: grey?.A100 }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell?.id}
            align={headCell?.textAlign? headCell?.textAlign : 'left' }
            padding="normal"
            sortDirection={orderBy === headCell?.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell?.id}
              direction={orderBy === headCell?.id ? order : 'asc'}
              onClick={createSortHandler(headCell?.id)}
              hideSortIcon={false}
              disabled={false}
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
  const [itemsQty, setItemsQty] = useState<number | undefined>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [eprelCodeFilter, setEprelCodeFilter] = useState<string>('');
  const [gtinCodeFilter, setGtinCodeFilter] = useState<string>('');
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const [drawerData, setDrawerData] = useState<ProductDTO>({});
  const [filtering, setFiltering] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Array<ProductDTO>>([]);

  const { t } = useTranslation();
  const paginatorFrom = (page <= 0 ? page : page - 1) * displayRows + 1;
  const paginatorTo = (page <= 0 ? page : page - 1) * displayRows + displayRows;

  useEffect(() => {
    void getProductList(
      page,
      displayRows,
      'asc',
      categoryFilter ? t(`pages.products.categories.${categoryFilter.toLowerCase()}`) : '',
      eprelCodeFilter,
      gtinCodeFilter
    )
      .then((res) => {
        const { content, pageNo, totalElements } = res;
        setTableData(content ? Array.from(content) : []);
        setPage(pageNo || 0);
        setItemsQty(totalElements);
      })
      .finally(() => setFiltering(false));
  }, [page, filtering]);

  const categories = [
    ...new Set(
      tableData.map((item) => t(`commons.categories.${item.category?.toLowerCase()}`)).sort()
    ),
  ];
  const branches = [
    ...new Set(
      tableData
        .map((item) => item.batchName)
        .filter((name) => name !== '-')
        .sort()
    ),
  ];

  const handleFilterButtonClick = () => {
    setFiltering(true);
  };

  const handleDeleteFiltersButtonClick = () => {
    setCategoryFilter('');
    setBranchFilter('');
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

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log(event);
    if (newPage > 0) {
      setPage(newPage);
    }
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value as string);
  };

  const handleCategoryBranchChange = (event: SelectChangeEvent) => {
    setBranchFilter(event.target.value as string);
  };

  const handleEprelCodeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEprelCodeFilter(event.target.value);
  };

  const handleGtinCodeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGtinCodeFilter(event.target.value);
  };

  const handleListButtonClick = (row: any) => {
    setDrawerData(row);
    setDrawerOpened(true);
  };

  const noFilterSetted = (): boolean =>
    categoryFilter === '' && branchFilter === '' && eprelCodeFilter === '' && gtinCodeFilter === '';

  const visibleRows = [...tableData].sort(getComparator(order, orderBy));

  const selectMenuProps = {
    PaperProps: {
      style: {
        maxHeight: 250,
      },
    },
  };

  return (
    <>
      {tableData.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            mb: 5,
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="category-filter-select-label">
              {t('pages.products.filterLabels.category')}
            </InputLabel>
            <Select
              labelId="category-filter-select-label"
              id="category-filter-select"
              value={categoryFilter}
              label={t('pages.products.filterLabels.category')}
              MenuProps={selectMenuProps}
              onChange={handleCategoryFilterChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="branch-filter-select-label">
              {t('pages.products.filterLabels.branch')}
            </InputLabel>
            <Select
              labelId="branch-filter-select-label"
              id="branch-filter-select"
              value={branchFilter}
              label={t('pages.products.filterLabels.branch')}
              MenuProps={selectMenuProps}
              onChange={handleCategoryBranchChange}
            >
              {branches?.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            sx={{ minWidth: 175 }}
            size="small"
            id="eprel-code-text"
            label={t('pages.products.filterLabels.eprelCode')}
            variant="outlined"
            value={eprelCodeFilter}
            onChange={handleEprelCodeFilterChange}
          />

          <TextField
            sx={{ minWidth: 175 }}
            size="small"
            id="gtin-code-text"
            label={t('pages.products.filterLabels.gtinCode')}
            variant="outlined"
            value={gtinCodeFilter}
            onChange={handleGtinCodeFilterChange}
          />
          <Button
            disabled={noFilterSetted()}
            variant="outlined"
            sx={{ height: 44, minWidth: 100 }}
            onClick={handleFilterButtonClick}
          >
            {t('pages.products.filterLabels.filter')}
          </Button>
          <Button
            disabled={noFilterSetted()}
            variant="text"
            sx={{ height: 44, minWidth: 140 }}
            onClick={handleDeleteFiltersButtonClick}
          >
            {t('pages.products.filterLabels.deleteFilters')}
          </Button>
        </Box>
      )}

      <Paper
        sx={{
          width: '100%',
          mb: 2,
          pb: 3,
          backgroundColor: grey.A100,
        }}
      >
        <TableContainer>
          {tableData.length > 0 ? (
            <Table sx={{ minWidth: 750 }} size="small" aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody sx={{ backgroundColor: 'white' }}>
                {visibleRows.map((row, index) => (
                  <TableRow tabIndex={-1} key={index} sx={{ height: '25px' }}>
                    <TableCell  sx={{ textAlign: 'left' }}>
                      <Typography variant="body2">
                        {row?.category
                          ? t(`commons.categories.${row?.category?.toLowerCase()}`)
                          : emptyData
                          }
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Typography variant="body2">
                        {row?.energyClass ? row?.energyClass : emptyData}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{textAlign: 'center' }}>
                      <Link underline="hover" href="#">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0062C3' }}>
                          {row?.eprelCode ? row?.eprelCode : emptyData}
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Typography variant="body2">{row?.gtinCode ? row?.gtinCode : emptyData}</Typography>
                    </TableCell>
                    <TableCell >
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
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                justifyContent: 'center',
                width: '100%',
                backgroundColor: 'white',
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: 'inline',
                  gridColumn: 'span 12',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <EmptyList message={t('pages.products.emptyList')} />
                <Button variant="text" onClick={handleDeleteFiltersButtonClick}>
                  {t('pages.products.backToTable')}
                </Button>
              </Box>
            </Box>
          )}
        </TableContainer>
        {tableData?.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10]}
            colSpan={3}
            count={itemsQty || 1}
            rowsPerPage={displayRows}
            page={page}
            component="div"
            labelDisplayedRows={() =>
              `${paginatorFrom} - ${paginatorTo} ${t(
                'pages.products.tablePaginationFrom'
              )} ${itemsQty}`
            }
            onPageChange={handleChangePage}
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
      
      <DetailDrawer open={drawerOpened} toggleDrawer={handleToggleDrawer} >
          <ProductDetail data={drawerData}/>
      </DetailDrawer>
 </>
  );
};
export default ProductGrid;

