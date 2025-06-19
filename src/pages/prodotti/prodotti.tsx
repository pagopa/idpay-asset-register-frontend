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
import { visuallyHidden } from '@mui/utils';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import EmptyList from '../components/EmptyList';
import { Data, EnhancedTableProps, HeadCell, getComparator, Order } from './helpers';
import mockdata from './mockdata.json';

const categories = [...new Set(mockdata.map((item) => item.categoria))];
const batches = [...new Set(mockdata.map((item) => item.lotto))];

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  const { t } = useTranslation();

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
  const { t } = useTranslation();

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

  const handleListButtonClick = (row: any) => {
    const msg = `id: ${row.id}
categoria: ${row.categoria}
classe energetica: ${row.classe_energetica}
codice eprel: ${row.codice_eprel}
codice gtin: ${row.codice_gtinean}
lotto: ${row.lotto}
    `;
    alert(msg);
  };

  const visibleRows = useMemo(
    () =>
      [...mockdata]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage]
  );

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.prodotti.title')}
        subTitle={'Visualizza tutti i prodotti caricati e i dettagli'}
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={5}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title"
      />

      <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
        <Autocomplete
          disablePortal
          options={categories}
          sx={{ height: 100, width: 200, mr: 1 }}
          renderInput={(params) => <TextField {...params} label="Categoria" />}
        />
        <Autocomplete
          disablePortal
          options={batches}
          sx={{ width: 300, mr: 1 }}
          renderInput={(params) => <TextField {...params} label="Lotto" />}
        />
        <TextField sx={{ mr: 1 }} id="eprel-code-text" label="Codice EPREL" variant="outlined" />
        <TextField sx={{ mr: 1 }} id="gtin-code-text" label="Codice GTIN" variant="outlined" />
        <TextField
          sx={{ mr: 1 }}
          id="manufacturer-code-text"
          label="Codice Produttore"
          variant="outlined"
        />
        <Button disabled variant="outlined" sx={{ height: 60 }}>
          Filtra
        </Button>
        <Button disabled variant="text" sx={{ height: 60, width: 200 }}>
          Rimuovi filtri
        </Button>
      </Box>

      <Paper
        sx={{
          width: '100%',
          mb: 2,
          pb: 3,
          backgroundColor: grey.A100,
        }}
      >
        <TableContainer>
          {mockdata.length > 0 ? (
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
                <EmptyList message={t('pages.initiativesList.emptyList')} />
              </Box>
            </Box>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10]}
          colSpan={3}
          count={mockdata.length}
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
      </Paper>
    </Box>
  );
};
export default Prodotti;
