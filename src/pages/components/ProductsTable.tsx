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
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ProductDTO } from '../../api/generated/register';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import ProductStatusChip from '../../components/Product/ProductStatusChip';
import EprelLinks from '../../components/Product/EprelLinks';
import { truncateString, getResponsiveTableMaxLength } from '../../helpers';

interface ColumnConfig {
  id: string;
  labelKey: string;
  sortable?: boolean;
  type?: 'checkbox' | 'action' | 'derived' | 'eprelLink';
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
  headerAlign?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
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
  const { config } = useInitiativeConfig();
  const theme = useTheme();

  const rowBg = theme.palette.background.paper;
  const rowHoverBg = theme.palette.action.hover;
  const rowBorderColor = theme.palette.divider;
  const rowBorderWidth = '1px';
  const headerTextColor = theme.palette.text.primary;

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
          <ChevronRightIcon
            sx={{
              color: theme.palette.primary.main,
              fontSize: 18,
            }}
          />
        </IconButton>
      );
    }

    if (col.id === 'status') {
      return <ProductStatusChip status={(row as any)[col.id]} />;
    }

    if (col.type === 'eprelLink') {
      return <EprelLinks row={row} />;
    }

    const value = (row as any)[col.id];

    if (typeof value === 'string') {
      const maxLength = getResponsiveTableMaxLength(config);
      const shouldTruncate = value.length > maxLength;

      return shouldTruncate ? (
        <Tooltip title={value}>
          <span style={{ display: 'block', width: '100%' }}>
            {truncateString(value, maxLength)}
          </span>
        </Tooltip>
      ) : (
        value
      );
    }

    return value ?? '-';
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {(columns || []).map((col) => (
              <TableCell
                key={col.id}
                align={col.headerAlign ?? col.align ?? 'left'}
                sx={{
                  fontWeight: 600,
                  color: headerTextColor,
                }}
              >
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
            <TableRow
              key={index}
              hover
              sx={{
                backgroundColor: rowBg,
                borderTop: `${rowBorderWidth} solid ${rowBorderColor}`,
                borderBottom: `${rowBorderWidth} solid ${rowBorderColor}`,
                '&:hover': {
                  backgroundColor: rowHoverBg,
                },
              }}
            >
              {(columns || []).map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align ?? 'left'}
                  sx={{
                    borderTop: `${rowBorderWidth} solid ${rowBorderColor}`,
                    borderBottom: `${rowBorderWidth} solid ${rowBorderColor}`,
                    pt: 2,
                    pb: 2,
                    ...(col.id === 'status' && {
                      verticalAlign: 'middle',
                      pt: 2,
                      pb: '10px',
                    }),
                  }}
                >
                  {renderCellContent(col, row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
