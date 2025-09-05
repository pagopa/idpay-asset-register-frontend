import React from 'react';
import { TableHead, TableRow, TableCell, TableSortLabel, Checkbox, Box } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { ProductDTO } from '../../api/generated/register/ProductDTO';

interface HeadCell {
  id: keyof ProductDTO | 'selectedStatus' | 'actions' | 'producer';
  label: string;
  align: 'left' | 'center' | 'right';
  width?: number | string;
}

export interface EnhancedTableHeadProps {
  isInvitaliaUser: boolean;
  headCells: Array<HeadCell>;
  order: 'asc' | 'desc';
  orderBy: keyof ProductDTO;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ProductDTO) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  handleSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cellLeftSx?: any;
  cellCenterSx?: any;
  cellRightSx?: any;
}

const EnhancedTableHead: React.FC<EnhancedTableHeadProps> = ({
  isInvitaliaUser,
  headCells,
  order,
  orderBy,
  onRequestSort,
  isAllSelected,
  isIndeterminate,
  handleSelectAllClick,
  cellLeftSx,
  cellCenterSx,
  cellRightSx,
}) => {
  const { t } = useTranslation();

  return (
    <TableHead>
      <TableRow>
        {isInvitaliaUser && (
          <TableCell
            sx={{
              ...cellLeftSx,
              width: headCells[0]?.width,
              minWidth: headCells[0]?.width,
              maxWidth: headCells[0]?.width,
            }}
          >
            <Checkbox
              color="primary"
              indeterminate={isIndeterminate}
              checked={isAllSelected}
              onChange={handleSelectAllClick}
            />
          </TableCell>
        )}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              ...(headCell.align === 'left'
                ? cellLeftSx
                : headCell.align === 'center'
                ? cellCenterSx
                : cellRightSx),
              width: headCell.width,
              minWidth: headCell.width,
              maxWidth: headCell.width,
            }}
          >
            {headCell.id !== 'selectedStatus' ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={(event) => onRequestSort(event, headCell.id as keyof ProductDTO)}
                hideSortIcon={true}
              >
                {t(headCell.label)}
                {orderBy === headCell?.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              t(headCell.label)
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default EnhancedTableHead;
