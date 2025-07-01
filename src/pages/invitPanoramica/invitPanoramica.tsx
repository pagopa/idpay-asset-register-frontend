import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  Link,
  TextField,
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
import SearchIcon from '@mui/icons-material/Search';
import { visuallyHidden } from '@mui/utils';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import EmptyList from '../components/EmptyList';
import { EnhancedTableProps, Data, HeadCell, Order, getComparator } from './helpers';
import mockdata from './mockdata.json';

// const sanitizedData = (arr: Array<DataProp>) =>
//   arr.map((item) => ({
//     ...item,
//     categoria: item.categoria || '-',
//     classe_energetica: item.classe_energetica || '-',
//     codice_eprel: item.codice_eprel || '-',
//     codice_gtinean: item.codice_gtinean || '-',
//     lotto: item.lotto || '-',
//   }));

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const { t } = useTranslation();

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'manufacturerName',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.invitView.listHeaders.manufacturerName')}`,
    },
    {
      id: 'dateCreation',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.invitView.listHeaders.dateCreation')}`,
    },
    {
      id: 'lastUpdate',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.invitView.listHeaders.lastUpdate')}`,
    },
    {
      id: 'temporaryField',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.invitView.listHeaders.temporaryField')}`,
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

const InvitPanoramica = () => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('manufacturerName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchKey, setSearchKey] = useState('');
  const [mockedData, setMockedData] = useState(mockdata);

  const { t } = useTranslation();

  const handleTextFilterKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      const filteredData =
        searchKey !== ''
          ? mockedData.filter((item) =>
              item.manufacturerName.toLowerCase().includes(searchKey.toLowerCase())
            )
          : mockdata;
      setMockedData(filteredData);
    }
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

  const handleListButtonClick = (row: any) => {
    alert(`
ID: ${row.id}
MANUFACTURER: ${row.manufacturerName}
CREATED: ${row.dateCreation}
UPDATED: ${row.lastUpdate}
UNKNOWN: ${row.temporaryField}`);
  };

  const handleBackToTableButtonClick = () => {
    setMockedData(mockdata);
  };

  const visibleRows = [...mockedData]
    .sort(getComparator(order, orderBy))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleTextFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const key = event.target.value as string;
    setSearchKey(key);
  };

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.invitView.title')}
        subTitle={t('pages.invitView.subTitle')}
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
            <TextField
              fullWidth
              size="small"
              id="search-text"
              label={t('pages.invitView.searchPlaceholder')}
              variant="outlined"
              value={searchKey}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="description for action"
                        sx={{
                          backgroundColor: '#f5f5f5',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                          cursor: 'text',
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              onChange={handleTextFilterChange}
              onKeyUp={handleTextFilterKeyUp}
            />
          </FormControl>
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
            <Table size="small" sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody sx={{ backgroundColor: 'white' }}>
                {visibleRows.map((row) => (
                  <TableRow tabIndex={-1} key={row.id} sx={{}}>
                    <TableCell>
                      <Link underline="hover" href="#">
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'blue' }}>
                          {row.manufacturerName}
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.dateCreation}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.lastUpdate}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.temporaryField}</Typography>
                    </TableCell>
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
                <EmptyList message={t('pages.invitView.emptyList')} />
                <Button variant="text" onClick={handleBackToTableButtonClick}>
                  {t('pages.invitView.backToTable')}
                </Button>
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
    </Box>
  );
};
export default InvitPanoramica;
