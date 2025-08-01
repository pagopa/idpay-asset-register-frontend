import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const buttonStyle = {
  height: 48,
  fontWeight: 600,
  fontSize: 16,
  marginRight: 2,
};
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

const ProductConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  children,
}) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      {message}
      {children}
    </DialogContent>
    <DialogActions>
      <Button
        onClick={onCancel}
        color="primary"
        sx={{
          ...buttonStyle,
        }}
      >
        Annulla
      </Button>
      <Button
        onClick={onConfirm}
        color="primary"
        variant="contained"
        sx={{
          ...buttonStyle,
        }}
      >
        Conferma
      </Button>
    </DialogActions>
  </Dialog>
);

export default ProductConfirmDialog;
