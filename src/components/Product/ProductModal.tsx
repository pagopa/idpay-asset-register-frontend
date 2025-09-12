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
import { L2_MOTIVATION_OK, MIDDLE_STATES, PRODUCTS_STATES } from '../../utils/constants';

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
  const [motivation, setReason] = useState('');
  const [motivationTouched, setMotivationTouched] = useState(false);
  React.useEffect(() => {
    if (open) {
      setReason('');
      setMotivationTouched(false);
    }
  }, [open]);
  const { t } = useTranslation();

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
    if (!motivation.trim()) {
      setMotivationTouched(true);
      return;
    }
    try {
      onClose(false);
      await setSupervisionedStatusList(gtinCodes, status, motivation);
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (typeof onSuccess === 'function') {
        onSuccess(actionType);
      }
    } catch (error) {
      console.error(error);
      onClose(false);
    }
  };

  const callRejectedApi = async () => {
    if (!motivation.trim()) {
      setMotivationTouched(true);
      return;
    }
    try {
      onClose(false);
      await setRejectedStatusList(gtinCodes, status, motivation);
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (typeof onSuccess === 'function') {
        onSuccess(actionType);
      }
    } catch (error) {
      console.error(error);
      onClose(false);
    }
  };

  const callRestoredApi = async () => {
    if (!motivation.trim()) {
      setMotivationTouched(true);
      return;
    }
    try {
      onClose(false);
      await setRestoredStatusList(gtinCodes, status, motivation);
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (typeof onSuccess === 'function') {
        onSuccess(actionType);
      }
    } catch (error) {
      console.error(error);
      onClose(false);
    }
  };

  const callApprovedApi = async () => {
    try {
      onClose(false);
      await setApprovedStatusList(gtinCodes, status, L2_MOTIVATION_OK);
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (typeof onSuccess === 'function') {
        onSuccess(actionType);
      }
    } catch (error) {
      console.error(error);
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
            <TextField
              required
              label={config?.reasonLabel}
              color="primary"
              fullWidth
              inputProps={{ maxLength: 200 }}
              value={motivation}
              onChange={(e) => {
                setReason(e.target.value);
              }}
              onBlur={() => setMotivationTouched(true)}
              sx={modalStyles.textField}
              error={motivationTouched && !motivation.trim()}
              id={
                motivationTouched && !motivation.trim() ? 'outlined-error-helper-text' : undefined
              }
              helperText={
                motivationTouched && !motivation.trim() ? 'Campo obbligatorio' : undefined
              }
            />
            <Box sx={modalStyles.charCounter}>{motivation.length}/200</Box>
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
