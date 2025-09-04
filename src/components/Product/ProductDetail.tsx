import { List, Divider, Box, Tooltip, Typography, Button } from '@mui/material';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FlagIcon from '@mui/icons-material/Flag';
import {
  EMPTY_DATA,
  MAX_LENGTH_DETAILL_PR,
  PRODUCTS_STATES,
  USERS_NAMES,
  USERS_TYPES,
} from '../../utils/constants';
import { fetchUserFromLocalStorage, truncateString } from '../../helpers';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { setRejectedStatusList, setWaitApprovedStatusList } from '../../services/registerService';
import { ProductStatusEnum } from '../../api/generated/register/ProductStatus';
import { statusChangeMessage } from '../../model/Product';
import ProductConfirmDialog from './ProductConfirmDialog';
import ProductModal from './ProductModal';
import ProductInfoRow from './ProductInfoRow';
import ProductStatusChip from './ProductStatusChip';

type Props = {
  open: boolean;
  data: ProductDTO;
  isInvitaliaUser: boolean;
  onUpdateTable?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
};
{
  /* TODO for L2 
const callApprovedApi = async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
  motivation: string
) => {
  try {
    await setApprovedStatusList(gtinCodes, currentStatus, motivation);
  } catch (error) {
    console.error(error);
  }
};
*/
}

const callRejectedApi = async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
  motivation: string
) => {
  try {
    await setRejectedStatusList(gtinCodes, currentStatus, motivation);
  } catch (error) {
    console.error(error);
  }
};

const callWaitApprovedApi = async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
  motivation: string
) => {
  try {
    await setWaitApprovedStatusList(gtinCodes, currentStatus, motivation);
  } catch (error) {
    console.error(error);
  }
};

const handleOpenModal = (
  action: string,
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
  motivation: string
) => {
  if (action === PRODUCTS_STATES.REJECTED) {
    return callRejectedApi(gtinCodes, currentStatus, motivation);
  } else if (action === PRODUCTS_STATES.APPROVED) {
    return callWaitApprovedApi(gtinCodes, currentStatus, motivation);
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
  currentStatus: ProductStatusEnum;
  children?: React.ReactNode;
};

function ProductInfoRows({ data, children }: ProductInfoRowsProps) {
  const { t } = useTranslation();
  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const baseRows = getProductInfoRowsConfig(data, t);

  const rows =
    user?.org_role !== USERS_TYPES.OPERATORE && Boolean(data?.statusChangeChronology?.length)
      ? [
          ...baseRows,
          {
            renderCustom: () => {
              const chronology =
                ((data as any)?.statusChangeChronology as Array<statusChangeMessage>) || [];

              const renderEntry = (entry: any, idx: number) => {
                const operator = entry?.role ? `operatore ${entry.role}` : 'operatore';
                const dateLabel = entry?.updateDate
                  ? format(new Date(entry.updateDate), 'dd/MM/yyyy, HH:mm')
                  : EMPTY_DATA;
                const motivationText = entry?.motivation?.trim() || EMPTY_DATA;
                const header = `${operator} · ${dateLabel}`;

                return (
                  <Box key={`${header}-${idx}`} sx={{ mb: 2 }}>
                    <Tooltip
                      title={
                        <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
                          {motivationText}
                        </Box>
                      }
                      arrow
                    >
                      <Box component="span">
                        <Typography variant="body1" color="text.secondary">
                          {truncateString(header, MAX_LENGTH_DETAILL_PR)}
                        </Typography>
                        <Typography variant="body2" fontWeight="fontWeightMedium">
                          {truncateString(motivationText, MAX_LENGTH_DETAILL_PR)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                );
              };

              return (
                <ProductInfoRow
                  label={t('pages.productDetail.motivation')}
                  labelVariant="overline"
                  sx={{ marginTop: 3 }}
                  value={
                    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                      {chronology.map(renderEntry)}
                    </Box>
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
    await handleOpenModal(
      PRODUCTS_STATES.APPROVED,
      [data.gtinCode],
      data.status as ProductStatusEnum,
      EMPTY_DATA
    );
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
        <ProductInfoRows data={data} currentStatus={data.status as ProductStatusEnum}>
          {isInvitaliaUser && String(data.status) === PRODUCTS_STATES.SUPERVISED && (
            <>
              <Box mt={2} display="flex" flexDirection="column" sx={{ width: '100%' }}>
                <Button
                  color="primary"
                  variant="contained"
                  sx={{
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 2,
                    width: '100%',
                  }}
                  data-testid="request-approval-btn"
                  onClick={() => setRestoreDialogOpen(true)}
                >
                  {t('invitaliaModal.waitApproved.buttonText')}
                </Button>
                <Button
                  color="error"
                  sx={{
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 2,
                    width: '100%',
                  }}
                  data-testid="exclude-btn"
                  onClick={() => setExcludeModalOpen(true)}
                >
                  {t('invitaliaModal.rejected.buttonText')}
                </Button>
              </Box>
            </>
          )}
          {isInvitaliaUser && String(data.status) === PRODUCTS_STATES.UPLOADED && (
            <>
              <Box mt={2} display="flex" flexDirection="row" gap={2} sx={{ width: '100%' }}>
                <Button
                  data-testid="rejectedBtn"
                  variant="outlined"
                  color="error"
                  sx={{ fontWeight: 600, fontSize: 16, width: '100%' }}
                  onClick={() => setExcludeModalOpen(true)}
                >
                  {t('invitaliaModal.rejected.buttonText')}
                </Button>
                <Button
                  data-testid="supervisedBtn"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: 16, width: '100%' }}
                  onClick={() => setSupervisionModalOpen(true)}
                >
                  <FlagIcon /> {t('invitaliaModal.supervised.buttonText')}
                </Button>
                <Button
                  data-testid="approvedBtn"
                  color="primary"
                  variant="contained"
                  sx={{ fontWeight: 600, fontSize: 16, width: '100%' }}
                  onClick={() => setRestoreDialogOpen(true)}
                >
                  {t('invitaliaModal.waitApproved.buttonText')}
                </Button>
              </Box>
            </>
          )}
        </ProductInfoRows>
      </List>

      <ProductConfirmDialog
        open={restoreDialogOpen}
        cancelButtonText={t('invitaliaModal.waitApproved.buttonTextCancel')}
        confirmButtonText={t('invitaliaModal.waitApproved.buttonTextConfirm')}
        title={t('invitaliaModal.waitApproved.listTitle')}
        message={t('invitaliaModal.waitApproved.description', {
          L2: USERS_NAMES.INVITALIA_L2,
        })}
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={handleConfirmRestore}
      />
      <ProductModal
        open={supervisionModalOpen}
        onClose={handleSupervisionClose}
        actionType={PRODUCTS_STATES.SUPERVISED}
        onUpdateTable={onUpdateTable}
        selectedProducts={[
          {
            status: data.status as ProductStatusEnum,
            productName: data.productName,
            gtinCode: data.gtinCode,
            category: data.category,
          },
        ]}
      />
      <ProductModal
        open={excludeModalOpen}
        onClose={handleExcludeClose}
        actionType={PRODUCTS_STATES.REJECTED}
        onUpdateTable={onUpdateTable}
        selectedProducts={[
          {
            status: data.status as ProductStatusEnum,
            productName: data.productName,
            gtinCode: data.gtinCode,
            category: data.category,
          },
        ]}
      />
    </Box>
  );
}
