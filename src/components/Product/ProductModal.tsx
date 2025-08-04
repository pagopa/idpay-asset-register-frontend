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
import { MAX_LENGTH_DETAILL_PR } from '../../utils/constants';
import { truncateString } from '../../helpers';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  gtinCodes: Array<string>;
  productName?: string;
  actionType?: string;
  organizationId: string;
  onUpdateTable?: () => void;
  selectedProducts?: Array<{ productName?: string; gtinCode: string; category?: string }>;
}

const buttonStyle = {
  fontWeight: 600,
  fontSize: 16,
  paddingLeft: 8,
  paddingRight: 8,
  marginRight: 2,
  width: 85,
};

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  gtinCodes,
  productName,
  actionType,
  organizationId,
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
    supervisioned: {
      title: t('invitaliaModal.supervisioned.title'),
      description: t('invitaliaModal.supervisioned.description'),
      listTitle: t('invitaliaModal.supervisioned.listTitle'),
      reasonLabel: t('invitaliaModal.supervisioned.reasonLabel'),
      reasonPlaceholder: t('invitaliaModal.supervisioned.reasonPlaceholder'),
      buttonText: t('invitaliaModal.supervisioned.buttonText'),
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
      await setSupervisionedStatusList(organizationId, gtinCodes, motivation);
      onClose();
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
      await setRejectedStatusList(organizationId, gtinCodes, motivation);
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
          sx: {
            width: 600,
            height: 557,
            borderRadius: 4,
            p: 4,
            background: '#FFFFFF',
            boxShadow: `
              0px 9px 46px 8px #002B551A,
              0px 24px 38px 3px #002B550D,
              0px 11px 15px -7px #002B551A
            `,
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 0, mb: 2, fontFamily: 'Titillium Web', fontWeight: 700, fontSize: 24 }}>
        {config?.title || ''}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Typography
          sx={{
            mb: 2,
            fontFamily: 'Titillium Web',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '24px',
          }}
        >
          {config?.description || ''}
        </Typography>
        <Typography sx={{ fontFamily: 'Titillium Web', fontWeight: 600, fontSize: 18, mb: 1 }}>
          {config?.listTitle || ''}
        </Typography>
        <Box sx={{ mb: 2 }}>
          {selectedProducts && selectedProducts.length > 0 ? (
            selectedProducts.map(
              (item: { productName?: string; gtinCode: string; category?: string }) => (
                <Typography
                  key={item.gtinCode}
                  sx={{
                    fontFamily: 'Titillium Web',
                    fontWeight: 400,
                    fontSize: 18,
                    mb: 1,
                  }}
                >
                  {item.productName && item.productName.trim() !== ''
                    ? truncateString(item.productName, MAX_LENGTH_DETAILL_PR)
                    : `${item.category ? item.category + ' ' : ''}Codice GTIN/EAN ${item.gtinCode}`}
                </Typography>
              )
            )
          ) : (
            <Typography
              sx={{
                fontFamily: 'Titillium Web',
                fontWeight: 400,
                fontSize: 18,
                mb: 1,
              }}
            >
              {!productName || productName.trim() === ''
                ? `Codice GTIN/EAN ${gtinCodes.join(', ')}`
                : truncateString(productName, MAX_LENGTH_DETAILL_PR)}
            </Typography>
          )}
        </Box>
        <Typography
          sx={{
            fontFamily: 'Titillium Web',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '24px',
            mb: 1,
          }}
        >
          {config?.reasonLabel || ''}
        </Typography>
        <TextField
          fullWidth
          multiline
          label={config?.reasonLabel || ''}
          inputProps={{ maxLength: 200 }}
          placeholder={config?.reasonPlaceholder || ''}
          value={motivation}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            fontFamily: 'Titillium Web',
            fontSize: 14,
            color: '#888',
            mb: 2,
          }}
        >
          {motivation.length}/200
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 0 }}>
        {actionType === 'supervisioned' && (
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
        {actionType === 'rejected' && (
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
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </Dialog>
  );
};

export default ProductModal;
