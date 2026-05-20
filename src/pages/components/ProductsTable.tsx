import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  TableSortLabel,
  Checkbox,
  IconButton,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ProductDTO } from '../../api/generated/register';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import ProductStatusChip from '../../components/Product/ProductStatusChip';
import EprelLinks from '../../components/Product/EprelLinks';

interface ColumnConfig {
  id: string;
  labelKey: string;
  sortable?: boolean;
  type?: 'checkbox' | 'action' | 'derived' | 'eprelLink';
}

interface SelectionConfig {
  enabled?: boolean;
}

interface ProductsTableProps {
  tableData: Array<ProductDTO>;
  columns: Array<ColumnConfig>;
  selection?: SelectionConfig;
  order: 'asc' | 'desc';
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ProductDTO) => void;
  selected: Array<string>;
  setSelected: React.Dispatch<React.SetStateAction<Array<string>>>;
  handleListButtonClick: (row: ProductDTO) => void;
  emptyData?: string;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  tableData,
  columns = [],
  selection,
  order,
  orderBy,
  onRequestSort,
  selected,
  setSelected,
  handleListButtonClick,
  emptyData,
}) => {
  const { t } = useScopedTranslation();

  const handleCheckboxClick = (gtinCode: string) => {
    setSelected((prev) =>
      prev.includes(gtinCode) ? prev.filter((code) => code !== gtinCode) : [...prev, gtinCode]
    );
  };

  const renderCellContent = (col: ColumnConfig, row: ProductDTO) => {
    if (col.type === 'checkbox' && selection?.enabled) {
      return (
        <Checkbox
          checked={selected.includes(row.gtinCode ?? '')}
          onChange={() => row.gtinCode && handleCheckboxClick(row.gtinCode)}
        />
      );
    }

    if (col.type === 'action') {
      return (
        <IconButton size="small" onClick={() => handleListButtonClick(row)}>
          <ArrowForwardIosIcon />
        </IconButton>
      );
    }

    if (col.id === 'status') {
      return <ProductStatusChip status={(row as any)[col.id]} />;
    }

    if (col.type === 'eprelLink') {
      return <EprelLinks row={row} />;
    }

    return (row as any)[col.id] ?? '-';
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {(columns || []).map((col) => (
              <TableCell key={col.id}>
                {col.sortable ? (
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : 'asc'}
                    onClick={(e) => onRequestSort(e, col.id as keyof ProductDTO)}
                  >
                    {t(col.labelKey)}
                  </TableSortLabel>
                ) : (
                  t(col.labelKey)
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.length === 0 && (
            <TableRow>
              <TableCell colSpan={(columns || []).length}>{emptyData ?? '-'}</TableCell>
            </TableRow>
          )}
          {tableData.map((row, index) => (
            <TableRow key={index} hover>
              {(columns || []).map((col) => (
                <TableCell key={col.id}>{renderCellContent(col, row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
