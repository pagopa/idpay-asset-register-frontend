import React, { useState } from 'react';
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
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { visuallyHidden } from '@mui/utils';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import EmptyList from '../components/EmptyList';
import ProductsDrawer from './productdrawer';
import { Data, EnhancedTableProps, HeadCell, getComparator, Order, DataProp } from './helpers';
import mockdata from './mockCsvProducts.json';

const sanitizedData = (arr: Array<DataProp>) =>
  arr.map((item) => ({
    ...item,
    category: item.category || '-',
    energyClass: item.energyClass || '-',
    eprelCode: item.eprelCode || '-',
    gtinCode: item.gtinCode || '-',
    branchName: item.branchName || '-',
  }));

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const { t } = useTranslation();

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'category',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.products.listHeader.category')}`,
    },
    {
      id: 'energyClass',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.products.listHeader.energeticClass')}`,
    },
    {
      id: 'eprelCode',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.products.listHeader.eprelCode')}`,
    },
    {
      id: 'gtinCode',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.products.listHeader.gtinCode')}`,
    },
    {
      id: 'branchName',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.products.listHeader.branch')}`,
    },
  ];

  return (
    <TableHead sx={{ backgroundColor: grey.A100 }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={false}
              disabled={false}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
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

const Prodotti = () => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('category');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [eprelCodeFilter, setEprelCodeFilter] = useState<string>('');
  const [gtinCodeFilter, setGtinCodeFilter] = useState<string>('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('');
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const [drawerData, setDrawerData] = useState<DataProp>({});
  const [mockedData, setMockedData] = useState<Array<any>>(sanitizedData(mockdata));

  const { t } = useTranslation();

  const categories = [
    ...new Set(mockedData.map((item) => t(`pages.products.categories.${item.category}`)).sort()),
  ];
  const branches = [...new Set(mockedData.map((item) => item.branchName).sort())];

  const handleFilterButtonClick = () => {
    setMockedData(
      mockedData
        .filter(
          (item) =>
            !categoryFilter || t(`pages.products.categories.${item.category}`) === categoryFilter
        )
        .filter((item) => !branchFilter || item.branchName === branchFilter)
        .filter((item) => !eprelCodeFilter || item.eprelCode?.includes(eprelCodeFilter))
        .filter((item) => !gtinCodeFilter || item.gtinCode?.includes(gtinCodeFilter))
        .filter(
          (item) => !manufacturerFilter || item.codice_produttore?.includes(manufacturerFilter)
        )
    );
  };

  const handleToggleDrawer = (newOpen: boolean) => {
    setDrawerOpened(newOpen);
  };

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log(event);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const handleManufacturerFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManufacturerFilter(event.target.value);
  };

  const handleDeleteFiltersButtonClick = () => {
    setCategoryFilter('');
    setBranchFilter('');
    setEprelCodeFilter('');
    setGtinCodeFilter('');
    setManufacturerFilter('');
    setMockedData(sanitizedData(mockdata));
  };

  const handleListButtonClick = (row: any) => {
    setDrawerData(row);
    setDrawerOpened(true);
  };

  const noFilterSetted = (): boolean =>
    categoryFilter === '' &&
    branchFilter === '' &&
    eprelCodeFilter === '' &&
    gtinCodeFilter === '' &&
    manufacturerFilter === '';

  const visibleRows = [...mockedData]
    .sort(getComparator(order, orderBy))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const selectMenuProps = {
    PaperProps: {
      style: {
        maxHeight: 250,
      },
    },
  };

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.products.title')}
        subTitle={t('pages.products.subtitle')}
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={5}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title"
      />

      {mockedData.length > 0 && (
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
              {branches.map((branch) => (
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
          <TextField
            sx={{ minWidth: 175 }}
            size="small"
            id="manufacturer-code-text"
            label={t('pages.products.filterLabels.manufacturerCode')}
            variant="outlined"
            value={manufacturerFilter}
            onChange={handleManufacturerFilterChange}
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
          {mockedData.length > 0 ? (
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody sx={{ backgroundColor: 'white' }}>
                {visibleRows.map((row) => (
                  <TableRow tabIndex={-1} key={row.id} sx={{}}>
                    <TableCell>{t(`pages.products.categories.${row.category}`)}</TableCell>
                    <TableCell>{row.energyClass}</TableCell>
                    <TableCell>
                      <Link href="#">{row.eprelCode}</Link>
                    </TableCell>
                    <TableCell>{row.gtinCode}</TableCell>
                    <TableCell>{row.branchName}</TableCell>
                    <TableCell>
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
              </Box>
            </Box>
          )}
        </TableContainer>
        {mockedData.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10]}
            colSpan={3}
            count={mockedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            component="div"
            labelDisplayedRows={(page) =>
              `${page.from} - ${page.to} ${t('pages.products.tablePaginationFrom')} ${page.count}`
            }
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
      <ProductsDrawer open={drawerOpened} toggleDrawer={handleToggleDrawer} data={drawerData} />
    </Box>
  );
};
export default Prodotti;
