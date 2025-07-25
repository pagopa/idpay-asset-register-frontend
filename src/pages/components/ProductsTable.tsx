import React from 'react';
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
  Box,
  Button,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EprelLinks from '../../components/Product/EprelLinks';
import { ProductDTO } from '../../api/generated/register/ProductDTO';

export interface ProductsTableProps {
  owner: 'invitalia' | 'produttore';
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

const buttonStyle = {
  width: 138,
  height: 48,
  borderRadius: 4,
  fontWeight: 600,
  fontSize: 16,
  marginRight: 2,
};

const headCellsInvitalia: Array<{
  id: keyof ProductDTO | 'selectedStatus';
  label: string;
  align: 'left' | 'center' | 'right';
}> = [
  { id: 'selectedStatus', label: '', align: 'left' },
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
  owner,
  tableData,
  emptyData,
  order,
  orderBy,
  onRequestSort,
  handleListButtonClick,
}) => {
  // Colonne e rendering dinamico in base all'owner
  const isInvitalia = owner === 'invitalia';

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {(isInvitalia ? headCellsInvitalia : headCellsProduttore).map((headCell) => (
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
                  {/* Checkbox e EPREL non sono ordinabili */}
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
                {/* INVITALIA: checkbox e status */}
                {isInvitalia && (
                  <>
                    <TableCell sx={cellLeftSx}>
                      <Checkbox color="primary" />
                    </TableCell>
                    <TableCell sx={cellLeftSx}>
                      <Typography variant="body2">{row?.status ?? emptyData}</Typography>
                    </TableCell>
                  </>
                )}
                {/* Colonne comuni (ordine diverso per owner) */}
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
                  row
                  <Typography variant="body2">{row?.gtinCode ?? emptyData}</Typography>
                </TableCell>
                <TableCell sx={cellLeftSx}>
                  <Typography variant="body2">{row?.batchName ?? emptyData}</Typography>
                </TableCell>
                <TableCell sx={cellRightSx}>
                  <ArrowForwardIosIcon
                    sx={{ cursor: 'pointer', color: isInvitalia ? '#0073E6' : undefined }}
                    onClick={() => handleListButtonClick(row)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Bottoni visibili solo per Invitalia */}
      {isInvitalia && (
        <Box mt={2} display="flex" flexDirection="row" justifyContent="flex-start">
          <Button
            variant="contained"
            sx={{
              ...buttonStyle,
              backgroundColor: '#0073E6',
              color: '#fff',
              '&:hover': { backgroundColor: '#005bb5' },
            }}
          >
            Contrassegna
          </Button>
          <Button
            variant="outlined"
            sx={{
              ...buttonStyle,
              color: '#D85757',
              border: '2px solid #D85757',
              backgroundColor: '#fff',
              '&:hover': {
                border: '2px solid #b23b3b',
                backgroundColor: '#fff0f0',
              },
            }}
          >
            Escludi
          </Button>
        </Box>
      )}
    </>
  );
};

export default ProductsTable;
