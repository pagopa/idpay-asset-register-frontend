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
import { useTranslation } from 'react-i18next';
import { setSupervisionedStatusList, setRejectedStatusList } from '../../services/registerService';
import { CurrentStatusEnum } from '../../api/generated/register/ProductsUpdateDTO';
import { MAX_LENGTH_DETAILL_PR, PRODUCTS_STATES } from '../../utils/constants';
import { truncateString } from '../../helpers';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  gtinCodes: Array<string>;
  productName?: string;
  actionType?: string;
  status: CurrentStatusEnum;
  onUpdateTable?: () => void;
  selectedProducts?: Array<{ productName?: string; gtinCode: string; category?: string }>;
}

const buttonStyle = {
  fontWeight: 600,
  fontSize: 16,
  paddingLeft: 8,
  paddingRight: 8,
  width: 85,
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
};

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  gtinCodes,
  productName,
  actionType,
  status,
  onUpdateTable,
  selectedProducts,
}) => {
  const [motivation, setReason] = useState('');
  React.useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open]);
  const { t } = useTranslation();

  const MODAL_CONFIG = {
    supervised: {
      title: t('invitaliaModal.supervised.title'),
      description: t('invitaliaModal.supervised.description'),
      listTitle: t('invitaliaModal.supervised.listTitle'),
      reasonLabel: t('invitaliaModal.supervised.reasonLabel'),
      reasonPlaceholder: t('invitaliaModal.supervised.reasonPlaceholder'),
      buttonText: t('invitaliaModal.supervised.buttonText'),
    },
    rejected: {
      title: t('invitaliaModal.rejected.title'),
      description: t('invitaliaModal.rejected.description'),
      listTitle: t('invitaliaModal.rejected.listTitle'),
      reasonLabel: t('invitaliaModal.rejected.reasonLabel'),
      reasonPlaceholder: t('invitaliaModal.rejected.reasonPlaceholder'),
      buttonText: t('invitaliaModal.rejected.buttonText'),
    },
  };

  const config = MODAL_CONFIG[actionType as keyof typeof MODAL_CONFIG];

  const callSupervisionedApi = async () => {
    try {
      await setSupervisionedStatusList(gtinCodes, status, motivation);
      onClose();
      if (onUpdateTable) {
        onUpdateTable();
      }
      if (onUpdateTable) {
        onUpdateTable();
      }
    } catch (error) {
      console.error(error);
      onClose();
    }
  };

  const callRejectedApi = async () => {
    try {
      onClose();
      await setRejectedStatusList(gtinCodes, status, motivation);
      if (onUpdateTable) {
        onUpdateTable();
      }
    } catch (error) {
      console.error(error);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Box sx={{ mb: 2 }}>
          {selectedProducts && selectedProducts.length > 0 ? (
            selectedProducts.map(
              (item: { productName?: string; gtinCode: string; category?: string }) => (
                <Typography key={item.gtinCode} sx={modalStyles.productText}>
                  {item.productName && item.productName.trim() !== ''
                    ? truncateString(item.productName, MAX_LENGTH_DETAILL_PR)
                    : `${item.category ? item.category + ' ' : ''}Codice GTIN/EAN ${item.gtinCode}`}
                </Typography>
              )
            )
          ) : (
            <Typography sx={modalStyles.productText}>
              {!productName || productName.trim() === ''
                ? `Codice GTIN/EAN ${gtinCodes.join(', ')}`
                : truncateString(productName, MAX_LENGTH_DETAILL_PR)}
            </Typography>
          )}
        </Box>
        <Typography sx={modalStyles.reasonLabel}>{config?.reasonLabel || ''}</Typography>
        <TextField
          fullWidth
          multiline
          label={config?.reasonLabel || ''}
          inputProps={{ maxLength: 200 }}
          placeholder={config?.reasonPlaceholder || ''}
          value={motivation}
          onChange={(e) => setReason(e.target.value)}
          sx={modalStyles.textField}
        />
        <Box sx={modalStyles.charCounter}>{motivation.length}/200</Box>
      </DialogContent>
      <DialogActions sx={modalStyles.dialogActions}>
        {actionType === PRODUCTS_STATES.SUPERVISED.toLowerCase() && (
          <Button
            variant="contained"
            color="primary"
            sx={{
              ...buttonStyle,
            }}
            onClick={callSupervisionedApi}
            disabled={motivation.length === 0}
          >
            {config?.buttonText || 'Chiudi'}
          </Button>
        )}
        {actionType === PRODUCTS_STATES.REJECTED.toLowerCase() && (
          <Button
            variant="contained"
            color="primary"
            sx={{
              ...buttonStyle,
            }}
            onClick={callRejectedApi}
            disabled={motivation.length === 0}
          >
            {config?.buttonText || 'Contrassegna'}
          </Button>
        )}
      </DialogActions>
      <IconButton
        aria-label="close"
        onClick={() => {
          onClose();
          if (onUpdateTable) {
            onUpdateTable();
          }
        }}
        sx={modalStyles.closeButton}
      >
        <CloseIcon />
      </IconButton>
    </Dialog>
  );
};

export default ProductModal;
