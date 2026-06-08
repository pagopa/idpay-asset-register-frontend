import { PRODUCTS_STATES, MIDDLE_STATES } from '../../utils/constants';

export type ProductRoleContext = {
  isL1: boolean;
  isL2: boolean;
};

type ResolveMessageParams = {
  actionType?: string;
  role: ProductRoleContext;
};

export const resolveMessageForAction = ({
  actionType,
  role,
}: ResolveMessageParams):
  | 'supervised'
  | 'waitApproved'
  | 'rejected'
  | 'acceptApprovation'
  | 'rejectedApprovation'
  | null => {
  if (!actionType) {
    return null;
  }

  if (actionType === PRODUCTS_STATES.SUPERVISED && role.isL1) {
    return 'supervised';
  }

  if (actionType === PRODUCTS_STATES.WAIT_APPROVED && role.isL1) {
    return 'waitApproved';
  }

  if (actionType === PRODUCTS_STATES.REJECTED && role.isL1) {
    return 'rejected';
  }

  if (actionType === MIDDLE_STATES.ACCEPT_APPROVATION && role.isL2) {
    return 'acceptApprovation';
  }

  if (actionType === MIDDLE_STATES.REJECT_APPROVATION && role.isL2) {
    return 'rejectedApprovation';
  }

  return null;
};
