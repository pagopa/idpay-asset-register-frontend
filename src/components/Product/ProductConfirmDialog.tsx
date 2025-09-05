import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  cancelButtonText: string;
  confirmButtonText: string;
  onConfirm: () => void;
  onSuccess?: () => void;
  children?: React.ReactNode;
}
const dialogStyles = {
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
  dialogContent: {
    padding: 0,
    marginBottom: 4,
  },
  dialogActions: {
    padding: 0,
  },
  buttonOkCancel: {
    height: 48,
    fontWeight: 600,
    fontSize: 16,
    marginRight: 2,
    gap: '16px',
  },
};

const ProductConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  onSuccess,
  cancelButtonText,
  confirmButtonText,
  children,
}) => (
  <Dialog
    open={open}
    onClose={onCancel}
    slotProps={{
      paper: {
        sx: dialogStyles.dialogPaper,
      },
    }}
  >
    <DialogTitle sx={dialogStyles.dialogTitle}>{title}</DialogTitle>
    <DialogContent sx={dialogStyles.dialogContent}>
      {message}
      {children}
    </DialogContent>
    <DialogActions sx={dialogStyles.dialogActions}>
      <Button
        variant="outlined"
        onClick={onCancel}
        color="primary"
        sx={dialogStyles.buttonOkCancel}
      >
        {cancelButtonText}
      </Button>
      <Button
        onClick={() => {
          onConfirm();
          if (typeof onSuccess === 'function') {
            onSuccess();
          }
        }}
        color="primary"
        variant="contained"
        sx={dialogStyles.buttonOkCancel}
      >
        {confirmButtonText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ProductConfirmDialog;
