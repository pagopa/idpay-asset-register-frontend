import { ProductDTO, ProductStatus } from '../../api/generated/register';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../utils/constants';

export const getSelectedStatuses = (
  selected: Array<string>,
  tableData: Array<ProductDTO>
): Array<ProductStatus> =>
  selected
    .map((selectedKey) => {
      const match = tableData.find((row) => {
        const rowKey = String(
          (row as any).gtinCode ?? (row as any).gtin ?? (row as any).productCode ?? ''
        );
        return rowKey === String(selectedKey);
      });

      return match?.status;
    })
    .filter((status): status is ProductStatus => status !== undefined);

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

import { ProductTableConfig } from '../../model/config/ConfigSchema';

export const validateBulkActionPreconditions = ({
  selected,
  tableData,
  tableConfig,
}: {
  selected: Array<string>;
  tableData: Array<ProductDTO>;
  roleKey?: string;
  tableConfig?: ProductTableConfig;
}) => {
  const { selectedStatuses, length } = getStatusChecks(selected, tableData);

  if (length === 0) {
    return { valid: false, reason: 'EMPTY' };
  }

  const bulkRules = tableConfig?.bulkRules;
  const preventMixed = bulkRules?.preventMixedStatus ?? true;

  const uniqueStatuses = Array.from(new Set(selectedStatuses));
  if (preventMixed && uniqueStatuses.length > 1) {
    return { valid: false, reason: 'MIXED_STATUS' };
  }

  return { valid: true };
};

export const handleModalSuccess = ({
  selected,
  tableData,
  modalAction,
  isInvitaliaUser,
  setShowMsgRejected,
  setShowMsgApproved,
  setShowMsgWaitApproved,
  setShowMsgSupervised,
  setShowMsgRejectedApprovation,
  setShowMsgAcceptApprovation,
}: {
  selected: Array<string>;
  tableData: Array<ProductDTO>;
  modalAction: string | undefined;
  isInvitaliaUser: boolean;
  setShowMsgRejected: (v: boolean) => void;
  setShowMsgApproved: (v: boolean) => void;
  setShowMsgWaitApproved: (v: boolean) => void;
  setShowMsgSupervised: (v: boolean) => void;
  setShowMsgRejectedApprovation: (v: boolean) => void;
  setShowMsgAcceptApprovation: (v: boolean) => void;
}) => {
  const { selectedStatuses } = getStatusChecks(selected, tableData);
  const allUploaded = isAllStatus(selectedStatuses, PRODUCTS_STATES.UPLOADED);
  const allSupervised = isAllStatus(selectedStatuses, PRODUCTS_STATES.SUPERVISED);

  const resetMsgs = () => {
    setShowMsgApproved(false);
    setShowMsgWaitApproved(false);
    setShowMsgRejected(false);
    setShowMsgSupervised(false);
    setShowMsgRejectedApprovation(false);
    setShowMsgAcceptApprovation(false);
  };

  const activate = (setter: (v: boolean) => void) => {
    resetMsgs();
    setter(true);
  };

  const baseMap: Record<string, (v: boolean) => void> = {
    [PRODUCTS_STATES.APPROVED]: setShowMsgApproved,
    [PRODUCTS_STATES.WAIT_APPROVED]: setShowMsgWaitApproved,
    [PRODUCTS_STATES.SUPERVISED]: setShowMsgSupervised,
    [PRODUCTS_STATES.REJECTED]: setShowMsgRejected,
    [MIDDLE_STATES.REJECT_APPROVATION]: setShowMsgRejectedApprovation,
    [MIDDLE_STATES.ACCEPT_APPROVATION]: setShowMsgAcceptApprovation,
  };

  const setter = modalAction ? baseMap[modalAction] : undefined;

  if (!setter) {
    activate(setShowMsgApproved);
    return;
  }

  if (allUploaded) {
    activate(setter);
    return;
  }

  if (isInvitaliaUser && allSupervised) {
    activate(setter);
    return;
  }

  if (isInvitaliaUser && modalAction === PRODUCTS_STATES.REJECTED) {
    resetMsgs();
    return;
  }

  activate(setShowMsgApproved);
};

export const checkSomeStatus = (selected: Array<string>, tableData: Array<ProductDTO>, status: keyof typeof PRODUCTS_STATES) =>
  selected.some(
    (code) =>
      String(tableData.find((row) => row.gtinCode === code)?.status) ===
      PRODUCTS_STATES[status]
  );
