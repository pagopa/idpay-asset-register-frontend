import {
  Box,
  CircularProgress,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import { visuallyHidden } from '@mui/utils';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { formatDateWithoutHours } from '../../helpers';
import { usePagination } from '../../hooks/usePagination';
import { Order } from '../../components/Product/helpers';
import { Institution } from '../../model/Institution';
import { InstitutionsResponse } from '../../api/generated/register/InstitutionsResponse';
import ROUTES from '../../routes';
import { setInstitution } from '../../redux/slices/invitaliaSlice';
import EmptyListTable from '../components/EmptyListTable';
import { EnhancedTableProps, HeadCell } from './helpers';

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Institution) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  const { t } = useTranslation();

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'description',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.invitaliaOverview.listHeader.institutionName')}`,
    },
    {
      id: 'createdAt',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.invitaliaOverview.listHeader.createdAt')}`,
    },
    {
      id: 'updatedAt',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.invitaliaOverview.listHeader.updatedAt')}`,
    },
  ];

  return (
    <TableHead sx={{ backgroundColor: grey?.A100, padding: 0, textAlign: 'left' }}>
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
        <TableCell key="action" align="right" padding="normal" />
      </TableRow>
    </TableHead>
  );
}

type InstitutionsTableProps = {
  loading: boolean;
  error: string | null;
  data: InstitutionsResponse;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  order: Order;
  orderBy: keyof Institution;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Institution) => void;
};

const InstitutionsTable: React.FC<InstitutionsTableProps> = ({
  loading,
  error,
  data,
  page,
  rowsPerPage,
  totalElements,
  order,
  orderBy,
  onPageChange,
  onRowsPerPageChange,
  onRequestSort,
}) => {
  const paginationInfo = usePagination(page, rowsPerPage, totalElements);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const goToInstitutionPage = (institution: Institution) => {
    dispatch(setInstitution(institution));
    navigate(ROUTES.INVITALIA_PRODUCTS_LIST);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const hasData = data?.institutions && data?.institutions?.length > 0;

  const renderTableHeader = () => {
    if (!hasData) {
      return <></>;
    }
    return <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={onRequestSort} />;
  };

  const renderTableBody = () => {
    if (!hasData) {
      return <EmptyListTable message="pages.invitaliaOverview.noInstitutionsFound" />;
    }

    return (
      <TableBody>
        {((data.institutions as Array<Institution>) ?? []).map((row: Institution) => (
          <TableRow key={row.institutionId}>
            <TableCell>
              <Link
                underline="hover"
                component="button"
                onClick={() => goToInstitutionPage(row)}
                sx={{ textDecoration: 'none' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'fontWeightBold', color: '#0062C3' }}>
                  {row.description}
                </Typography>
              </Link>
            </TableCell>
            <TableCell>{formatDateWithoutHours(row.createdAt.toString())}</TableCell>
            <TableCell>{formatDateWithoutHours(row.updatedAt.toString())}</TableCell>
            <TableCell>
              <ChevronRight
                color="primary"
                sx={{ verticalAlign: 'middle' }}
                onClick={() => goToInstitutionPage(row)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  const renderPagination = () => {
    if (!hasData) {
      return null;
    }

    return (
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[rowsPerPage]}
        labelRowsPerPage={t('pages.invitaliaOverview.rowsPerPage')}
        labelDisplayedRows={() =>
          `${paginationInfo.from} - ${paginationInfo.to} ${t(
            'pages.invitaliaOverview.tablePaginationFrom'
          )} ${paginationInfo.total}`
        }
      />
    );
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        height: '70%',
        gap: '24px',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
      data-testid="uploads-table"
    >
      <Table>
        {renderTableHeader()}
        {renderTableBody()}
      </Table>
      {renderPagination()}
    </TableContainer>
  );
};

export default InstitutionsTable;
