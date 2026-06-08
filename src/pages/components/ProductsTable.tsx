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
import {
  truncateString,
  getResponsiveTableMaxLength,
  fetchUserFromLocalStorage,
} from '../../helpers';
import { USERS_TYPES } from '../../utils/constants';
import { ProductStatus } from '../../api/generated/register';

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
  const user = React.useMemo(() => fetchUserFromLocalStorage(), []);

  const rowBg = theme.palette.background.paper;
  const rowHoverBg = theme.palette.action.hover;
  const rowBorderColor = theme.palette.divider;
  const rowBorderWidth = '1px';
  const headerTextColor = theme.palette.text.primary;

  const columnWidthMap: Record<string, string> = {
    select: '5%',
    category: '15%',
    organizationName: '20%',
    gtinCode: '20%',
    batchName: '25%',
    status: '10%',
    actions: '5%',
    __detail__: '5%',
  };

  const isCheckboxDisabled = (row: ProductDTO) => {
    const role = user?.org_role;
    const status = row.status as ProductStatus | undefined;

    if (role === USERS_TYPES.INVITALIA_L2) {
      return String(status) !== ProductStatus.WAIT_APPROVED;
    }

    if (role === USERS_TYPES.INVITALIA_L1) {
      return status !== ProductStatus.UPLOADED && status !== ProductStatus.SUPERVISED;
    }

    // Produttore (OPERATORE) in UAT poteva selezionare righe secondo stato,
    // quindi non disabilitiamo di default la checkbox per ruoli diversi da L1/L2
    return false;
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const renderCellContent = (col: ColumnConfig, row: ProductDTO) => {
    if (col.type === 'checkbox' || col.id === 'select') {
      const rowIdentifier =
        (row.productCode as string | undefined) ?? (row.gtinCode as string | undefined);

      const disabled = isCheckboxDisabled(row);
      return (
        <Checkbox
          disabled={disabled}
          checked={rowIdentifier ? selected.includes(rowIdentifier) : false}
          onChange={(_, checked) => {
            if (!rowIdentifier) {
              return;
            }
            setSelected((prevSelected) =>
              checked
                ? [...prevSelected, rowIdentifier]
                : prevSelected.filter((c) => c !== rowIdentifier)
            );
          }}
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
                  whiteSpace: col.id === 'status' ? 'nowrap' : 'normal',
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
          {tableData.map((row, index) => {
            const rowIdentifier =
              (row.productCode as string | undefined) ?? (row.gtinCode as string | undefined);

            const uniqueKey = `${rowIdentifier ?? 'row'}-${row.batchName ?? 'batch'}-${
              row.registrationDate ?? index
            }`;

            return (
              <TableRow
                key={uniqueKey}
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
