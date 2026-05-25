import React from 'react';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../utils/constants';
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
  t: any;
  getMsgResultByActionType: (t: any, actionType?: string) => string;
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
  t,
  getMsgResultByActionType,
  bottom,
}) => (
  <>
    {showMsgWaitApproved && (
      <MsgResult
        severity="success"
        message={getMsgResultByActionType(t, PRODUCTS_STATES.WAIT_APPROVED)}
        bottom={bottom}
      />
    )}

    {showMsgSupervised && (
      <MsgResult
        severity="success"
        message={getMsgResultByActionType(t, PRODUCTS_STATES.SUPERVISED)}
        bottom={bottom}
      />
    )}

    {showMsgApproved && (
      <MsgResult
        severity="success"
        message={getMsgResultByActionType(t, PRODUCTS_STATES.WAIT_APPROVED)}
        bottom={bottom}
      />
    )}

    {showMsgAcceptApprovation && (
      <MsgResult
        severity="success"
        message={getMsgResultByActionType(t, MIDDLE_STATES.ACCEPT_APPROVATION)}
        bottom={bottom}
      />
    )}

    {showMsgRejected && (
      <MsgResult
        severity="success"
        message={getMsgResultByActionType(t, PRODUCTS_STATES.REJECTED)}
        bottom={bottom}
      />
    )}

    {showMsgRejectedApprovation && (
      <MsgResult
        severity="success"
        message={getMsgResultByActionType(t, MIDDLE_STATES.REJECT_APPROVATION)}
        bottom={bottom}
      />
    )}

    {showMixStatusError && (
      <MsgResult severity="error" message={t('msgResutlt.errorMixSelected')} bottom={bottom} />
    )}

    {showYourselfApprovedError && (
      <MsgResult severity="error" message={t('msgResutlt.errorYourselfApproved')} bottom={bottom} />
    )}
  </>
);

export default ProductResultMessages;
