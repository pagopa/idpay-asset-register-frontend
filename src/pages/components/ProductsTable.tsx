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
import { Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ProductDTO } from '../../api/generated/register';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import ProductStatusChip from '../../components/Product/ProductStatusChip';
import EprelLinks from '../../components/Product/EprelLinks';
import { getProductRowKey } from '../../components/Product/ProductDataGrid.helpers';

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
  selectionAllowedStatuses?: Array<string>;
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
  selectionAllowedStatuses,
  order,
  orderBy,
  onRequestSort,
  selected,
  setSelected,
  handleListButtonClick,
  emptyData,
}) => {
  const { t } = useScopedTranslation();
  const theme = useTheme();

  const rowBg = theme.palette.background.paper;
  const rowHoverBg = theme.palette.action.hover;
  const rowBorderColor = theme.palette.divider;
  const rowBorderWidth = '1px';
  const headerTextColor = theme.palette.text.primary;

  const columnWidthMap: Record<string, string> = {
    select: '5%',
    checkbox: '5%',
    category: '16%',
    organizationName: '16%',
    producer: '16%',
    energyClass: '10%',
    eprelCode: '12%',
    gtinCode: '13%',
    productCode: '16%',
    batchName: '19%',
    status: '14%',
    actions: '5%',
    __detail__: '5%',
  };
  const utilityColumns = ['select', 'checkbox', 'status', 'actions', '__detail__'];
  const isUtilityColumn = (columnId: string) => utilityColumns.includes(columnId);
  const isBatchColumn = (columnId: string) => columnId === 'batchName';
  const shouldWrapColumn = (columnId: string) =>
    !isUtilityColumn(columnId) && !isBatchColumn(columnId);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const renderCellContent = (col: ColumnConfig, row: ProductDTO) => {
    if (col.type === 'checkbox' && selection?.enabled) {
      const rowKey = getProductRowKey(row);
      const isSelectableStatus =
        !selectionAllowedStatuses?.length ||
        (!!row.status && selectionAllowedStatuses.includes(String(row.status)));

      return (
        <Checkbox
          checked={!!rowKey && selected.includes(rowKey)}
          disabled={!rowKey || !isSelectableStatus}
          onChange={(e) => {
            e.stopPropagation();
            if (!rowKey) {
              return;
            }

            setSelected((prevSelected) =>
              prevSelected.includes(rowKey)
                ? prevSelected.filter((code) => code !== rowKey)
                : [...prevSelected, rowKey]
            );
          }}
        />
      );
    }
    if (col.type === 'action') {
      return (
        <IconButton size="small" onClick={() => handleListButtonClick(row)}>
          <ArrowForwardIosIcon
            sx={{
              color: theme.palette.primary.main
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
      if (isBatchColumn(col.id)) {
        return (
          <Tooltip title={value}>
            <span
              style={{
                display: 'block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {value}
            </span>
          </Tooltip>
        );
      }

      return (
        <span
          style={{
            display: 'block',
            maxWidth: '100%',
            overflow: 'visible',
            overflowWrap: 'anywhere',
            textOverflow: 'clip',
            whiteSpace: shouldWrapColumn(col.id) ? 'normal' : 'nowrap',
          }}
        >
          {value}
        </span>
      );
    }

    return value ?? '-';
  };

  return (
    <TableContainer sx={{ overflowX: 'hidden' }}>
      <Table
        size="small"
        sx={{
          tableLayout: 'fixed',
          width: '100%',
        }}
      >
        <TableHead>
          <TableRow>
            {(columns || []).map((col) => (
              <TableCell
                key={col.id}
                align={col.headerAlign ?? col.align ?? 'left'}
                sx={{
                  fontWeight: 600,
                  color: headerTextColor,
                  width: columnWidthMap[col.id] ?? 'auto',
                  whiteSpace: isUtilityColumn(col.id) ? 'nowrap' : 'normal',
                  overflow: 'visible',
                  overflowWrap: 'normal',
                  textOverflow: 'clip',
                  lineHeight: 1.2,
                }}
              >
                {col.sortable ? (
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : 'asc'}
                    onClick={(e) => onRequestSort(e, col.id as keyof ProductDTO)}
                    sx={{
                      whiteSpace: 'normal',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      '& .MuiTableSortLabel-icon': {
                        flexShrink: 0,
                      },
                    }}
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
              key={getProductRowKey(row) || index}
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
                    width: columnWidthMap[col.id] ?? 'auto',
                    overflow: isBatchColumn(col.id) ? 'hidden' : 'visible',
                    overflowWrap: shouldWrapColumn(col.id) ? 'anywhere' : 'normal',
                    textOverflow: isBatchColumn(col.id) ? 'ellipsis' : 'clip',
                    whiteSpace: shouldWrapColumn(col.id) ? 'normal' : 'nowrap',
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
