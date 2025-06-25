import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  Autocomplete,
  Button,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TablePagination,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { visuallyHidden } from '@mui/utils';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import EmptyList from '../components/EmptyList';
import ProductsDrawer from './productdrawer';
import {
  Data,
  EnhancedTableProps,
  HeadCell,
  getComparator,
  Order,
  Value,
  DataProp,
} from './helpers';
import mockdata from './mockdata.json';

const mockedData: Array<any> = [...mockdata];

const categories = [...new Set(mockedData.map((item) => item.categoria))];
const batches = [...new Set(mockedData.map((item) => item.lotto))];

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  const { t } = useTranslation();

  // push di test

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'categoria',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.prodotti.listHeader.category')}`,
    },
    {
      id: 'classe_energetica',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.prodotti.listHeader.energeticClass')}`,
    },
    {
      id: 'codice_eprel',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.prodotti.listHeader.eprelCode')}`,
    },
    {
      id: 'codice_gtinean',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.prodotti.listHeader.gtinCode')}`,
    },
    {
      id: 'lotto',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.prodotti.listHeader.branch')}`,
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
              // hideSortIcon={headCell.id === 'spendingPeriod'}
              hideSortIcon={false}
              // disabled={headCell.id === 'spendingPeriod'}
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
  const [orderBy, setOrderBy] = useState<keyof Data>('categoria');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [eprelCodeFilter, setEprelCodeFilter] = useState<string>('');
  const [gtinCodeFilter, setGtinCodeFilter] = useState<string>('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('');
  const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
  const [drawerData, setDrawerData] = useState<DataProp>({});

  const { t } = useTranslation();

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

  const handleCategoryFilterChange = (
    event: React.SyntheticEvent,
    value: Value | null,
    reason: string
  ) => {
    console.log(event, reason);
    setCategoryFilter(value);
  };

  const handleCategoryBranchChange = (
    event: React.SyntheticEvent,
    value: Value | null,
    reason: string
  ) => {
    console.log(event, reason);
    setBranchFilter(value);
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
    setCategoryFilter(null);
    setBranchFilter(null);
    setEprelCodeFilter('');
    setGtinCodeFilter('');
    setManufacturerFilter('');
  };

  const handleListButtonClick = (row: any) => {
    console.log(row);
    setDrawerData(row);
    setDrawerOpened(true);
  };

  const noFilterSetted = (): boolean =>
    categoryFilter === null &&
    branchFilter === null &&
    eprelCodeFilter === '' &&
    gtinCodeFilter === '' &&
    manufacturerFilter === '';

  const visibleRows = useMemo(
    () =>
      [...mockedData]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage]
  );

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.prodotti.title')}
        subTitle={t('pages.prodotti.subtitle')}
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={5}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title"
      />

      {mockedData.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
          <Autocomplete
            disablePortal
            options={categories}
            sx={{ height: 100, width: 200, mr: 1 }}
            renderInput={(params) => (
              <TextField {...params} label={t('pages.prodotti.filterLabels.category')} />
            )}
            popupIcon={<ArrowDropDownIcon />}
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          />
          <Autocomplete
            disablePortal
            options={batches}
            sx={{ width: 300, mr: 1 }}
            renderInput={(params) => (
              <TextField {...params} label={t('pages.prodotti.filterLabels.branch')} />
            )}
            value={branchFilter}
            onChange={handleCategoryBranchChange}
          />
          <TextField
            sx={{ mr: 1 }}
            id="eprel-code-text"
            label={t('pages.prodotti.filterLabels.eprelCode')}
            variant="outlined"
            value={eprelCodeFilter}
            onChange={handleEprelCodeFilterChange}
          />
          <TextField
            sx={{ mr: 1 }}
            id="gtin-code-text"
            label={t('pages.prodotti.filterLabels.gtinCode')}
            variant="outlined"
            value={gtinCodeFilter}
            onChange={handleGtinCodeFilterChange}
          />
          <TextField
            sx={{ mr: 1 }}
            id="manufacturer-code-text"
            label={t('pages.prodotti.filterLabels.manufacturerCode')}
            variant="outlined"
            value={manufacturerFilter}
            onChange={handleManufacturerFilterChange}
          />
          <Button disabled={noFilterSetted()} variant="outlined" sx={{ height: 60 }}>
            {t('pages.prodotti.filterLabels.filter')}
          </Button>
          <Button
            disabled={noFilterSetted()}
            variant={noFilterSetted() ? 'text' : 'outlined'}
            sx={{ height: 60, width: 200, ml: '6px' }}
            onClick={handleDeleteFiltersButtonClick}
          >
            {t('pages.prodotti.filterLabels.deleteFilters')}
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
                    <TableCell>{row.categoria}</TableCell>
                    <TableCell>{row.classe_energetica}</TableCell>
                    <TableCell>{row.codice_eprel}</TableCell>
                    <TableCell>{row.codice_gtinean}</TableCell>
                    <TableCell>{row.lotto}</TableCell>
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
                <EmptyList message={t('pages.prodotti.emptyList')} />
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
            slotProps={{
              select: {
                inputProps: {
                  'aria-label': 'rows per page',
                },
                native: true,
              },
            }}
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
