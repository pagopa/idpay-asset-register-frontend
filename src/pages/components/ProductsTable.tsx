import React, { useMemo } from 'react';
const isUpscaling = typeof window !== 'undefined' && window.innerWidth > RESOLUTION_UPSCALING;
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Typography,
  Checkbox,
  TableRow,
  Tooltip,
  IconButton,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import EprelLinks from '../../components/Product/EprelLinks';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import {
  EMPTY_DATA,
  PRODUCTS_STATES,
  RESOLUTION_UPSCALING,
  USERS_TYPES,
} from '../../utils/constants';
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
    width: string;
  }> = [
    {
      id: 'category',
      label: t('pages.products.listHeader.category'),
      align: 'left',
      width: '10%'
    },
    {
      id: 'organizationName',
      label: t('pages.products.listHeader.producer'),
      align: 'left',
      width: '17%'
    },
    {
      id: 'eprelCode',
      label: t('pages.products.listHeader.eprelCode'),
      align: 'center',
      width: '10%'
    },
    {
      id: 'gtinCode',
      label: t('pages.products.listHeader.gtinCode'),
      align: 'center',
      width: '15%'
    },
    {
      id: 'batchName',
      label: t('pages.products.listHeader.batch'),
      align: 'left',
      width: '25%'
    },
    {
      id: 'status',
      label: t('pages.products.listHeader.status'),
      align: 'left',
      width: '15%'
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
      width: '15%'
    },
    {
      id: 'energyClass',
      label: t('pages.products.listHeader.energeticClass'),
      align: 'center',
      width: '15%'
    },
    {
      id: 'eprelCode',
      label: t('pages.products.listHeader.eprelCode'),
      align: 'center',
      width: '15%'
    },
    {
      id: 'gtinCode',
      label: t('pages.products.listHeader.gtinCode'),
      align: 'center',
      width: '15%'
    },
    {
      id: 'batchName',
      label: t('pages.products.listHeader.batch'),
      align: 'left',
      width: '25%'
    },
    {
      id: 'status',
      label: t('pages.products.listHeader.status'),
      align: 'left',
      width: '15%'
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      width: '5%'
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

  const InvitaliaRow: React.FC<{
    row: any;
    index: number;
    selected: Array<string>;
    user: any;
    handleCheckboxClick: (gtinCode: string) => void;
    handleListButtonClick: (row: any) => void;
    getProducer: (organizationId: string) => string | null;
    emptyData: string;
    // eslint-disable-next-line complexity
  }> = ({
    row,
    index,
    selected,
    user,
    handleCheckboxClick,
    handleListButtonClick,
    getProducer,
    emptyData,
    // eslint-disable-next-line sonarjs/cognitive-complexity
  }) => (
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
        <Typography variant="body2">{String(row?.category ?? emptyData)}</Typography>
      </TableCell>
      <TableCell sx={cellLeftSx}>
        {isUpscaling ? (
          <Typography variant="body2">
            {truncateString(
              String(getProducer(row?.organizationId) ?? emptyData),
              getTablePrLength()
            )}
          </Typography>
        ) : (
          <Tooltip title={String(getProducer(row?.organizationId) ?? emptyData)} arrow>
            <Typography variant="body2">
              {truncateString(
                String(getProducer(row?.organizationId) ?? emptyData),
                getTablePrLength()
              )}
            </Typography>
          </Tooltip>
        )}
      </TableCell>
      <TableCell sx={cellCenterSx}>
        {isUpscaling ? (
          <span>
            <EprelLinks row={row} />
          </span>
        ) : (
          <Tooltip title={String(row?.eprelCode ?? emptyData)} arrow>
            <span>
              <EprelLinks row={row} />
            </span>
          </Tooltip>
        )}
      </TableCell>
      <TableCell sx={cellCenterSx}>
        {isUpscaling ? (
          <Typography variant="body2">
            {truncateString(String(row?.gtinCode ?? emptyData), getTablePrLength())}
          </Typography>
        ) : (
          <Tooltip title={String(row?.gtinCode ?? emptyData)} arrow>
            <Typography variant="body2">
              {truncateString(String(row?.gtinCode ?? emptyData), getTablePrLength())}
            </Typography>
          </Tooltip>
        )}
      </TableCell>
      <TableCell sx={{...cellLeftSx}} >
        <Tooltip title={String(row?.batchName ?? emptyData)} arrow>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',}}>
            {row?.batchName ?? emptyData}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={cellLeftSx}>
        <ProductStatusChip status={typeof row?.status === 'string' ? row.status : emptyData} />
      </TableCell>
      <TableCell sx={{...actionsCellSx, pl: 0 }}>
        <IconButton
          sx={{ backgroundColor: 'transparent', p: 0 }}
          color="default"
          aria-label="Apri dettagli prodotto"
          size="small"
          onClick={() => handleListButtonClick(row)}
        >
          <ArrowForwardIosIcon sx={{ color: '#0073E6' }} />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const ProduttoreRow: React.FC<{
    row: ProductDTO;
    index: number;
    headCellsProduttore: Array<any>;
    getCellSx: (headCell: any) => any;
    getCellContent: (headCell: any, row: ProductDTO) => React.ReactNode;
    emptyData: string;
  }> = ({ row, index, headCellsProduttore, getCellSx, getCellContent, emptyData }) => (
    <TableRow tabIndex={-1} key={index} sx={rowTableSx} hover>
      {headCellsProduttore.map((headCell) => (
        <TableCell key={headCell.id as string} sx={getCellSx(headCell)}>
          {headCell.id === 'status' ? (
            <ProductStatusChip status={typeof row?.status === 'string' ? row.status : emptyData} />
          ) : (
            getCellContent(headCell, row)
          )}
        </TableCell>
      ))}
    </TableRow>
  );

  const RenderTooltipOrText = ({
    value,
    maxLength,
    tooltip,
  }: {
    value: string;
    maxLength?: number;
    tooltip?: string;
  }) =>
    isUpscaling ? (
      <Typography variant="body2"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {truncateString(value, maxLength ?? getTablePrLength())}
      </Typography>
    ) : (
      <Tooltip title={tooltip ?? value} arrow>
        <Typography variant="body2"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {truncateString(value, maxLength ?? getTablePrLength())}
        </Typography>
      </Tooltip>
    );

  const RenderEprelLinks = ({ row }: { row: ProductDTO }) =>
    isUpscaling ? (
      <span>
        <EprelLinks row={row} />
      </span>
    ) : (
      <Tooltip title={String(row?.eprelCode ?? emptyData)} arrow>
        <span>
          <EprelLinks row={row} />
        </span>
      </Tooltip>
    );

  const cellRenderers: Record<string, (row: ProductDTO) => React.ReactNode> = {
    category: (row) => <RenderTooltipOrText value={String(row?.category ?? emptyData)} />,
    energyClass: (row) => <RenderTooltipOrText value={String(row?.energyClass ?? emptyData)} />,
    eprelCode: (row) => <RenderEprelLinks row={row} />,
    gtinCode: (row) => <RenderTooltipOrText value={String(row?.gtinCode ?? emptyData)} />,
    batchName: (row) => <RenderTooltipOrText value={String(row?.batchName ?? emptyData)} />,
    actions: (row) => (
      <ArrowForwardIosIcon
        sx={{ cursor: 'pointer', color: '#0073E6' }}
        onClick={() => handleListButtonClick(row)}
      />
    ),
  };

  const getCellContent = (
    headCell: { id: keyof ProductDTO | 'actions'; label: string },
    row: ProductDTO
  ) => {
    const renderer = cellRenderers[headCell.id as string];
    return renderer ? renderer(row) : null;
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
      <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
        <EnhancedTableHead
          isInvitaliaUser={isInvitaliaUser}
          headCells={isInvitaliaUser ? headCellsInvitalia : headCellsProduttore}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          handleSelectAllClick={handleSelectAllClick}
          cellLeftSx={cellLeftSx}
          cellCenterSx={cellCenterSx}
          cellRightSx={cellRightSx}
        />
        <TableBody>
          {tableData.map((row, index) =>
            isInvitaliaUser ? (
              <InvitaliaRow
                key={index}
                row={row}
                index={index}
                selected={selected}
                user={user}
                handleCheckboxClick={handleCheckboxClick}
                handleListButtonClick={handleListButtonClick}
                getProducer={getProducer}
                emptyData={EMPTY_DATA}
              />
            ) : (
              <ProduttoreRow
                key={index}
                row={row}
                index={index}
                headCellsProduttore={headCellsProduttore}
                getCellSx={getCellSx}
                getCellContent={getCellContent}
                emptyData={EMPTY_DATA}
              />
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;