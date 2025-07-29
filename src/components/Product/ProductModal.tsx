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

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  gtinCodes: Array<string>;
  actionType?: string;
}

const buttonStyle = {
  height: 48,
  fontWeight: 600,
  fontSize: 16,
  marginRight: 2,
  width: 85,
};

const MODAL_CONFIG = {
  supervisioned: {
    title: 'Contrassegna un prodotto',
    description:
      'Segnala eventuali anomalie su un prodotto: verrà messo in pausa e potrai successivamente decidere se escluderlo o ripristinarlo.',
    listTitle: 'I prodotti segnalati sono i seguenti:',
    reasonLabel: 'Motivo segnalazione',
    reasonPlaceholder: 'Motivo segnalazione',
    buttonText: 'Chiudi',
  },
  rejected: {
    title: 'Escludi un prodotto',
    description:
      "Una volta escluso, il prodotto non sarà più visibile agli utenti finali. L'operazione è tracciata e, se necessario, revocabile.",
    listTitle: 'I prodotti esclusi sono i seguenti:',
    reasonLabel: 'Motivo esclusione',
    reasonPlaceholder: 'Motivo esclusione',
    buttonText: 'Escludi',
  },
};

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose, gtinCodes, actionType }) => {
  const [reason, setReason] = useState('');

  const config = MODAL_CONFIG[actionType as keyof typeof MODAL_CONFIG];

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
        <Button
          variant="contained"
          sx={{
            ...buttonStyle,
            backgroundColor: '#0073E6',
            color: '#fff',
            '&:hover': { backgroundColor: '#005bb5' },
          }}
          onClick={onClose}
        >
          {config?.buttonText || 'Chiudi'}
        </Button>
      </DialogActions>
      <IconButton
        aria-label="close"
        onClick={onClose}
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
