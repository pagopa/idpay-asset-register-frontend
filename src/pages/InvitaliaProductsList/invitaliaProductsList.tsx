import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { institutionSelector } from '../../redux/slices/invitaliaSlice';
import ProductDataGrid from '../../components/Product/ProductDataGrid';
import MsgResult from '../../components/Product/MsgResult';

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
    <Box pt={'16px'} pl={'8px'}>
      <Box pt={'16px'}>
        <Box sx={{ gridColumn: 'span 12' }}>
          <TitleBox
            title="Prodotti"
            subTitle="Visualizza tutti i prodotti caricati e i dettagli."
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
            data-testid="title"
          />
        </Box>
        <ProductDataGrid organizationId={institution?.institutionId || ''} />
      </Box>
      {showMsg && (
        <Box
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 32,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <MsgResult
            severity="success"
            message={t('pages.invitaliaProductsList.richiestaApprovazioneSuccessMsg')}
          />
        </Box>
      )}
    </Box>
  );
};

export default InvitaliaProductsList;
