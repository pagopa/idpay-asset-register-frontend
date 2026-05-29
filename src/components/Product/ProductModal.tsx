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
import useScopedTranslation from '../../hooks/useScopedTranslation';
import {
  setSupervisionedStatusList,
  setRejectedStatusList,
  setRestoredStatusList,
  setApprovedStatusList,
} from '../../services/registerService';
import { filterInputWithSpaceRule } from '../../helpers';
import { ProductStatus } from '../../api/generated/register';
import { DEBUG_CONSOLE, USERS_NAMES } from '../../utils/constants';
import {
  EMPTY_DATA,
  // L2_MOTIVATION_OK,
  MIN_LENGTH_TEXTFIELD_POPUP,
  MAX_LENGTH_TEXTFIELD_POPUP,
} from '../../utils/constants';

interface ProductModalProps {
  initiativeId: string;
  open: boolean;
  onClose: (cancelled?: boolean) => void;
  productName?: string;
  actionType: string;
  onUpdateTable?: () => void;
  selectedProducts?: Array<{
    status: ProductStatus;
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
  initiativeId,
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
  const { t } = useScopedTranslation();

  const renderMotivationField = () => {
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
          label={t(`invitaliaModal.${actionType}.reasonLabel`)}
          color="primary"
          fullWidth
          inputProps={{ maxLength: MAX_LENGTH_TEXTFIELD_POPUP }}
          value={motivationInternal}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setMotivationInternal(filterInputWithSpaceRule(e.target.value));
          }}
          onBlur={() => setMotivationTouched(true)}
          sx={modalStyles.textField}
          error={showError}
          id={showError ? 'outlined-error-helper-text' : undefined}
          helperText={helper}
        />
        <Box
          sx={modalStyles.charCounter}
        >{`${motivationInternal.length}/${MAX_LENGTH_TEXTFIELD_POPUP}`}</Box>
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
        <Typography sx={modalStyles.listTitle}>{t(`invitaliaModal.${actionType}.listTitleNoteUff`)}</Typography>
        <TextField
          required
          label={t(`invitaliaModal.${actionType}.reasonPlaceholderNoteUff`)}
          color="primary"
          fullWidth
          inputProps={{ maxLength: MAX_LENGTH_TEXTFIELD_POPUP }}
          value={motivationOfficial}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setMotivationOfficial(filterInputWithSpaceRule(e.target.value));
          }}
          onBlur={() => setMotivationOfficialTouched(true)}
          sx={modalStyles.textField}
          error={showError}
          id={showError ? 'outlined-error-helper-text-note-uff' : undefined}
          helperText={helper}
        />
        <Box
          sx={modalStyles.charCounter}
        >{`${motivationOfficial.length}/${MAX_LENGTH_TEXTFIELD_POPUP}`}</Box>
      </>
    );
  };

  if (!selectedProducts || selectedProducts.length === 0) {
    return null;
  }
  const gtinCodes = selectedProducts.map((p) => p.gtinCode);
  const status: ProductStatus = selectedProducts[0].status;

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
      await setSupervisionedStatusList(initiativeId, gtinCodes, status, motivationInternal);
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
      await setRejectedStatusList(initiativeId, gtinCodes, status, motivationInternal, motivationOfficial);
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
      await setRestoredStatusList(initiativeId, gtinCodes, status, motivationInternal);
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
      await setApprovedStatusList(initiativeId, gtinCodes, status, EMPTY_DATA);
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

  const apiConfig: {[key: typeof actionType]: () => void} = {
    supervised: callSupervisionedApi,
    rejected: callRejectedApi,
    acceptApprovation: callApprovedApi,
    rejectApprovation: callRestoredApi
  };

  const handleCloseWithUpdate = () => {
    onClose(true);
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(true)}
      PaperProps={{
        sx: modalStyles.dialogPaper,
      }}
    >
      <DialogTitle sx={modalStyles.dialogTitle}>{t(`invitaliaModal.${actionType}.title`) || ''}</DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Typography sx={modalStyles.descriptionText}>{t(`pages.invitaliaModal.${actionType}.description`, { user: USERS_NAMES.INVITALIA_L2 }) || ''}</Typography>
        <Typography sx={modalStyles.listTitle}>{t(`invitaliaModal.${actionType}.listTitle`) || ''}</Typography>
        {actionType !== "acceptApprovation" && (
          <>
            {renderMotivationField()}
            {actionType === "rejected" && renderMotivationNoteUffField()}
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
          {t(`invitaliaModal.${actionType}.buttonTextCancel`)}
        </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              ...buttonStyle,
            }}
            onClick={() => apiConfig?.[actionType] && apiConfig?.[actionType]()}
          >
            { actionType === "supervised" && <FlagIcon />}
            {t(`invitaliaModal.${actionType}.buttonTextConfirm`) + ` (${selectedProducts?.length})`}
          </Button>
        <IconButton aria-label="close" onClick={handleCloseWithUpdate} sx={modalStyles.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;
