import {
  Box,
  Chip,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { grey } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import EmptyListTable from '../components/EmptyListTable';

type StatusEnum = InitiativeDTO['status'];
const PUBLISHED: StatusEnum = 'PUBLISHED';
const CLOSED: StatusEnum = 'CLOSED';
import ROUTES from '../../routes';
import { InitiativeDTO } from '../../api/generated/register';
import { Data, EnhancedTableProps, HeadCell, Order, getComparator, stableSort } from './helpers';

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  const { t } = useTranslation();

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'initiativeName',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.initiativeName')}`,
    },
    {
      id: 'organizationName',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.organizationName')}`,
    },
    {
      id: 'spendingPeriod',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.spendingPeriod')}`,
    },
    {
      id: 'serviceId',
      numeric: false,
      disablePadding: true,
      label: `${t('pages.initiativesList.serviceId')}`,
    },
    {
      id: 'status',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.initiativeStatus')}`,
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
              active={orderBy === headCell.id && headCell.id !== 'spendingPeriod'}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={headCell.id === 'spendingPeriod'}
              disabled={headCell.id === 'spendingPeriod'}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={{ ...visuallyHidden }}>
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

const InitiativesList = () => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('initiativeName');
  const [initiativeList, setInitiativeList] = useState<Array<Data>>([]);
  const [initiativeListFiltered, setInitiativeListFiltered] = useState<Array<Data>>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  // TODO: sostituire con il selector corretto quando disponibile nello slice
  // Tipizziamo almeno il ritorno per evitare che TypeScript inferisca `never[]`
  const initiativesListSel = useAppSelector(() => [] as Array<InitiativeDTO>);

  useEffect(() => {
    if (Array.isArray(initiativesListSel)) {
      const mappedInitativeList = initiativesListSel?.map((item, index) => ({
        initiativeId: item.initiativeId || '',
        initiativeName: item.initiativeName || '',
        organizationName: '',
        spendingPeriod: `${
          item.startDate ? new Date(item.startDate).toLocaleDateString('fr-FR') : ''
        } - ${item.endDate ? new Date(item.endDate).toLocaleDateString('fr-FR') : ''}`,
        serviceId: '',
        status: (item.status as StatusEnum) ?? '',
        id: index,
      }));
      setInitiativeList(mappedInitativeList);
      setInitiativeListFiltered(mappedInitativeList);
    }
  }, [initiativesListSel]);

  const handleSearchInitiatives = (s: string) => {
    const search = s.toLocaleLowerCase();
    if (search.length > 0) {
      const listFiltered: Array<Data> = [];
      initiativeList?.forEach((record) => {
        if (record?.initiativeName?.toLowerCase().includes(search)) {
          // eslint-disable-next-line functional/immutable-data
          listFiltered.push(record);
        }
      });
      setInitiativeListFiltered([...listFiltered]);
    } else {
      if (Array.isArray(initiativeList)) {
        setInitiativeListFiltered([...initiativeList]);
      }
    }
  };

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const renderInitiativeStatus = (status?: StatusEnum) => {
    switch (status) {
      case PUBLISHED:
        return (
          <Chip
            sx={{ fontSize: '14px' }}
            label={t('commons.initiativeStatusEnum.published')}
            color="success"
          />
        );
      case CLOSED:
        return (
          <Chip
            sx={{ fontSize: '14px' }}
            label={t('commons.initiativeStatusEnum.closed')}
            color="default"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.initiativesList.title')}
        subTitle={t('pages.initiativesList.subtitle')}
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={5}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          columnGap: 2,
          justifyContent: 'center',
          width: '100%',
          mb: 5,
        }}
      >
        <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
          <TextField
            id="search-initiative"
            placeholder={t('pages.initiativesList.searchByInitiativeName')}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => {
              handleSearchInitiatives(e.target.value);
            }}
            inputProps={{ 'data-testid': 'search-initiatives' }}
          />
        </Box>
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
          {initiativeListFiltered.length > 0 ? (
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody sx={{ backgroundColor: 'white' }}>
                {stableSort(initiativeListFiltered, getComparator(order, orderBy)).map(
                  (row, index) => {
                    const labelId = `enhanced-table-row-${index}`;
                    return (
                      <TableRow tabIndex={-1} key={row.id} sx={{}}>
                        <TableCell id={labelId} scope="row">
                          <Box
                            component="button"
                            type="button"
                            sx={{
                              color: 'primary.main',
                              fontWeight: 600,
                              fontSize: '1em',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              navigate(
                                generatePath(ROUTES.INITIATIVE_BASE, {
                                  initiativeId: row.initiativeId,
                                })
                              );
                            }}
                            data-testid="initiative-btn-test"
                          >
                            {row.initiativeName}
                          </Box>
                        </TableCell>
                        <TableCell>{row.organizationName}</TableCell>
                        <TableCell>{row.spendingPeriod}</TableCell>
                        <TableCell>{row.serviceId}</TableCell>
                        <TableCell>{renderInitiativeStatus(row.status as StatusEnum)}</TableCell>
                      </TableRow>
                    );
                  }
                )}
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
                <EmptyListTable message="pages.initiativesList.emptyList" />
              </Box>
            </Box>
          )}
        </TableContainer>
      </Paper>
    </Box>
  );
};
export default InitiativesList;
