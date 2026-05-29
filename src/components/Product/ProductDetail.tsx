import React from 'react';
import { List, Divider, Box, Typography, Button, SxProps, Theme, Paper } from '@mui/material';
import { TextareaAutosize } from '@mui/base';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import FlagIcon from '@mui/icons-material/Flag';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import {
  EMPTY_DATA,
  // L1_MOTIVATION_OK,
  MIDDLE_STATES,
  PRODUCTS_STATES,
  USERS_TYPES,
} from '../../utils/constants';
import { fetchUserFromLocalStorage, truncateString } from '../../helpers';
import { setRejectedStatusList, setWaitApprovedStatusList } from '../../services/registerService';
import { DEBUG_CONSOLE } from '../../utils/constants';
import { statusChangeMessage } from '../../model/Product';
import { ProductDTO, ProductStatus } from '../../api/generated/register';
import ProductConfirmDialog from './ProductConfirmDialog';
import ProductModal from './ProductModal';
import ProductInfoRow from './ProductInfoRow';
import ProductStatusChip from './ProductStatusChip';

type Props = {
  open: boolean;
  data: ProductDTO;
  detailFields?: Array<ProductDetailFieldConfig>;
  isInvitaliaUser: boolean;
  isInvitaliaAdmin: boolean;
  onUpdateTable?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
};
const callRejectedApi = async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatus,
  motivation: string,
  formalMotivation: string
) => {
  try {
    await setRejectedStatusList(gtinCodes, currentStatus, motivation, formalMotivation);
  } catch (error) {
    if (DEBUG_CONSOLE) {
      console.error(error);
    }
  }
};

const callWaitApprovedApi = async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatus,
  motivation: string
) => {
  try {
    await setWaitApprovedStatusList(gtinCodes, currentStatus, motivation);
  } catch (error) {
    if (DEBUG_CONSOLE) {
      console.error(error);
    }
  }
};

const handleOpenModal = (
  action: string,
  gtinCodes: Array<string>,
  currentStatus: ProductStatus,
  motivation: string,
  formalMotivation: string
) => {
  if (action === PRODUCTS_STATES.REJECTED) {
    return callRejectedApi(gtinCodes, currentStatus, motivation, formalMotivation);
  } else if (action === PRODUCTS_STATES.APPROVED) {
    return callWaitApprovedApi(gtinCodes, currentStatus, motivation);
  }
  return Promise.resolve();
};

type ProductInfoRowVariant = 'body2' | 'body1' | undefined;
type ProductInfoValueVariant = 'h6' | 'body2' | undefined;

export type ProductDetailFieldConfig = {
  id: string;
  labelKey?: string;
};

type RowConfig = {
  type?: 'row';
  label: string;
  value: string;
  labelVariant?: ProductInfoRowVariant;
  valueVariant?: ProductInfoValueVariant;
  sx?: SxProps<Theme>;
};

type DividerConfig = {
  type: 'divider';
};

const mapBaseRowToRowConfig = (
  row: {
    label: string;
    dataKey: keyof ProductDTO | null;
    labelVariant?: ProductInfoRowVariant;
    valueVariant?: ProductInfoValueVariant;
    sx?: SxProps<Theme>;
    isTranslation?: boolean;
  },
  data: ProductDTO
) => ({
  label: row.label,
  value:
    row.dataKey &&
    data[row.dataKey as keyof ProductDTO] !== undefined &&
    data[row.dataKey as keyof ProductDTO] !== null &&
    data[row.dataKey as keyof ProductDTO] !== ''
      ? String(data[row.dataKey as keyof ProductDTO])
      : EMPTY_DATA,
  labelVariant: row.labelVariant,
  valueVariant: row.valueVariant,
  sx: row.sx,
});

const defaultDetailLabelKeys: Record<string, string> = {
  batchName: 'pages.productDetail.batchName',
  brand: 'pages.productDetail.brand',
  capacity: 'pages.productDetail.capacity',
  category: 'pages.productDetail.category',
  countryOfProduction: 'pages.productDetail.countryOfProduction',
  energyClass: 'pages.productDetail.energyClass',
  eprelCode: 'pages.productDetail.eprelCode',
  gtinCode: 'pages.productDetail.gtinCode',
  model: 'pages.productDetail.model',
  productCode: 'pages.productDetail.productCode',
  productName: 'pages.productDetail.productName',
  registrationDate: 'pages.productDetail.eprelCheckDate',
  status: 'pages.productDetail.status',
};

function mapDetailFieldToRowConfig(
  field: ProductDetailFieldConfig,
  data: ProductDTO,
  t: any
): RowConfig {
  const value = data[field.id as keyof ProductDTO];
  const hasValue = value !== undefined && value !== null && value !== '';

  return {
    label: t(field.labelKey ?? defaultDetailLabelKeys[field.id] ?? field.id),
    value:
      field.id === 'registrationDate' && hasValue
        ? String(format(new Date(String(value)), 'dd/MM/yyyy'))
        : hasValue
        ? String(value)
        : EMPTY_DATA,
    valueVariant: field.id === 'productName' ? 'h6' : undefined,
    sx:
      field.id === 'productName' || field.id === 'batchName'
        ? { mb: 1, maxWidth: 350, wordWrap: 'break-word' }
        : undefined,
  };
}

function getProductInfoRowsConfig(
  data: ProductDTO,
  t: any,
  detailFields?: Array<ProductDetailFieldConfig>
): Array<RowConfig | DividerConfig> {
  if (detailFields?.length) {
    return detailFields.map((field) => mapDetailFieldToRowConfig(field, data, t));
  }

  const baseRows: Array<{
    label: string;
    dataKey: keyof ProductDTO | null;
    labelVariant?: ProductInfoRowVariant;
    valueVariant?: ProductInfoValueVariant;
    sx?: SxProps<Theme>;
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

  const firstTwoRows = baseRows.slice(0, 2).map((row) => mapBaseRowToRowConfig(row, data));

  const divider: DividerConfig = { type: 'divider' };

  const dateRow: RowConfig = {
    label: baseRows[2].label,
    value: data?.registrationDate
      ? String(format(new Date(data?.registrationDate), 'dd/MM/yyyy'))
      : EMPTY_DATA,
  };

  const productSheetRow: RowConfig = {
    label: '',
    value: t('pages.productDetail.productSheet'),
    labelVariant: 'body2',
    valueVariant: 'body2',
    sx: { mt: 4, mb: 2, fontWeight: 700 },
  };

  const remainingRows = baseRows.slice(4).map((row) => mapBaseRowToRowConfig(row, data));

  return [...firstTwoRows, divider, dateRow, productSheetRow, ...remainingRows];
}

type ProductInfoRowsProps = {
  data: ProductDTO;
  detailFields?: Array<ProductDetailFieldConfig>;
  currentStatus: ProductStatus;
  children?: React.ReactNode;
};

function renderEntry(entry: any, idx: number, detailMaxLength: number) {
  const operator = entry?.role ? `Produttore ${entry.role}` : 'Produttore';
  const dateLabel = entry?.updateDate
    ? format(new Date(entry.updateDate), 'dd/MM/yyyy, HH:mm')
    : EMPTY_DATA;
  const motivationText = entry?.motivation?.trim() || EMPTY_DATA;
  const header = `${operator} · ${dateLabel}`;

  if (motivationText === EMPTY_DATA) {
    return null;
  }

  return (
    <Box key={`${header}-${idx}`} sx={{ mb: 2, width: '100%' }}>
      <Box component="span" sx={{ width: '100%' }}>
        <Typography variant="body1" color="textSecondary">
          {truncateString(header, detailMaxLength)}
        </Typography>
        <TextareaAutosize
          maxRows={10}
          value={motivationText}
          readOnly
          aria-label="Motivazione"
          name="motivation"
          className="product-detail-textarea"
        />
      </Box>
    </Box>
  );
}

function ProductInfoRows({ data, detailFields, children }: ProductInfoRowsProps) {
  const { t } = useScopedTranslation();
  const { config } = useInitiativeConfig();
  const detailMaxLength = config?.tables?.products?.style?.lengths?.detail ?? 40;
  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const baseRows = getProductInfoRowsConfig(data, t, detailFields);

  const chronology = ((data as any)?.statusChangeChronology as Array<statusChangeMessage>) || [];
  const filteredChronology = chronology.filter(
    (entry) => (entry?.motivation?.trim() || EMPTY_DATA) !== EMPTY_DATA
  );
  const hasMotivations = filteredChronology.length > 0;

  const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim() !== '';

  const formalMotivationText = isNonEmptyString((data as any)?.formalMotivation)
    ? (data as any).formalMotivation
    : EMPTY_DATA;

  const motivationRow =
    user?.org_role !== USERS_TYPES.OPERATORE && hasMotivations
      ? ({
          renderCustom(this: RowConfig) {
            return (
              <ProductInfoRow
                label={t('pages.productDetail.motivation')}
                labelVariant="overline"
                sx={{ marginTop: 3, fontWeight: 700 }}
                labelColor="#17324D"
                value={
                  <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                    {filteredChronology.map((entry, idx) =>
                      renderEntry(entry, idx, detailMaxLength)
                    )}
                  </Box>
                }
              />
            );
          },
        } as RowConfig & { renderCustom?: () => JSX.Element })
      : null;

  function isValidDateString(date: string | undefined): boolean {
    if (!date) {
      return false;
    }
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  function getFormalMotivationDateLabel(chronology: Array<any>) {
    try {
      const rejectedEntry = chronology.find(
        (entry: any) => entry?.targetStatus === 'REJECTED' && isValidDateString(entry?.updateDate)
      );
      if (rejectedEntry) {
        return format(new Date(rejectedEntry.updateDate), 'dd/MM/yyyy, HH:mm');
      }
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.log('getFormalMotivationDateLabel error:', error);
      }
    }
    return EMPTY_DATA;
  }

  function getFormalMotivationOperator(user: any, chronology: Array<any>) {
    if (user?.org_role !== USERS_TYPES.OPERATORE) {
      return chronology[0]?.role ? `Produttore ${chronology[0].role}` : 'Produttore';
    }
    return '';
  }

  function getFormalMotivationHeader(user: any, dateLabel: string, operator: string) {
    if (user?.org_role !== USERS_TYPES.OPERATORE) {
      return dateLabel !== EMPTY_DATA ? `${operator} · ${dateLabel}` : operator;
    }
    return dateLabel !== EMPTY_DATA ? `${dateLabel}` : EMPTY_DATA;
  }

  function displayFormalMotivation(org_role?: string, status?: string) {
    return (
      !(
        formalMotivationText === EMPTY_DATA ||
        formalMotivationText === undefined ||
        formalMotivationText === null ||
        formalMotivationText === ''
      ) &&
      ((org_role === USERS_TYPES.OPERATORE && String(status) === PRODUCTS_STATES.REJECTED) ||
        org_role !== USERS_TYPES.OPERATORE)
    );
  }

  const formalMotivationRow = !displayFormalMotivation(user?.org_role, data.status)
    ? null
    : ({
        renderCustom(this: RowConfig) {
          const dateLabel = getFormalMotivationDateLabel(chronology);
          const operator = getFormalMotivationOperator(user, chronology);
          const header = getFormalMotivationHeader(user, dateLabel, operator);

          return (
            <ProductInfoRow
              label={t('pages.productDetail.motivationFormal')}
              labelVariant="overline"
              sx={{ marginTop: 3, fontWeight: 700 }}
              labelColor="#17324D"
              value={
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box key={`${header}-formal`} sx={{ mb: 2, width: '100%' }}>
                    <Box component="span" sx={{ width: '100%' }}>
                      {header && header.trim() !== '' && (
                        <Typography variant="body1" color="textSecondary">
                          {truncateString(header, detailMaxLength)}
                        </Typography>
                      )}
                      <TextareaAutosize
                        maxRows={10}
                        value={formalMotivationText}
                        readOnly
                        aria-label="Motivazione formale"
                        name="formalMotivation"
                        className="product-detail-textarea"
                      />
                    </Box>
                  </Box>
                </Box>
              }
            />
          );
        },
      } as RowConfig & { renderCustom?: () => JSX.Element });

  const extraRows = [
    ...(motivationRow ? [motivationRow] : []),
    ...(formalMotivationRow ? [formalMotivationRow] : []),
  ];

  const rows = [...baseRows, ...extraRows];

  return (
    <>
      {rows.map((row, idx) =>
        'type' in row && row.type === 'divider' ? (
          <Divider key={`divider-${idx}`} sx={{ mb: 2, fontWeight: '600', fontSize: '16px' }} />
        ) : (row as any).renderCustom ? (
          <React.Fragment key={`custom-${idx}`}>{(row as any).renderCustom()}</React.Fragment>
        ) : (
          <ProductInfoRow
            key={`row-${idx}-${(row as RowConfig).label}`}
            label={(row as RowConfig).label}
            value={<span>{(row as RowConfig).value}</span>}
            labelVariant={(row as RowConfig).labelVariant}
            valueVariant={(row as RowConfig).valueVariant}
            sx={(row as RowConfig).sx != null ? ((row as RowConfig).sx as object) : undefined}
          />
        )
      )}
      {children}
    </>
  );
}

type ProductDetailProps = Props & {
  onShowApprovedMsg?: () => void;
  onShowRejectedMsg: () => void;
  onShowWaitApprovedMsg?: () => void;
  onShowSupervisedMsg?: () => void;
  onShowRejectedApprovationMsg?: () => void;
  onShowAcceptApprovationMsg?: () => void;
};

export default function ProductDetail({
  data,
  detailFields,
  isInvitaliaUser,
  isInvitaliaAdmin,
  onUpdateTable,
  onClose,
  onShowApprovedMsg,
  onShowRejectedMsg,
  onShowWaitApprovedMsg,
  onShowSupervisedMsg,
  onShowRejectedApprovationMsg,
  onShowAcceptApprovationMsg,
}: ProductDetailProps) {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [excludeModalOpen, setExcludeModalOpen] = useState(false);
  const [supervisionModalOpen, setSupervisionModalOpen] = useState(false);
  const { t } = useScopedTranslation();

  const handleConfirmRestore = async () => {
    await handleOpenModal(
      PRODUCTS_STATES.APPROVED,
      [data.gtinCode ?? ''],
      data.status as ProductStatus,
      EMPTY_DATA,
      EMPTY_DATA
    );
    setRestoreDialogOpen(false);
    if (typeof onUpdateTable === 'function') {
      onUpdateTable();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
    if (typeof onShowWaitApprovedMsg === 'function') {
      onShowWaitApprovedMsg();
    } else if (typeof onShowApprovedMsg === 'function') {
      onShowApprovedMsg();
    }
  };

  const handleModalClose = (
    setModalOpen: (open: boolean) => void,
    showRejectedMsg?: boolean,
    confirmed?: boolean
  ) => {
    setModalOpen(false);
    if (typeof onUpdateTable === 'function') {
      onUpdateTable();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
    if (showRejectedMsg && confirmed && typeof onShowRejectedMsg === 'function') {
      onShowRejectedMsg();
    }
  };

  const resetAllMsgs = () => {};

  const setMsgByActionType = (actionType?: string) => {
    if (actionType === PRODUCTS_STATES.SUPERVISED && typeof onShowSupervisedMsg === 'function') {
      onShowSupervisedMsg();
      return;
    }
    if (actionType === PRODUCTS_STATES.REJECTED && typeof onShowRejectedMsg === 'function') {
      onShowRejectedMsg();
      return;
    }
    if (
      actionType === PRODUCTS_STATES.WAIT_APPROVED &&
      typeof onShowWaitApprovedMsg === 'function'
    ) {
      onShowWaitApprovedMsg();
      return;
    }
    if (
      actionType === MIDDLE_STATES.REJECT_APPROVATION &&
      typeof onShowRejectedApprovationMsg === 'function'
    ) {
      onShowRejectedApprovationMsg();
      return;
    }
    if (
      actionType === MIDDLE_STATES.ACCEPT_APPROVATION &&
      typeof onShowAcceptApprovationMsg === 'function'
    ) {
      onShowAcceptApprovationMsg();
    }
  };

  const handleSuccess = (actionType?: string) => {
    if (
      typeof onShowApprovedMsg === 'function' ||
      typeof onShowRejectedMsg === 'function' ||
      typeof onShowWaitApprovedMsg === 'function' ||
      typeof onShowSupervisedMsg === 'function' ||
      typeof onShowRejectedApprovationMsg === 'function' ||
      typeof onShowAcceptApprovationMsg === 'function'
    ) {
      resetAllMsgs();
      setMsgByActionType(actionType);
    }
  };

  const handleExcludeClick = () => {
    setExcludeModalOpen(true);
  };

  return (
    <>
      <style>{`
        .btn-approve {
          font-weight: 600 !important;
          font-size: 16px !important;
          width: 100% !important;
          margin-bottom: 16px !important;
        }
        .btn-exclude {
          font-weight: 600 !important;
          font-size: 16px !important;
          width: 100% !important;
          margin-bottom: 16px !important;
        }
        .product-detail-textarea {
          width: 374px;
          box-sizing: border-box;
          resize: none;
          font-family: 'Titillium Web';
          font-weight: 600;
          font-style: SemiBold;
          font-size: 18px;
          line-height: 24px;
          letter-spacing: 0px;
          background: transparent;
          border: none;
          color: inherit;
        }
      `}</style>
      <Box
        sx={{
          minWidth: 400,
          pl: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
        role="presentation"
        data-testid="product-detail"
      >
        <Box sx={{ flex: '1 1 0', overflowY: 'auto' }}>
          <List>
            <ProductStatusChip status={data.status} />
            <ProductInfoRows
              data={data}
              detailFields={detailFields}
              currentStatus={data.status as ProductStatus}
            />
          </List>
        </Box>
        {isInvitaliaUser && String(data.status) === PRODUCTS_STATES.SUPERVISED && (
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              pt: 2,
              pb: 2,
              pr: 2,
              display: 'flex',
              flexDirection: 'column',
              background: '#fff',
            }}
          >
            <Button
              data-testid="acceptApprovationBtn"
              color="primary"
              variant="contained"
              className="btn-approve"
              onClick={() => setRestoreDialogOpen(true)}
            >
              {t('invitaliaModal.waitApproved.buttonTextConfirm')}
            </Button>
            <Button
              data-testid="rejectApprovationBtn"
              color="error"
              className="btn-exclude"
              variant="outlined"
              onClick={handleExcludeClick}
            >
              {t('invitaliaModal.rejected.buttonTextConfirm')}
            </Button>
          </Paper>
        )}
        {isInvitaliaUser && String(data.status) === PRODUCTS_STATES.UPLOADED && (
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              pt: 2,
              pb: 2,
              pr: 2,
              display: 'flex',
              flexDirection: 'column',
              background: '#fff',
            }}
          >
            <Button
              data-testid="approvedBtn"
              color="primary"
              variant="contained"
              className="btn-approve"
              onClick={() => setRestoreDialogOpen(true)}
            >
              {t('invitaliaModal.waitApproved.buttonText')}
            </Button>
            <Button
              data-testid="supervisedBtn"
              color="primary"
              variant="outlined"
              className="btn-exclude"
              onClick={() => {
                setSupervisionModalOpen(true);
              }}
            >
              <FlagIcon /> {t('invitaliaModal.supervised.buttonText')}
            </Button>
            <Button
              data-testid="rejectedBtn"
              color="error"
              className="btn-exclude"
              variant="outlined"
              onClick={handleExcludeClick}
            >
              {t('invitaliaModal.rejected.buttonText')}
            </Button>
          </Paper>
        )}
        {isInvitaliaAdmin && String(data.status) === PRODUCTS_STATES.WAIT_APPROVED && (
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              pt: 2,
              pb: 2,
              pr: 2,
              display: 'flex',
              flexDirection: 'column',
              background: '#fff',
            }}
          >
            <Button
              data-testid="supervisedBtn"
              color="primary"
              variant="contained"
              className="btn-approve"
              onClick={() => setSupervisionModalOpen(true)}
            >
              {t('invitaliaModal.waitApproved.buttonText')}
            </Button>
            <Button
              data-testid="rejectedBtn"
              color="error"
              className="btn-exclude"
              variant="outlined"
              onClick={handleExcludeClick}
            >
              {t('invitaliaModal.rejectApprovation.buttonText')}
            </Button>
          </Paper>
        )}

        <ProductConfirmDialog
          open={restoreDialogOpen}
          cancelButtonText={t('invitaliaModal.waitApproved.buttonTextCancel')}
          confirmButtonText={t('invitaliaModal.waitApproved.buttonTextConfirm')}
          title={t('invitaliaModal.waitApproved.listTitle')}
          message={t('invitaliaModal.waitApproved.description', {
            L2: 'L2',
          })}
          onCancel={() => setRestoreDialogOpen(false)}
          onConfirm={handleConfirmRestore}
          onSuccess={handleSuccess}
        />

        <ProductModal
          open={supervisionModalOpen}
          onClose={(cancelled) => {
            setSupervisionModalOpen(false);
            if (!cancelled) {
              if (typeof onUpdateTable === 'function') {
                onUpdateTable();
              }
              if (typeof onClose === 'function') {
                onClose();
              }
            }
          }}
          actionType={
            isInvitaliaUser ? PRODUCTS_STATES.SUPERVISED : MIDDLE_STATES.ACCEPT_APPROVATION
          }
          onUpdateTable={onUpdateTable}
          selectedProducts={[
            {
              status: data.status as ProductStatus,
              productName: data.productName,
              gtinCode: data.gtinCode ?? '',
              category: data.category,
            },
          ]}
          onSuccess={() =>
            handleSuccess(
              isInvitaliaUser ? PRODUCTS_STATES.SUPERVISED : MIDDLE_STATES.ACCEPT_APPROVATION
            )
          }
        />
        <ProductModal
          open={excludeModalOpen}
          onClose={() => handleModalClose(setExcludeModalOpen, true)}
          actionType={isInvitaliaUser ? PRODUCTS_STATES.REJECTED : MIDDLE_STATES.REJECT_APPROVATION}
          onUpdateTable={onUpdateTable}
          selectedProducts={[
            {
              status: data.status as ProductStatus,
              productName: data.productName,
              gtinCode: data.gtinCode ?? '',
              category: data.category,
            },
          ]}
          onSuccess={() =>
            handleSuccess(
              isInvitaliaUser ? PRODUCTS_STATES.REJECTED : MIDDLE_STATES.REJECT_APPROVATION
            )
          }
        />
      </Box>
    </>
  );
}
