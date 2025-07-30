import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Typography,
  Checkbox,
  TableRow,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';
import EprelLinks from '../../components/Product/EprelLinks';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { INVITALIA } from '../../utils/constants';
import { fetchUserFromLocalStorage } from '../../helpers';
import EnhancedTableHead from '../../components/Product/EnhancedTableHead';

const COLUMN_WIDTHS = {
  checkbox: '5.97%',
  status: '6.05%',
  category: '6.54%',
  energyClass: '10.20%',
  eprelCode: '13.91%',
  gtinCode: '14.81%',
  batchName: '23.77%',
  actions: '7.78%',
};

function renderUploadStatusIcon(status: string) {
  switch (status) {
    case 'APPROVED':
      return;
    case 'SUPERVISIONED':
      return <WarningIcon sx={{ color: '#D9AD3C' }} />;
    case 'REJECTED':
      return <ErrorIcon sx={{ color: '#D85757' }} />;
    default:
      return;
  }
}

export interface ProductsTableProps {
  tableData: Array<ProductDTO>;
  emptyData?: string;
  order: 'asc' | 'desc';
  orderBy: keyof ProductDTO;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ProductDTO) => void;
  handleListButtonClick: (row: ProductDTO) => void;
  selected: Array<string>;
  setSelected: React.Dispatch<React.SetStateAction<Array<string>>>;
}

const rowTableSx = {
  height: '53px',
  transition: 'background-color 0.2s',
  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
};

const cellBaseSx = (width: string | number) => ({
  borderBottom: '1px solid #e0e0e0',
  width,
  minWidth: width,
  maxWidth: width,
  padding: '0px',
  boxSizing: 'border-box',
});
const cellLeftSx = (width: string | number) => ({
  ...cellBaseSx(width),
  textAlign: 'left',
  padding: '16px',
});
const cellCenterSx = (width: string | number) => ({ ...cellBaseSx(width), textAlign: 'center' });
const cellRightSx = (width: string | number) => ({ ...cellBaseSx(width), textAlign: 'right' });

const ProductsTable: React.FC<ProductsTableProps> = ({
  tableData,
  emptyData,
  order,
  orderBy,
  onRequestSort,
  handleListButtonClick,
  selected,
  setSelected,
}) => {
  const { t } = useTranslation();
  const headCellsInvitalia: Array<{
    id: keyof ProductDTO;
    label: string;
    align: 'left' | 'center' | 'right';
    width: string;
  }> = [
    {
      id: 'status',
      label: t('pages.products.listHeader.status'),
      align: 'left',
      width: COLUMN_WIDTHS.status,
    },
    {
      id: 'category',
      label: t('pages.products.listHeader.category'),
      align: 'left',
      width: COLUMN_WIDTHS.category,
    },
    {
      id: 'energyClass',
      label: t('pages.products.listHeader.energeticClass'),
      align: 'center',
      width: COLUMN_WIDTHS.energyClass,
    },
    {
      id: 'eprelCode',
      label: t('pages.products.listHeader.eprelCode'),
      align: 'center',
      width: COLUMN_WIDTHS.eprelCode,
    },
    {
      id: 'gtinCode',
      label: t('pages.products.listHeader.gtinCode'),
      align: 'center',
      width: COLUMN_WIDTHS.gtinCode,
    },
    {
      id: 'batchName',
      label: t('pages.products.listHeader.batch'),
      align: 'left',
      width: COLUMN_WIDTHS.batchName,
    },
  ];

  const headCellsProduttore: Array<{
    id: keyof ProductDTO | 'actions';
    label: string;
    align: 'left' | 'center' | 'right';
    width: string;
  }> = [
    {
      id: 'category',
      label: t('pages.products.listHeader.category'),
      align: 'left',
      width: COLUMN_WIDTHS.category,
    },
    {
      id: 'energyClass',
      label: t('pages.products.listHeader.energeticClass'),
      align: 'center',
      width: COLUMN_WIDTHS.energyClass,
    },
    {
      id: 'eprelCode',
      label: t('pages.products.listHeader.eprelCode'),
      align: 'center',
      width: COLUMN_WIDTHS.eprelCode,
    },
    {
      id: 'gtinCode',
      label: t('pages.products.listHeader.gtinCode'),
      align: 'center',
      width: COLUMN_WIDTHS.gtinCode,
    },
    {
      id: 'batchName',
      label: t('pages.products.listHeader.batch'),
      align: 'left',
      width: COLUMN_WIDTHS.batchName,
    },
    {
      id: 'status',
      label: t('pages.products.listHeader.status'),
      align: 'left',
      width: COLUMN_WIDTHS.status,
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      width: COLUMN_WIDTHS.actions,
    },
  ];

  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const isInvitaliaUser = user?.org_role === INVITALIA;

  const isAllSelected = tableData.length > 0 && selected.length === tableData.length;
  const isIndeterminate = selected.length > 0 && selected.length < tableData.length;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = tableData
        .map((row) => row.gtinCode)
        .filter((code): code is string => code !== undefined);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxClick = (gtinCode: string) => {
    setSelected((prevSelected) =>
      prevSelected.includes(gtinCode)
        ? prevSelected.filter((code) => code !== gtinCode)
        : [...prevSelected, gtinCode]
    );
  };

  const renderInvitaliaRow = (row: ProductDTO, index: number) => (
    <TableRow
      tabIndex={-1}
      key={index}
      sx={{
        ...rowTableSx,
        ...(selected.includes(row.gtinCode ?? '') && {
          background: '#0073E614',
          '&:hover': { backgroundColor: '#0073E626' },
        }),
      }}
      hover
    >
      <TableCell sx={cellLeftSx(COLUMN_WIDTHS.checkbox)}>
        {typeof row.gtinCode === 'string' ? (
          <Checkbox
            color="primary"
            checked={selected.includes(row.gtinCode)}
            onChange={() => handleCheckboxClick(row.gtinCode)}
          />
        ) : (
          <Checkbox color="primary" disabled checked={false} />
        )}
      </TableCell>
      <TableCell sx={cellLeftSx(COLUMN_WIDTHS.status)}>
        {renderUploadStatusIcon(row?.status ?? emptyData ?? '')}
      </TableCell>
      <TableCell sx={cellLeftSx(COLUMN_WIDTHS.category)}>
        <Typography variant="body2">{row?.category ?? emptyData}</Typography>
      </TableCell>
      <TableCell sx={cellCenterSx(COLUMN_WIDTHS.energyClass)}>
        <Typography variant="body2">{row?.energyClass ?? emptyData}</Typography>
      </TableCell>
      <TableCell sx={cellCenterSx(COLUMN_WIDTHS.eprelCode)}>
        <EprelLinks row={row} />
      </TableCell>
      <TableCell sx={cellCenterSx(COLUMN_WIDTHS.gtinCode)}>
        <Typography variant="body2">{row?.gtinCode ?? emptyData}</Typography>
      </TableCell>
      <TableCell sx={cellLeftSx(COLUMN_WIDTHS.batchName)}>
        <Typography variant="body2">{row?.batchName ?? emptyData}</Typography>
      </TableCell>
      <TableCell sx={cellRightSx(COLUMN_WIDTHS.actions)}>
        <ArrowForwardIosIcon
          sx={{ cursor: 'pointer', color: '#0073E6' }}
          onClick={() => handleListButtonClick(row)}
        />
      </TableCell>
    </TableRow>
  );

  const renderProduttoreRow = (row: ProductDTO, index: number) => (
    <TableRow tabIndex={-1} key={index} sx={rowTableSx} hover>
      {headCellsProduttore.map((headCell) => {
        const cellContent: React.ReactNode = (() => {
          switch (headCell.id) {
            case 'category':
              return <Typography variant="body2">{row?.category ?? emptyData}</Typography>;
            case 'energyClass':
              return <Typography variant="body2">{row?.energyClass ?? emptyData}</Typography>;
            case 'eprelCode':
              return <EprelLinks row={row} />;
            case 'gtinCode':
              return <Typography variant="body2">{row?.gtinCode ?? emptyData}</Typography>;
            case 'batchName':
              return <Typography variant="body2">{row?.batchName ?? emptyData}</Typography>;
            case 'status':
              return renderUploadStatusIcon(row?.status ?? emptyData ?? '');
            case 'actions':
              return (
                <ArrowForwardIosIcon
                  sx={{ cursor: 'pointer', color: '#0073E6' }}
                  onClick={() => handleListButtonClick(row)}
                />
              );
            default:
              return null;
          }
        })();
        const cellSx =
          headCell.align === 'left'
            ? cellLeftSx(headCell.width)
            : headCell.align === 'center'
            ? cellCenterSx(headCell.width)
            : cellRightSx(headCell.width);

        return (
          <TableCell key={headCell.id as string} sx={cellSx}>
            {cellContent}
          </TableCell>
        );
      })}
    </TableRow>
  );

  return (
    <TableContainer>
      <Table size="small">
        <EnhancedTableHead
          isInvitaliaUser={isInvitaliaUser}
          headCells={isInvitaliaUser ? headCellsInvitalia : headCellsProduttore}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          handleSelectAllClick={handleSelectAllClick}
          cellLeftSx={undefined}
          cellCenterSx={undefined}
          cellRightSx={undefined}
        />
        <TableBody>
          {tableData.map((row, index) =>
            isInvitaliaUser ? renderInvitaliaRow(row, index) : renderProduttoreRow(row, index)
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
