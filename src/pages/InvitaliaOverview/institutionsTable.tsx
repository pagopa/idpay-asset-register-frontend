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
import React, { useState, useEffect, useRef } from 'react';
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
import { MAX_TABLE_HEIGHT } from '../../utils/constants';
import { EnhancedTableProps, HeadCell } from './helpers';

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort, cellWidths } = props;
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
    <TableHead
      sx={{
        backgroundColor: grey?.A100,
        padding: 0,
        textAlign: 'left',
        minWidth: 750,
        border: '1px solid red',
      }}
    >
      <TableRow sx={{ border: '1px solid red' }}>
        {headCells.map((headCell, index, arr) => (
          <TableCell
            colSpan={index === arr.length - 1 ? 2 : 1}
            key={headCell?.id}
            align={headCell?.textAlign ? headCell?.textAlign : 'left'}
            padding="normal"
            sortDirection={orderBy === headCell?.id ? order : false}
            sx={{ width: cellWidths[index] }}
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
  const [firstCellWidth, setFirstCellWidth] = useState<number | undefined>(0);
  const [secondCellWidth, setSecondCellWidth] = useState<number | undefined>(0);
  const [thirdCellWidth, setThirdCellWidth] = useState<number | undefined>(0);

  const firstBodyCellRef = useRef<HTMLTableCellElement>(null);
  const secondBodyCellRef = useRef<HTMLTableCellElement>(null);
  const thirdBodyCellRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const observers: Array<ResizeObserver> = [];

    const updateWidths = () => {
      setFirstCellWidth(firstBodyCellRef.current?.offsetWidth);
      setSecondCellWidth(secondBodyCellRef.current?.offsetWidth);
      setThirdCellWidth(thirdBodyCellRef.current?.offsetWidth);
    };

    [firstBodyCellRef, secondBodyCellRef, thirdBodyCellRef].forEach((ref) => {
      if (ref.current) {
        const observer = new ResizeObserver(updateWidths);
        observer.observe(ref.current);
        // eslint-disable-next-line functional/immutable-data
        observers.push(observer);
      }
    });

    updateWidths();

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [data]);

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

  const renderTableHeader = () => (
    <EnhancedTableHead
      order={order}
      orderBy={orderBy}
      onRequestSort={onRequestSort}
      cellWidths={[firstCellWidth, secondCellWidth, thirdCellWidth]}
    />
  );

  const renderTableBody = () => {
    if (!hasData) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={3}
              align="center"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              {t('pages.invitaliaOverview.noInstitutionsFound')}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {((data.institutions as Array<Institution>) ?? []).map((row: Institution) => (
          <TableRow key={row.institutionId}>
            <TableCell ref={firstBodyCellRef}>
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
            <TableCell ref={secondBodyCellRef}>
              {formatDateWithoutHours(row.createdAt.toString())}
            </TableCell>
            <TableCell ref={thirdBodyCellRef}>
              {formatDateWithoutHours(row.updatedAt.toString())}
            </TableCell>
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
    <>
      <Paper
        sx={{
          width: '100%',
          mb: 2,
          pb: 3,
          backgroundColor: grey.A100,
        }}
      >
        {renderTableHeader()}
        <TableContainer sx={{ maxHeight: MAX_TABLE_HEIGHT }}>
          <Table stickyHeader sx={{ minWidth: 750 }} size="small">
            {renderTableBody()}
          </Table>
        </TableContainer>
        {renderPagination()}
      </Paper>
    </>
  );
};

export default InstitutionsTable;
