import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Checkbox,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EprelLinks from '../../components/Product/EprelLinks';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { INVITALIA } from '../../utils/constants';
import { fetchUserFromLocalStorage } from '../../helpers';

function renderUploadStatusIcon(status: string) {
  switch (status) {
    case 'APPROVED':
      return;
    case 'SUPERVISION':
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
}

const rowTableSx = {
  height: '53px',
  transition: 'background-color 0.2s',
  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
};
const cellBaseSx = {
  borderBottom: '1px solid #e0e0e0',
  width: '10px',
  padding: '0px',
};
const cellLeftSx = { ...cellBaseSx, textAlign: 'left', padding: '16px' };
const cellCenterSx = { ...cellBaseSx, textAlign: 'center' };
const cellRightSx = { ...cellBaseSx, textAlign: 'right' };

const headCellsInvitalia: Array<{
  id: keyof ProductDTO | 'selectedStatus';
  label: string;
  align: 'left' | 'center' | 'right';
}> = [
  { id: 'status', label: 'Stato', align: 'left' },
  { id: 'category', label: 'Categoria', align: 'left' },
  { id: 'energyClass', label: 'Classe Energetica', align: 'center' },
  { id: 'eprelCode', label: 'EPREL', align: 'center' },
  { id: 'gtinCode', label: 'GTIN', align: 'center' },
  { id: 'batchName', label: 'Batch', align: 'left' },
];

const headCellsProduttore: Array<{
  id: keyof ProductDTO;
  label: string;
  align: 'left' | 'center' | 'right';
}> = [
  { id: 'category', label: 'Categoria', align: 'left' },
  { id: 'energyClass', label: 'Classe Energetica', align: 'center' },
  { id: 'eprelCode', label: 'EPREL', align: 'center' },
  { id: 'gtinCode', label: 'GTIN', align: 'center' },
  { id: 'batchName', label: 'Batch', align: 'left' },
];

const ProductsTable: React.FC<ProductsTableProps> = ({
  tableData,
  emptyData,
  order,
  orderBy,
  onRequestSort,
  handleListButtonClick,
}) => {
  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const isInvitaliaUser = user?.org_role === INVITALIA;

  const [selected, setSelected] = useState<Array<string>>([]);

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

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {isInvitaliaUser && (
                <TableCell sx={cellLeftSx}>
                  <Checkbox
                    color="primary"
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {(isInvitaliaUser ? headCellsInvitalia : headCellsProduttore).map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={
                    headCell.align === 'left'
                      ? cellLeftSx
                      : headCell.align === 'center'
                      ? cellCenterSx
                      : cellRightSx
                  }
                >
                  {headCell.id !== 'eprelCode' && headCell.id !== 'selectedStatus' ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={(event) => onRequestSort(event, headCell.id as keyof ProductDTO)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
              <TableCell sx={cellRightSx} />
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow tabIndex={-1} key={index} sx={rowTableSx} hover>
                {isInvitaliaUser && (
                  <>
                    <TableCell sx={cellLeftSx}>
                      {row.gtinCode !== undefined ? (
                        (() => {
                          const gtinCode = row.gtinCode;
                          return (
                            <Checkbox
                              color="primary"
                              checked={selected.includes(gtinCode)}
                              onChange={() => handleCheckboxClick(gtinCode)}
                            />
                          );
                        })()
                      ) : (
                        <Checkbox color="primary" disabled checked={false} />
                      )}
                    </TableCell>
                    <TableCell sx={cellLeftSx}>
                      {renderUploadStatusIcon(row?.status ?? emptyData ?? '')}
                    </TableCell>
                  </>
                )}
                <TableCell sx={cellLeftSx}>
                  <Typography variant="body2">{row?.category ?? emptyData}</Typography>
                </TableCell>
                <TableCell sx={cellCenterSx}>
                  <Typography variant="body2">{row?.energyClass ?? emptyData}</Typography>
                </TableCell>
                <TableCell sx={cellCenterSx}>
                  <EprelLinks row={row} />
                </TableCell>
                <TableCell sx={cellCenterSx}>
                  <Typography variant="body2">{row?.gtinCode ?? emptyData}</Typography>
                </TableCell>
                <TableCell sx={cellLeftSx}>
                  <Typography variant="body2">{row?.batchName ?? emptyData}</Typography>
                </TableCell>
                <TableCell sx={cellRightSx}>
                  <ArrowForwardIosIcon
                    sx={{ cursor: 'pointer', color: isInvitaliaUser ? '#0073E6' : undefined }}
                    onClick={() => handleListButtonClick(row)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ProductsTable;
