import React from 'react';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import MsgResult from './MsgResult';

type Props = {
  showMsgWaitApproved: boolean;
  showMsgSupervised: boolean;
  showMsgApproved: boolean;
  showMsgAcceptApprovation: boolean;
  showMsgRejected: boolean;
  showMsgRejectedApprovation: boolean;
  showMixStatusError: boolean;
  showYourselfApprovedError: boolean;
  showGenericError: number;
  bottom: number;
};

const ProductResultMessages: React.FC<Props> = ({
  showMsgWaitApproved,
  showMsgSupervised,
  showMsgApproved,
  showMsgAcceptApprovation,
  showMsgRejected,
  showMsgRejectedApprovation,
  showMixStatusError,
  showYourselfApprovedError,
  showGenericError,
  bottom,
}) => {
  const {t} = useScopedTranslation();
  return <>
    {showMsgWaitApproved && (
      <MsgResult
        severity="success"
        message={t('invitaliaModal.waitApproved.msgResultWaitApproved')}
        bottom={bottom}
      />
    )}

    {showMsgSupervised && (
      <MsgResult
        severity="success"
        message={t('invitaliaModal.supervised.msgResultSupervised')}
        bottom={bottom}
      />
    )}

    {showMsgApproved && (
      <MsgResult
        severity="success"
        message={t('invitaliaModal.waitApproved.msgResultWaitApproved')}
        bottom={bottom}
      />
    )}

    {showMsgAcceptApprovation && (
      <MsgResult
        severity="success"
        message={t('invitaliaModal.acceptApprovation.msgResultAcceptApprovation')}
        bottom={bottom}
      />
    )}

    {showMsgRejected && (
      <MsgResult
        severity="success"
        message={t('invitaliaModal.rejected.msgResultRejected')}
        bottom={bottom}
      />
    )}

    {showMsgRejectedApprovation && (
      <MsgResult
        severity="success"
        message={t('invitaliaModal.rejectApprovation.msgResultRejectedApprovation')}
        bottom={bottom}
      />
    )}

    {showMixStatusError && (
      <MsgResult severity="error" message={t('msgResutlt.errorMixSelected')} bottom={bottom} />
    )}

    {showYourselfApprovedError && (
      <MsgResult severity="error" message={t('msgResutlt.errorYourselfApproved')} bottom={bottom} />
    )}

    {showGenericError > 0 && (
      <MsgResult
        key={showGenericError}
        severity="error"
        message={t('msgResutlt.errorGenericDescription')}
        bottom={bottom}
      />
    )}
  </>;
};

export default ProductResultMessages;
