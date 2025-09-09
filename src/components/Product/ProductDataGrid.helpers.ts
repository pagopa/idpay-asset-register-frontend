import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../utils/constants';

export const getSelectedStatuses = (
  selected: Array<string>,
  tableData: Array<ProductDTO>
): Array<string> =>
  selected
    .map((gtinCode) => String(tableData.find((row) => row.gtinCode === gtinCode)?.status))
    .filter(Boolean);

export const isAllStatus = (statuses: Array<string>, status: string) =>
  statuses.every((s) => s === status);

export const isSomeStatus = (statuses: Array<string>, status: string) =>
  statuses.some((s) => s === status);

export const getStatusChecks = (selected: Array<string>, tableData: Array<ProductDTO>) => {
  const selectedStatuses = getSelectedStatuses(selected, tableData);
  return {
    selectedStatuses,
    allUploaded: isAllStatus(selectedStatuses, PRODUCTS_STATES.UPLOADED),
    allSupervised: isAllStatus(selectedStatuses, PRODUCTS_STATES.SUPERVISED),
    allWaitApproved: isAllStatus(selectedStatuses, PRODUCTS_STATES.WAIT_APPROVED),
    someUploaded: isSomeStatus(selectedStatuses, PRODUCTS_STATES.UPLOADED),
    length: selectedStatuses.length,
  };
};

export const handleModalSuccess = ({
  selected,
  tableData,
  modalAction,
  isInvitaliaUser,
  setShowMsgRejected,
  setShowMsgApproved,
  setShowMsgWaitApproved,
}: {
  selected: Array<string>;
  tableData: Array<ProductDTO>;
  modalAction: string | undefined;
  isInvitaliaUser: boolean;
  setShowMsgRejected: (v: boolean) => void;
  setShowMsgApproved: (v: boolean) => void;
  setShowMsgWaitApproved: (v: boolean) => void;
}) => {
  const selectedStatuses = getSelectedStatuses(selected, tableData);
  const allUploaded = isAllStatus(selectedStatuses, PRODUCTS_STATES.UPLOADED);
  const allSupervised = isAllStatus(selectedStatuses, PRODUCTS_STATES.SUPERVISED);

  const resetMsgs = () => {
    setShowMsgApproved(false);
    setShowMsgWaitApproved(false);
    setShowMsgRejected(false);
  };

  if (modalAction === PRODUCTS_STATES.APPROVED && allUploaded) {
    setShowMsgApproved(true);
    setShowMsgWaitApproved(false);
    setShowMsgRejected(false);
    return;
  }

  if (modalAction === PRODUCTS_STATES.WAIT_APPROVED && allUploaded) {
    setShowMsgWaitApproved(true);
    setShowMsgApproved(false);
    setShowMsgRejected(false);
    return;
  }

  if (modalAction === PRODUCTS_STATES.SUPERVISED && allUploaded) {
    setShowMsgWaitApproved(true);
    setShowMsgApproved(false);
    setShowMsgRejected(false);
    return;
  }

  if (
    isInvitaliaUser &&
    modalAction === PRODUCTS_STATES.REJECTED &&
    (allUploaded || allSupervised)
  ) {
    resetMsgs();
    return;
  }

  if (isInvitaliaUser && modalAction === PRODUCTS_STATES.WAIT_APPROVED && allSupervised) {
    setShowMsgWaitApproved(true);
    setShowMsgApproved(false);
    setShowMsgRejected(false);
    return;
  }

  if (isInvitaliaUser && modalAction === PRODUCTS_STATES.APPROVED && allSupervised) {
    setShowMsgApproved(true);
    setShowMsgWaitApproved(false);
    setShowMsgRejected(false);
    return;
  }

  if (
    modalAction === PRODUCTS_STATES.REJECTED ||
    modalAction === MIDDLE_STATES.REJECT_APPROVATION
  ) {
    setShowMsgRejected(true);
    setShowMsgApproved(false);
    setShowMsgWaitApproved(false);
    return;
  }

  setShowMsgApproved(true);
  setShowMsgWaitApproved(false);
  setShowMsgRejected(false);
};
