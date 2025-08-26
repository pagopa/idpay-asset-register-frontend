import { List, Divider, Box, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_DATA, MAX_LENGTH_DETAILL_PR, PRODUCTS_STATES } from '../../utils/constants';
import { truncateString } from '../../helpers';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { setApprovedStatusList, setRejectedStatusList } from '../../services/registerService';
import ProductConfirmDialog from './ProductConfirmDialog';
import ProductModal from './ProductModal';
import ProductInfoRow from './ProductInfoRow';
import ProductStatusChip from './ProductStatusChip';
import ProductActionButtons from './ProductActionButtons';

type Props = {
  open: boolean;
  data: ProductDTO;
  isInvitaliaUser: boolean;
  onUpdateTable?: () => void;
  onClose?: () => void;
};

const callApprovedApi = async (gtinCodes: Array<string>, status: string, motivation: string) => {
  try {
    await setApprovedStatusList(gtinCodes, status, motivation);
  } catch (error) {
    console.error(error);
  }
};

const callRejectedApi = async (gtinCodes: Array<string>, status: string, motivation: string) => {
  try {
    await setRejectedStatusList(gtinCodes, status, motivation);
  } catch (error) {
    console.error(error);
  }
};

const handleOpenModal = (
  action: string,
  gtinCodes: Array<string>,
  status: string,
  motivation: string
) => {
  if (action === PRODUCTS_STATES.REJECTED) {
    return callRejectedApi(gtinCodes, status, motivation);
  } else if (action === PRODUCTS_STATES.APPROVED) {
    return callApprovedApi(gtinCodes, status, motivation);
  }
  return Promise.resolve();
};

type ProductInfoRowVariant = 'body2' | 'body1' | undefined;
type ProductInfoValueVariant = 'h6' | 'body2' | undefined;

type RowConfig = {
  type?: 'row';
  label: string;
  value: string;
  labelVariant?: ProductInfoRowVariant;
  valueVariant?: ProductInfoValueVariant;
  sx?: any;
};

type DividerConfig = {
  type: 'divider';
};

function getProductInfoRowsConfig(data: ProductDTO, t: any): Array<RowConfig | DividerConfig> {
  const getValueOrEmpty = (field: unknown) =>
    field !== undefined && field !== null && field !== '' ? String(field) : EMPTY_DATA;

  const baseRows: Array<{
    label: string;
    dataKey: keyof ProductDTO | null;
    labelVariant?: ProductInfoRowVariant;
    valueVariant?: ProductInfoValueVariant;
    sx?: any;
    isTranslation?: boolean;
  }> = [
    {
      label: '',
      dataKey: 'productName',
      valueVariant: 'h6',
      sx: { mb: 1, maxWidth: 350, wordWrap: 'break-word' },
    },
    {
      label: '',
      dataKey: 'batchName',
      labelVariant: 'body2',
      valueVariant: 'body2',
    },
    {
      label: t('pages.productDetail.eprelCheckDate'),
      dataKey: 'registrationDate',
    },
    {
      label: '',
      dataKey: null,
      labelVariant: 'body2',
      valueVariant: 'body2',
      sx: { mt: 4, mb: 2 },
      isTranslation: true,
    },
    {
      label: t('pages.productDetail.eprelCode'),
      dataKey: 'eprelCode',
    },
    {
      label: t('pages.productDetail.gtinCode'),
      dataKey: 'gtinCode',
    },
    {
      label: t('pages.productDetail.productCode'),
      dataKey: 'productCode',
    },
    {
      label: t('pages.productDetail.category'),
      dataKey: 'category',
    },
    {
      label: t('pages.productDetail.brand'),
      dataKey: 'brand',
    },
    {
      label: t('pages.productDetail.model'),
      dataKey: 'model',
    },
    {
      label: t('pages.productDetail.energyClass'),
      dataKey: 'energyClass',
    },
    {
      label: t('pages.productDetail.countryOfProduction'),
      dataKey: 'countryOfProduction',
    },
    {
      label: t('pages.productDetail.capacity'),
      dataKey: 'capacity',
    },
  ];

  const mapBaseRowToRowConfig = (row: {
    label: string;
    dataKey: keyof ProductDTO | null;
    labelVariant?: ProductInfoRowVariant;
    valueVariant?: ProductInfoValueVariant;
    sx?: any;
    isTranslation?: boolean;
  }) => ({
    label: row.label,
    value: row.dataKey ? getValueOrEmpty(data[row.dataKey as keyof ProductDTO]) : '',
    labelVariant: row.labelVariant,
    valueVariant: row.valueVariant,
    sx: row.sx,
  });

  const firstTwoRows = baseRows.slice(0, 2).map(mapBaseRowToRowConfig);

  const divider: DividerConfig = { type: 'divider' };

  const dateRow: RowConfig = {
    label: baseRows[2].label,
    value: data?.registrationDate
      ? String(format(Number(data?.registrationDate), 'dd/MM/yyyy'))
      : EMPTY_DATA,
  };

  const productSheetRow: RowConfig = {
    label: '',
    value: t('pages.productDetail.productSheet'),
    labelVariant: 'body2',
    valueVariant: 'body2',
    sx: { mt: 4, mb: 2 },
  };

  const remainingRows = baseRows.slice(4).map(mapBaseRowToRowConfig);

  return [...firstTwoRows, divider, dateRow, productSheetRow, ...remainingRows];
}

type ProductInfoRowsProps = {
  data: ProductDTO;
  status: string;
  children?: React.ReactNode;
};

function ProductInfoRows({ data, status, children }: ProductInfoRowsProps) {
  const { t } = useTranslation();

  const baseRows = getProductInfoRowsConfig(data, t);

  const rows =
    status !== PRODUCTS_STATES.APPROVED
      ? [
          ...baseRows,
          {
            label: t('pages.productDetail.motivation'),
            value: (data as any)?.motivation || EMPTY_DATA,
            renderCustom: () => {
              const motivationValue = (data as any)?.motivation || EMPTY_DATA;
              const truncatedMotivation = truncateString(motivationValue, MAX_LENGTH_DETAILL_PR);
              return (
                <ProductInfoRow
                  label={t('pages.productDetail.motivation')}
                  value={
                    <Tooltip title={motivationValue} arrow>
                      <span>{truncatedMotivation}</span>
                    </Tooltip>
                  }
                />
              );
            },
          } as RowConfig & { renderCustom?: () => JSX.Element },
        ]
      : baseRows;

  return (
    <>
      {rows.map((row, idx) =>
        'type' in row && row.type === 'divider' ? (
          <Divider key={`divider-${idx}`} sx={{ mb: 2, fontWeight: '600', fontSize: '16px' }} />
        ) : (row as any).renderCustom ? (
          (row as any).renderCustom()
        ) : (
          <ProductInfoRow
            key={idx}
            label={(row as RowConfig).label}
            value={
              <Tooltip title={(row as RowConfig).value} arrow>
                <span>{truncateString((row as RowConfig).value, MAX_LENGTH_DETAILL_PR)}</span>
              </Tooltip>
            }
            labelVariant={(row as RowConfig).labelVariant}
            valueVariant={(row as RowConfig).valueVariant}
            sx={(row as RowConfig).sx}
          />
        )
      )}
      {children}
    </>
  );
}

export default function ProductDetail({ data, isInvitaliaUser, onUpdateTable, onClose }: Props) {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [excludeModalOpen, setExcludeModalOpen] = useState(false);
  const [supervisionModalOpen, setSupervisionModalOpen] = useState(false);

  const { t } = useTranslation();

  const handleConfirmRestore = async () => {
    await handleOpenModal(PRODUCTS_STATES.APPROVED, [data.gtinCode], '', EMPTY_DATA);
    setRestoreDialogOpen(false);
    if (typeof onUpdateTable === 'function') {
      onUpdateTable();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleExcludeClose = () => {
    setExcludeModalOpen(false);
    if (typeof onUpdateTable === 'function') {
      onUpdateTable();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleSupervisionClose = () => {
    setSupervisionModalOpen(false);
    if (typeof onUpdateTable === 'function') {
      onUpdateTable();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <Box sx={{ minWidth: 400, pl: 2 }} role="presentation" data-testid="product-detail">
      <List>
        <ProductStatusChip status={data.status} />
        <ProductInfoRows data={data} status={data.status || ''}>
          <ProductActionButtons
            isInvitaliaUser={isInvitaliaUser}
            status={data.status}
            onExclude={() => setExcludeModalOpen(true)}
            onSupervision={() => setSupervisionModalOpen(true)}
          />
        </ProductInfoRows>
      </List>
      <ProductConfirmDialog
        open={restoreDialogOpen}
        title={t('pages.productDetail.restoreProductTitle')}
        message={t('pages.productDetail.restoreProductMessage')}
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={handleConfirmRestore}
      />
      <ProductModal
        open={excludeModalOpen}
        onClose={handleExcludeClose}
        gtinCodes={[data.gtinCode]}
        productName={data.productName}
        actionType="rejected"
        status={''}
        onUpdateTable={onUpdateTable}
      />
      <ProductModal
        open={supervisionModalOpen}
        onClose={handleSupervisionClose}
        gtinCodes={[data.gtinCode]}
        productName={data.productName}
        actionType="supervisioned"
        status={''}
        onUpdateTable={onUpdateTable}
      />
    </Box>
  );
}
