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
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';
import {useSelector} from "react-redux";
import EprelLinks from '../../components/Product/EprelLinks';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { INVITALIA } from '../../utils/constants';
import { fetchUserFromLocalStorage } from '../../helpers';
import EnhancedTableHead from '../../components/Product/EnhancedTableHead';
import {institutionListSelector} from "../../redux/slices/invitaliaSlice";
import {
  actionsCellSx,
  cellCenterSx,
  cellLeftSx, cellRightSx,
  checkboxCellSx,
  ProductsTableProps,
  renderUploadStatusIcon,
  rowTableSx
} from "./helpers";

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
  const isInvitaliaUser = user?.org_role === INVITALIA;
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
    }
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

  const getProducer = (organizationId: string): string | null => institutionsList?.find(
      (institutions: { institutionId: string }) => institutions.institutionId === organizationId
  )?.description ?? null;

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
      >
        <TableCell sx={checkboxCellSx}>
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
        <TableCell sx={cellLeftSx}>
          <Typography variant="body2">{row?.category ?? emptyData}</Typography>
        </TableCell>
        <TableCell sx={cellLeftSx}>
          <Typography variant="body2">{getProducer(row?.organizationId) ?? emptyData}</Typography>
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
        <TableCell sx={cellLeftSx}>
          {renderUploadStatusIcon(row?.status ?? emptyData ?? '')}
        </TableCell>
        <TableCell sx={actionsCellSx}>
          <ArrowForwardIosIcon
              sx={{
                cursor: 'pointer',
                color: '#0073E6',
              }}
              onClick={() => handleListButtonClick(row)}
          />
        </TableCell>
      </TableRow>
  );

  // eslint-disable-next-line sonarjs/cognitive-complexity
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

          const cellSx = (() => {
            if (headCell.id === 'actions') {
              return actionsCellSx;
            }
            return headCell.align === 'left'
                ? cellLeftSx
                : headCell.align === 'center'
                    ? cellCenterSx
                    : cellRightSx;
          })();

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