import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import { useTranslation } from 'react-i18next';
import {
  setSupervisionedStatusList,
  setRejectedStatusList,
  setRestoredStatusList,
  setApprovedStatusList,
} from '../../services/registerService';
import { ProductStatusEnum } from '../../api/generated/register/ProductStatus';
import { DEBUG_CONSOLE } from '../../utils/constants';
import {
  EMPTY_DATA,
  // L2_MOTIVATION_OK,
  MIDDLE_STATES,
  PRODUCTS_STATES,
  MIN_LENGTH_TEXTFIELD_POPUP,
  MAX_LENGTH_TEXTFIELD_POPUP,
} from '../../utils/constants';

interface ProductModalProps {
  open: boolean;
  onClose: (cancelled?: boolean) => void;
  productName?: string;
  actionType?: string;
  onUpdateTable?: () => void;
  selectedProducts?: Array<{
    status: ProductStatusEnum;
    productName?: string;
    gtinCode: string;
    category?: string;
  }>;
  onSuccess?: (actionType: string | undefined) => void;
}

const buttonStyle = {
  fontWeight: 600,
  fontSize: 16,
  paddingLeft: 8,
  paddingRight: 8,
};

const modalStyles = {
  dialogPaper: {
    width: 600,
    borderRadius: 4,
    padding: 4,
    background: '#FFFFFF',
    boxShadow: `
      0px 9px 46px 8px #002B551A,
      0px 24px 38px 3px #002B550D,
      0px 11px 15px -7px #002B551A
    `,
  },
  dialogTitle: {
    padding: 0,
    marginBottom: 2,
    fontFamily: 'Titillium Web',
    fontWeight: 700,
    fontSize: 24,
  },
  descriptionText: {
    marginBottom: 2,
    fontFamily: 'Titillium Web',
    fontWeight: 400,
    fontSize: 18,
    lineHeight: '24px',
  },
  listTitle: {
    fontFamily: 'Titillium Web',
    fontWeight: 600,
    fontSize: 18,
    marginBottom: 1,
  },
  productText: {
    fontFamily: 'Titillium Web',
    fontWeight: 400,
    fontSize: 18,
    marginBottom: 1,
  },
  reasonLabel: {
    fontFamily: 'Titillium Web',
    fontWeight: 600,
    fontSize: 18,
    lineHeight: '24px',
    marginBottom: 1,
  },
  textField: {
    marginBottom: 1,
  },
  charCounter: {
    display: 'flex',
    justifyContent: 'flex-end',
    fontFamily: 'Titillium Web',
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  dialogActions: {
    padding: 0,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    color: (theme: any) => theme.palette.grey[500],
  },
  buttonCancel: {
    height: 48,
    fontWeight: 600,
    fontSize: 16,
    marginRight: 2,
    gap: '16px',
  },
};

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  actionType,
  onUpdateTable,
  selectedProducts,
  onSuccess,
}) => {
  const [motivationInternal, setMotivationInternal] = useState('');
  const [motivationOfficial, setMotivationOfficial] = useState('');
  const [motivationTouched, setMotivationTouched] = useState(false);
  const [motivationOfficialTouched, setMotivationOfficialTouched] = useState(false);

  const isValidAlphanumeric = (value: string) => {
    const matches = value.match(/[a-zA-Z0-9]/g);
    return matches !== null && matches.length >= 2;
  };

  React.useEffect(() => {
    if (open) {
      setMotivationInternal('');
      setMotivationOfficial('');
      setMotivationTouched(false);
      setMotivationOfficialTouched(false);
    }
  }, [open]);
  const { t } = useTranslation();

  const renderMotivationField = (config: any) => {
    const showError =
      motivationTouched &&
      (motivationInternal.trim().length < MIN_LENGTH_TEXTFIELD_POPUP ||
        !isValidAlphanumeric(motivationInternal));
    const helper = motivationTouched
      ? motivationInternal.trim().length === 0
        ? 'Campo obbligatorio'
        : motivationInternal.trim().length < MIN_LENGTH_TEXTFIELD_POPUP
        ? `Inserire minimo ${MIN_LENGTH_TEXTFIELD_POPUP} caratteri`
        : !isValidAlphanumeric(motivationInternal)
        ? 'Inserire almeno 2 caratteri alfanumerici'
        : undefined
      : undefined;
    return (
      <>
        <TextField
          required
          label={config?.reasonLabel}
          color="primary"
          fullWidth
          inputProps={{ maxLength: MAX_LENGTH_TEXTFIELD_POPUP }}
          value={motivationInternal}
          onChange={(e) => {
            setMotivationInternal(e.target.value);
          }}
          onBlur={() => setMotivationTouched(true)}
          sx={modalStyles.textField}
          error={showError}
          id={showError ? 'outlined-error-helper-text' : undefined}
          helperText={helper}
        />
        <Box sx={modalStyles.charCounter}>{`${
          motivationInternal.length === 0 ? MIN_LENGTH_TEXTFIELD_POPUP : motivationInternal.length
        }/${MAX_LENGTH_TEXTFIELD_POPUP}`}</Box>
      </>
    );
  };

  const renderMotivationNoteUffField = () => {
    const showError =
      motivationOfficialTouched &&
      (motivationOfficial.trim().length < MIN_LENGTH_TEXTFIELD_POPUP ||
        !isValidAlphanumeric(motivationOfficial));
    const helper = motivationOfficialTouched
      ? motivationOfficial.trim().length === 0
        ? 'Campo obbligatorio'
        : motivationOfficial.trim().length < MIN_LENGTH_TEXTFIELD_POPUP
        ? `Inserire minimo ${MIN_LENGTH_TEXTFIELD_POPUP} caratteri`
        : !isValidAlphanumeric(motivationOfficial)
        ? 'Inserire almeno 2 caratteri alfanumerici'
        : undefined
      : undefined;
    return (
      <>
        <Typography sx={modalStyles.listTitle}>{MODAL_CONFIG.REJECTED.listTitleNoteUff}</Typography>
        <TextField
          required
          label={MODAL_CONFIG.REJECTED.reasonPlaceholderNoteUff}
          color="primary"
          fullWidth
          inputProps={{ maxLength: MAX_LENGTH_TEXTFIELD_POPUP }}
          value={motivationOfficial}
          onChange={(e) => {
            setMotivationOfficial(e.target.value);
          }}
          onBlur={() => setMotivationOfficialTouched(true)}
          sx={modalStyles.textField}
          error={showError}
          id={showError ? 'outlined-error-helper-text-note-uff' : undefined}
          helperText={helper}
        />
        <Box sx={modalStyles.charCounter}>{`${
          motivationOfficial.length === 0 ? MIN_LENGTH_TEXTFIELD_POPUP : motivationOfficial.length
        }/${MAX_LENGTH_TEXTFIELD_POPUP}`}</Box>
      </>
    );
  };

  const MODAL_CONFIG = {
    SUPERVISED: {
      title: t('invitaliaModal.supervised.title'),
      description: t('invitaliaModal.supervised.description'),
      listTitle: t('invitaliaModal.supervised.listTitle'),
      reasonLabel: t('invitaliaModal.supervised.reasonLabel'),
      reasonPlaceholder: t('invitaliaModal.supervised.reasonPlaceholder'),
      buttonText: t('invitaliaModal.supervised.buttonText'),
      buttonTextConfirm: t('invitaliaModal.supervised.buttonTextConfirm'),
      buttonTextCancel: t('invitaliaModal.supervised.buttonTextCancel'),
    },
    REJECTED: {
      title: t('invitaliaModal.rejected.title'),
      description: t('invitaliaModal.rejected.description'),
      listTitle: t('invitaliaModal.rejected.listTitle'),
      reasonLabel: t('invitaliaModal.rejected.reasonLabel'),
      reasonPlaceholder: t('invitaliaModal.rejected.reasonPlaceholder'),
      buttonText: t('invitaliaModal.rejected.buttonText'),
      listTitleNoteUff: t('invitaliaModal.rejected.listTitleNoteUff'),
      reasonPlaceholderNoteUff: t('invitaliaModal.rejected.reasonPlaceholderNoteUff'),
      buttonTextConfirm: t('invitaliaModal.rejected.buttonTextConfirm'),
      buttonTextCancel: t('invitaliaModal.rejected.buttonTextCancel'),
    },
    REJECT_APPROVATION: {
      title: t('invitaliaModal.rejectApprovation.title'),
      description: t('invitaliaModal.rejectApprovation.description'),
      listTitle: t('invitaliaModal.rejectApprovation.listTitle'),
      reasonLabel: t('invitaliaModal.rejectApprovation.reasonLabel'),
      reasonPlaceholder: t('invitaliaModal.rejectApprovation.reasonPlaceholder'),
      buttonText: t('invitaliaModal.rejectApprovation.buttonText'),
      buttonTextConfirm: t('invitaliaModal.rejectApprovation.buttonTextConfirm'),
      buttonTextCancel: t('invitaliaModal.rejectApprovation.buttonTextCancel'),
    },
    ACCEPT_APPROVATION: {
      title: t('invitaliaModal.acceptApprovation.title'),
      description: t('invitaliaModal.acceptApprovation.description'),
      listTitle: t('invitaliaModal.acceptApprovation.listTitle'),
      reasonLabel: t('invitaliaModal.acceptApprovation.reasonLabel'),
      reasonPlaceholder: t('invitaliaModal.acceptApprovation.reasonPlaceholder'),
      buttonText: t('invitaliaModal.acceptApprovation.buttonText'),
      buttonTextConfirm: t('invitaliaModal.acceptApprovation.buttonTextConfirm'),
      buttonTextCancel: t('invitaliaModal.acceptApprovation.buttonTextCancel'),
    },
  };

  const config = MODAL_CONFIG[actionType as keyof typeof MODAL_CONFIG];

  if (!selectedProducts || selectedProducts.length === 0) {
    return null;
  }
  const gtinCodes = selectedProducts.map((p) => p.gtinCode);
  const status: ProductStatusEnum = selectedProducts[0].status;

  const callSupervisionedApi = async () => {
    if (
      motivationInternal.trim().length < MIN_LENGTH_TEXTFIELD_POPUP ||
      !isValidAlphanumeric(motivationInternal)
    ) {
      setMotivationTouched(true);
      return;
    }
    try {
      onClose(false);
      await setSupervisionedStatusList(gtinCodes, status, motivationInternal);
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (typeof onSuccess === 'function') {
        onSuccess(actionType);
      }
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error(error);
      }
      onClose(false);
    }
  };

  const callRejectedApi = async () => {
    const isMotivationInternalInvalid =
      motivationInternal.trim().length < MIN_LENGTH_TEXTFIELD_POPUP ||
      !isValidAlphanumeric(motivationInternal);
    const isMotivationOfficialInvalid =
      motivationOfficial.trim().length < MIN_LENGTH_TEXTFIELD_POPUP ||
      !isValidAlphanumeric(motivationOfficial);
    if (isMotivationInternalInvalid || isMotivationOfficialInvalid) {
      if (isMotivationInternalInvalid) {
        setMotivationTouched(true);
      }
      if (isMotivationOfficialInvalid) {
        setMotivationOfficialTouched(true);
      }
      return;
    }
    try {
      onClose(false);
      await setRejectedStatusList(gtinCodes, status, motivationInternal, motivationOfficial);
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (typeof onSuccess === 'function') {
        onSuccess(actionType);
      }
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error(error);
      }
      onClose(false);
    }
  };

  const callRestoredApi = async () => {
    if (
      motivationInternal.trim().length < MIN_LENGTH_TEXTFIELD_POPUP ||
      !isValidAlphanumeric(motivationInternal)
    ) {
      setMotivationTouched(true);
      return;
    }
    try {
      onClose(false);
      await setRestoredStatusList(gtinCodes, status, motivationInternal);
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (typeof onSuccess === 'function') {
        onSuccess(actionType);
      }
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error(error);
      }
      onClose(false);
    }
  };

  const callApprovedApi = async () => {
    try {
      onClose(false);
      await setApprovedStatusList(gtinCodes, status, EMPTY_DATA);
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (typeof onSuccess === 'function') {
        onSuccess(actionType);
      }
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error(error);
      }
      onClose(false);
    }
  };

  const handleCloseWithUpdate = () => {
    onClose(true);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(true)}
      slotProps={{
        paper: {
          sx: modalStyles.dialogPaper,
        },
      }}
    >
      <DialogTitle sx={modalStyles.dialogTitle}>{config?.title || ''}</DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Typography sx={modalStyles.descriptionText}>{config?.description || ''}</Typography>
        <Typography sx={modalStyles.listTitle}>{config?.listTitle || ''}</Typography>
        {actionType !== MIDDLE_STATES.ACCEPT_APPROVATION && (
          <>
            {renderMotivationField(config)}
            {actionType === PRODUCTS_STATES.REJECTED && renderMotivationNoteUffField()}
          </>
        )}
      </DialogContent>
      <DialogActions sx={modalStyles.dialogActions}>
        <Button
          variant="outlined"
          onClick={handleCloseWithUpdate}
          color="primary"
          sx={modalStyles.buttonCancel}
        >
          {config?.buttonTextCancel}
        </Button>
        {actionType === PRODUCTS_STATES.SUPERVISED && (
          <Button
            variant="contained"
            color="primary"
            sx={{
              ...buttonStyle,
            }}
            onClick={callSupervisionedApi}
          >
            <FlagIcon /> {` ${config?.buttonTextConfirm} (${selectedProducts?.length})`}
          </Button>
        )}
        {actionType === PRODUCTS_STATES.REJECTED && (
          <Button
            variant="contained"
            color="primary"
            sx={{
              ...buttonStyle,
            }}
            onClick={callRejectedApi}
          >
            {` ${config?.buttonTextConfirm} (${selectedProducts?.length})`}
          </Button>
        )}
        {actionType === MIDDLE_STATES.REJECT_APPROVATION && (
          <Button
            variant="contained"
            color="primary"
            sx={{
              ...buttonStyle,
            }}
            onClick={callRestoredApi}
          >
            {` ${config?.buttonTextConfirm} (${selectedProducts?.length})`}
          </Button>
        )}
        {actionType === MIDDLE_STATES.ACCEPT_APPROVATION && (
          <Button
            variant="contained"
            color="primary"
            sx={{
              ...buttonStyle,
            }}
            onClick={callApprovedApi}
          >
            {` ${config?.buttonTextConfirm} (${selectedProducts?.length})`}
          </Button>
        )}
        <IconButton aria-label="close" onClick={handleCloseWithUpdate} sx={modalStyles.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;
