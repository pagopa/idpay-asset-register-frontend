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

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  gtinCodes: Array<string>;
  actionType?: string;
  organizationId: string;
  onUpdateTable?: () => void;
}

const buttonStyle = {
  height: 48,
  fontWeight: 600,
  fontSize: 16,
  marginRight: 2,
  width: 85,
};

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  gtinCodes,
  actionType,
  organizationId,
  onUpdateTable,
}) => {
  const [reason, setReason] = useState('');
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
      await setSupervisionedStatusList(organizationId, gtinCodes, reason);
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
      await setRejectedStatusList(organizationId, gtinCodes, reason);
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
          {gtinCodes.map((code) => (
            <Typography
              key={code}
              sx={{ fontFamily: 'Titillium Web', fontWeight: 400, fontSize: 16 }}
            >
              - {code}
            </Typography>
          ))}
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
          value={reason}
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
          {reason.length}/200
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
            disabled={reason.length === 0}
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
            disabled={reason.length === 0}
          >
            {config?.buttonText || 'Chiudi'}
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
