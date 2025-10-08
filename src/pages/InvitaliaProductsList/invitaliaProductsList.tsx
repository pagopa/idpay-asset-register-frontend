import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { institutionSelector } from '../../redux/slices/invitaliaSlice';
import MsgResult from '../../components/Product/MsgResult';
import Products from '../components/Products';

const InvitaliaProductsList: React.FC = () => {
  const { t } = useTranslation();
  const institution = useSelector(institutionSelector);
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowMsg(false), 10000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleShow = () => setShowMsg(true);
    const handleDismiss = () => setShowMsg(false);
    window.addEventListener('INVITALIA_MSG_SHOW', () => {
      handleShow();
      const timeout = setTimeout(() => handleDismiss(), 10000);
      return () => clearTimeout(timeout);
    });
    window.addEventListener('INVITALIA_MSG_DISMISS', handleDismiss);
    return () => {
      window.removeEventListener('INVITALIA_MSG_SHOW', handleShow);
      window.removeEventListener('INVITALIA_MSG_DISMISS', handleDismiss);
    };
  }, []);

  return (
    <Box ml={2}>
      <Products organizationId={institution?.institutionId || ''} />
      {showMsg && (
        <MsgResult
          severity="success"
          message={t('invitaliaModal.waitApproved.msgResultWaitApproved')}
          bottom={80}
        />
      )}
    </Box>
  );
};

export default InvitaliaProductsList;
