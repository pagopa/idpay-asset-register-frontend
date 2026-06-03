import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProductDTO } from '../../api/generated/register';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../utils/constants';
import { handleModalSuccess } from './ProductDataGrid.helpers';

type Props = {
  open: boolean;
  action: string | undefined;
  selected: Array<string>;
  tableData: Array<ProductDTO>;
  isInvitaliaUser: boolean;
  onClose: () => void;
  onConfirm: (action: string, reason?: string) => Promise<void>;
  setShowMsgRejected: (v: boolean) => void;
  setShowMsgApproved: (v: boolean) => void;
  setShowMsgWaitApproved: (v: boolean) => void;
};

const ProductBulkActionDialog: React.FC<Props> = ({
  open,
  action,
  selected,
  tableData,
  isInvitaliaUser,
  onClose,
  onConfirm,
  setShowMsgRejected,
  setShowMsgApproved,
  setShowMsgWaitApproved,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!action) {
    return null;
  }

  const actionKeyMap: Record<string, string> = {
    [PRODUCTS_STATES.SUPERVISED]: 'supervised',
    [PRODUCTS_STATES.REJECTED]: 'rejected',
    [PRODUCTS_STATES.WAIT_APPROVED]: 'waitApproved',
    [MIDDLE_STATES.REJECT_APPROVATION]: 'rejectApprovation',
    [MIDDLE_STATES.ACCEPT_APPROVATION]: 'acceptApprovation',
  };

  const modalKey = actionKeyMap[action];
  const baseKey = `invitaliaModal.${modalKey}`;

  const requireReason =
    modalKey === 'supervised' || modalKey === 'rejected' || modalKey === 'rejectApprovation';

  const handleConfirm = async () => {
    if (requireReason && !reason) {
      return;
    }
    setLoading(true);
    await onConfirm(action, reason);
    handleModalSuccess({
      selected,
      tableData,
      modalAction: action,
      isInvitaliaUser,
      setShowMsgRejected,
      setShowMsgApproved,
      setShowMsgWaitApproved,
    });
    setLoading(false);
    onClose();
    setReason('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t(`${baseKey}.title`)}</DialogTitle>
      <DialogContent>
        <Box mb={2}>{t(`${baseKey}.description`, { L2: 'L2' })}</Box>
        {requireReason && (
          <TextField
            fullWidth
            label={t(`${baseKey}.reasonLabel`)}
            placeholder={t(`${baseKey}.reasonPlaceholder`)}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!reason}
            helperText={!reason ? t(`${baseKey}.errorMessage`) : ''}
            multiline
            minRows={3}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t(`${baseKey}.buttonTextCancel`)}</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : t(`${baseKey}.buttonTextConfirm`)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductBulkActionDialog;
