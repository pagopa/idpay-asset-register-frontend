import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import MsgResult from '../../components/Product/MsgResult';
import Products from '../components/Products';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';

const InvitaliaProductsList: React.FC = () => {
  const { t } = useScopedTranslation();
  const location = useLocation();
  const currentInitiativeId = useCurrentInitiativeId();
  const organizationIdFromNavigation = (location.state as any)?.organizationId;
  const organizationLabelFromNavigation = (location.state as any)?.organizationLabel;
  const sourceInitiativeId = (location.state as any)?.sourceInitiativeId;
  const [showMsg, setShowMsg] = useState(false);
  const MSG_RESULT_BT = 80;
  const canUseNavigationOrganization =
    !sourceInitiativeId || sourceInitiativeId === currentInitiativeId;

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
      <Products
        organizationId={canUseNavigationOrganization ? organizationIdFromNavigation : ''}
        organizationLabel={canUseNavigationOrganization ? organizationLabelFromNavigation : ''}
      />
      {showMsg && (
        <MsgResult
          severity="success"
          message={t('invitaliaModal.waitApproved.msgResultWaitApproved')}
          bottom={MSG_RESULT_BT}
        />
      )}
    </Box>
  );
};

export default InvitaliaProductsList;
