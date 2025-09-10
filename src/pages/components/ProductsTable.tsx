import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Typography,
  Checkbox,
  TableRow,
  Tooltip,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import EprelLinks from '../../components/Product/EprelLinks';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { PRODUCTS_STATES, USERS_TYPES } from '../../utils/constants';
import { fetchUserFromLocalStorage, getTablePrLength, truncateString } from '../../helpers';
import EnhancedTableHead from '../../components/Product/EnhancedTableHead';
import { institutionListSelector } from '../../redux/slices/invitaliaSlice';
import ProductStatusChip from '../../components/Product/ProductStatusChip';
import {
  actionsCellSx,
  cellCenterSx,
  cellLeftSx,
  cellRightSx,
  checkboxCellSx,
  ProductsTableProps,
  rowTableSx,
} from './helpers';

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
  const institutionsList = useSelector(institutionListSelector);
  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const isInvitaliaUser = [USERS_TYPES.INVITALIA_L1, USERS_TYPES.INVITALIA_L2].includes(
    user?.org_role as USERS_TYPES
  );
  const isAllSelected = tableData.length > 0 && selected.length === tableData.length;
  const isIndeterminate = selected.length > 0 && selected.length < tableData.length;

  const headCellsInvitalia: Array<{
    id: keyof ProductDTO | 'producer';
    label: string;
    align: 'left' | 'center' | 'right';
  }> = [
    {
      id: 'category',
      label: t('pages.products.listHeader.category'),
      align: 'left',
    },
    {
      id: 'producer',
      label: t('pages.products.listHeader.producer'),
      align: 'left',
    },
    {
      id: 'eprelCode',
      label: t('pages.products.listHeader.eprelCode'),
      align: 'center',
    },
    {
      id: 'gtinCode',
      label: t('pages.products.listHeader.gtinCode'),
      align: 'center',
    },
    {
      id: 'batchName',
      label: t('pages.products.listHeader.batch'),
      align: 'left',
    },
    {
      id: 'status',
      label: t('pages.products.listHeader.status'),
      align: 'left',
    },
  ];

  const headCellsProduttore: Array<{
    id: keyof ProductDTO | 'actions';
    label: string;
    align: 'left' | 'center' | 'right';
  }> = [
    {
      id: 'category',
      label: t('pages.products.listHeader.category'),
      align: 'left',
    },
    {
      id: 'energyClass',
      label: t('pages.products.listHeader.energeticClass'),
      align: 'center',
    },
    {
      id: 'eprelCode',
      label: t('pages.products.listHeader.eprelCode'),
      align: 'center',
    },
    {
      id: 'gtinCode',
      label: t('pages.products.listHeader.gtinCode'),
      align: 'center',
    },
    {
      id: 'batchName',
      label: t('pages.products.listHeader.batch'),
      align: 'left',
    },
    {
      id: 'status',
      label: t('pages.products.listHeader.status'),
      align: 'left',
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
    },
  ];

  const getProducer = (organizationId: string): string | null =>
    institutionsList?.find(
      (institutions: { institutionId: string }) => institutions.institutionId === organizationId
    )?.description ?? null;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = tableData
        .filter(
          (row: any) =>
            (user?.org_role === USERS_TYPES.INVITALIA_L2 &&
              row.status === PRODUCTS_STATES.WAIT_APPROVED) ||
            (user?.org_role === USERS_TYPES.INVITALIA_L1 &&
              (row.status === PRODUCTS_STATES.UPLOADED ||
                row.status === PRODUCTS_STATES.SUPERVISED))
        )
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

  const renderInvitaliaRow = (row: any, index: number) => (
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
      onClick={() => handleListButtonClick(row)}
    >
      <TableCell sx={checkboxCellSx}>
        {typeof row.gtinCode === 'string' ? (
          <Checkbox
            color="primary"
            checked={selected.includes(row.gtinCode)}
            disabled={
              (user?.org_role === USERS_TYPES.INVITALIA_L2 &&
                row.status !== PRODUCTS_STATES.WAIT_APPROVED) ||
              (user?.org_role === USERS_TYPES.INVITALIA_L1 &&
                row.status !== PRODUCTS_STATES.UPLOADED &&
                row.status !== PRODUCTS_STATES.SUPERVISED)
            }
            onChange={() => handleCheckboxClick(row.gtinCode)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Checkbox color="primary" disabled checked={false} />
        )}
      </TableCell>
      <TableCell sx={cellLeftSx}>
        <Typography variant="body2">{row?.category ?? emptyData}</Typography>
      </TableCell>
      <TableCell sx={cellLeftSx}>
        <Tooltip title={getProducer(row?.organizationId) ?? emptyData} arrow>
          <Typography variant="body2">
            {truncateString(getProducer(row?.organizationId) ?? emptyData, getTablePrLength())}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={cellCenterSx}>
        <Tooltip title={row?.eprelCode ?? emptyData} arrow>
          <span>
            <EprelLinks row={row} />
          </span>
        </Tooltip>
      </TableCell>
      <TableCell sx={cellCenterSx}>
        <Tooltip title={row?.gtinCode ?? emptyData} arrow>
          <Typography variant="body2">
            {truncateString(row?.gtinCode ?? emptyData, getTablePrLength())}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={cellLeftSx}>
        <Tooltip title={row?.batchName ?? emptyData} arrow>
          <Typography variant="body2">
            {truncateString(row?.batchName ?? emptyData, getTablePrLength())}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={cellLeftSx}>
        <ProductStatusChip status={row?.status ?? emptyData ?? ''} />
      </TableCell>
      <TableCell sx={actionsCellSx}>
        <ArrowForwardIosIcon
          sx={{
            cursor: 'pointer',
            color: '#0073E6',
          }}
        />
      </TableCell>
    </TableRow>
  );

  const renderProduttoreRow = (row: ProductDTO, index: number) => (
    <TableRow tabIndex={-1} key={index} sx={rowTableSx} hover>
      {headCellsProduttore.map((headCell) => (
        <TableCell key={headCell.id as string} sx={getCellSx(headCell)}>
          {getCellContent(headCell, row)}
        </TableCell>
      ))}
    </TableRow>
  );

  const getCellContent = (
    headCell: { id: keyof ProductDTO | 'actions'; label: string },
    row: ProductDTO
  ) => {
    switch (headCell.id) {
      case 'category':
        return <Typography variant="body2">{row?.category ?? emptyData}</Typography>;
      case 'energyClass':
        return <Typography variant="body2">{row?.energyClass ?? emptyData}</Typography>;
      case 'eprelCode':
        return <EprelLinks row={row} />;
      case 'gtinCode':
        return (
          <Tooltip title={row?.gtinCode ?? emptyData} arrow>
            <Typography variant="body2">
              {truncateString(row?.gtinCode ?? emptyData, getTablePrLength())}
            </Typography>
          </Tooltip>
        );
      case 'batchName':
        return (
          <Tooltip title={row?.batchName ?? emptyData} arrow>
            <Typography variant="body2">
              {truncateString(row?.batchName ?? emptyData, getTablePrLength())}
            </Typography>
          </Tooltip>
        );
      case 'status':
        return <ProductStatusChip status={row?.status ?? emptyData ?? ''} />;
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
  };

  const getCellSx = (headCell: {
    id: keyof ProductDTO | 'actions';
    label: string;
    align: 'left' | 'center' | 'right';
  }) => {
    if (headCell.id === 'actions') {
      return actionsCellSx;
    }
    return headCell.align === 'left'
      ? cellLeftSx
      : headCell.align === 'center'
      ? cellCenterSx
      : cellRightSx;
  };

  return (
    <TableContainer>
      <Table size="small" sx={{ tableLayout: 'auto' }}>
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
