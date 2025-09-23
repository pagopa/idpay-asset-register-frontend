import { List, Divider, Box, Tooltip, Typography, Button, SxProps, Theme } from '@mui/material';
import { TextareaAutosize } from '@mui/base';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FlagIcon from '@mui/icons-material/Flag';
import {
  EMPTY_DATA,
  // L1_MOTIVATION_OK,
  MAX_LENGTH_DETAILL_PR,
  MIDDLE_STATES,
  PRODUCTS_STATES,
  USERS_NAMES,
  USERS_TYPES,
} from '../../utils/constants';
import { fetchUserFromLocalStorage, truncateString } from '../../helpers';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { setRejectedStatusList, setWaitApprovedStatusList } from '../../services/registerService';
import { ProductStatusEnum } from '../../api/generated/register/ProductStatus';
import { DEBUG_CONSOLE } from '../../utils/constants';
import { statusChangeMessage } from '../../model/Product';
import ProductConfirmDialog from './ProductConfirmDialog';
import ProductModal from './ProductModal';
import ProductInfoRow from './ProductInfoRow';
import ProductStatusChip from './ProductStatusChip';

type Props = {
  open: boolean;
  data: ProductDTO;
  isInvitaliaUser: boolean;
  isInvitaliaAdmin: boolean;
  onUpdateTable?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
};
const callRejectedApi = async (
  gtinCodes: Array<string>,
  currentStatus: ProductStatusEnum,
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
  currentStatus: ProductStatusEnum,
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
  currentStatus: ProductStatusEnum,
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

function getProductInfoRowsConfig(data: ProductDTO, t: any): Array<RowConfig | DividerConfig> {
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
      ? String(format(Number(data?.registrationDate), 'dd/MM/yyyy'))
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
  currentStatus: ProductStatusEnum;
  children?: React.ReactNode;
};

function renderEntry(entry: any, idx: number) {
  const operator = entry?.role ? `${USERS_NAMES.OPERATORE} ${entry.role}` : USERS_NAMES.OPERATORE;
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
      <Tooltip
        title={
          <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
            {motivationText}
          </Box>
        }
        arrow
      >
        <Box component="span" sx={{ width: '100%' }}>
          <Typography variant="body1" color="text.secondary">
            {truncateString(header, MAX_LENGTH_DETAILL_PR)}
          </Typography>
          <TextareaAutosize
            maxRows={10}
            value={motivationText}
            readOnly
            aria-label="Motivazione"
            name="motivation"
            style={{
              width: '374px',
              boxSizing: 'border-box',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: '1rem',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              color: 'inherit',
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

function ProductInfoRows({ data, children }: ProductInfoRowsProps) {
  const { t } = useTranslation();
  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const baseRows = getProductInfoRowsConfig(data, t);

  const rows =
    user?.org_role !== USERS_TYPES.OPERATORE.toLowerCase() &&
    Boolean(data?.statusChangeChronology?.length)
      ? [
          ...baseRows,
          {
            renderCustom: () => {
              const chronology =
                ((data as any)?.statusChangeChronology as Array<statusChangeMessage>) || [];
              const filteredChronology = chronology.filter(
                (entry) => (entry?.motivation?.trim() || EMPTY_DATA) !== EMPTY_DATA
              );
              if (filteredChronology.length === 0) {
                return null;
              }
              return (
                <ProductInfoRow
                  label={t('pages.productDetail.motivation')}
                  labelVariant="overline"
                  sx={{ marginTop: 3, fontWeight: 700 }}
                  labelColor="#17324D"
                  value={
                    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                      {filteredChronology.map((entry, idx) => renderEntry(entry, idx))}
                    </Box>
                  }
                />
              );
            },
          } as RowConfig & { renderCustom?: () => JSX.Element },
          {
            renderCustom: () => {
              const chronology =
                ((data as any)?.statusChangeChronology as Array<statusChangeMessage>) || [];
              if (!chronology.length) {
                return null;
              }
              const entry = chronology[0];
              if (!entry) {
                return null;
              }
              const operator = entry?.role
                ? `${USERS_NAMES.OPERATORE} ${entry.role}`
                : USERS_NAMES.OPERATORE;
              const dateLabel = entry?.updateDate
                ? format(new Date(entry.updateDate), 'dd/MM/yyyy, HH:mm')
                : EMPTY_DATA;
              const formalMotivationText =
                data?.formalMotivation === undefined ||
                data?.formalMotivation === null ||
                (typeof data?.formalMotivation === 'string' && data?.formalMotivation.trim() === '')
                  ? EMPTY_DATA
                  : data?.formalMotivation;
              const header = `${operator} · ${dateLabel}`;

              return (
                <ProductInfoRow
                  label={t('pages.productDetail.motivationFormal')}
                  labelVariant="overline"
                  sx={{ marginTop: 3, fontWeight: 700 }}
                  labelColor="#17324D"
                  value={
                    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                      <Box key={`${header}-formal`} sx={{ mb: 2, width: '100%' }}>
                        <Tooltip
                          title={
                            <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
                              {formalMotivationText}
                            </Box>
                          }
                          arrow
                        >
                          <Box component="span" sx={{ width: '100%' }}>
                            <Typography variant="body1" color="text.secondary">
                              {truncateString(header, MAX_LENGTH_DETAILL_PR)}
                            </Typography>
                            <TextareaAutosize
                              maxRows={10}
                              value={formalMotivationText}
                              readOnly
                              aria-label="Motivazione formale"
                              name="formalMotivation"
                              style={{
                                width: '374px',
                                boxSizing: 'border-box',
                                resize: 'none',
                                fontFamily: 'inherit',
                                fontSize: '1rem',
                                fontWeight: 500,
                                background: 'transparent',
                                border: 'none',
                                color: 'inherit',
                              }}
                            />
                          </Box>
                        </Tooltip>
                      </Box>
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
            key={`row-${(row as RowConfig).label || idx}`}
            label={(row as RowConfig).label}
            value={
              <Tooltip title={(row as RowConfig).value} arrow>
                <span>{(row as RowConfig).value}</span>
              </Tooltip>
            }
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
  const { t } = useTranslation();

  const handleConfirmRestore = async () => {
    await handleOpenModal(
      PRODUCTS_STATES.APPROVED,
      [data.gtinCode],
      data.status as ProductStatusEnum,
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
      `}</style>
      <Box sx={{ minWidth: 400, pl: 2 }} role="presentation" data-testid="product-detail">
        <List>
          <ProductStatusChip status={data.status} />
          <ProductInfoRows data={data} currentStatus={data.status as ProductStatusEnum}>
            {isInvitaliaUser && String(data.status) === PRODUCTS_STATES.SUPERVISED && (
              <>
                <Box
                  mt={2}
                  display="flex"
                  flexDirection="column"
                  sx={{
                    width: '100%',
                    position: 'sticky',
                    bottom: 0,
                    background: '#fff',
                    zIndex: 2,
                    pt: 2,
                    pb: 2,
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
                </Box>
              </>
            )}
            {isInvitaliaUser && String(data.status) === PRODUCTS_STATES.UPLOADED && (
              <>
                <Box
                  mt={2}
                  display="flex"
                  flexDirection="column"
                  sx={{
                    width: '100%',
                    position: 'sticky',
                    bottom: 0,
                    background: '#fff',
                    zIndex: 2,
                    pt: 2,
                    pb: 2,
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
                </Box>
              </>
            )}
            {isInvitaliaAdmin && String(data.status) === PRODUCTS_STATES.WAIT_APPROVED && (
              <>
                <Box
                  mt={2}
                  mr={2}
                  display="flex"
                  flexDirection="column"
                  sx={{
                    width: '100%',
                    position: 'sticky',
                    bottom: 0,
                    background: '#fff',
                    zIndex: 2,
                    pt: 2,
                    pb: 2,
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
              status: data.status as ProductStatusEnum,
              productName: data.productName,
              gtinCode: data.gtinCode,
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
              status: data.status as ProductStatusEnum,
              productName: data.productName,
              gtinCode: data.gtinCode,
              category: data.category,
            },
          ]}
          onSuccess={handleSuccess}
        />
      </Box>
    </>
  );
}
