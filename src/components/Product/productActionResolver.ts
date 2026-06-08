import { ProductStatus } from '../../api/generated/register';

export type ActionResolution =
  | { type: 'NO_SELECTION' }
  | { type: 'ERROR_SELF_APPROVAL' }
  | { type: 'ERROR_MIX_STATUS' }
  | { type: 'ERROR_SAME_STATUS' }
  | { type: 'OPEN_RESTORE_DIALOG' }
  | { type: 'OPEN_MODAL'; action: string };

type ResolveActionParams = {
  action: string;
  isInvitaliaAdmin: boolean;
  selectedStatuses: Array<ProductStatus>;
  someUploaded: boolean;
  selectedLength: number;
  preventSameStatusTransition?: boolean;
};

export const resolveProductAction = ({
  action,
  isInvitaliaAdmin,
  selectedStatuses,
  someUploaded,
  selectedLength,
  preventSameStatusTransition,
}: ResolveActionParams): ActionResolution => {
  if (selectedLength === 0) {
    return { type: 'NO_SELECTION' };
  }

  if (isInvitaliaAdmin && someUploaded) {
    return { type: 'ERROR_SELF_APPROVAL' };
  }

  const uniqueStatuses = Array.from(new Set(selectedStatuses));

  if (
    preventSameStatusTransition &&
    uniqueStatuses.length === 1 &&
    uniqueStatuses[0] === (action as ProductStatus)
  ) {
    return { type: 'ERROR_SAME_STATUS' };
  }

  if (uniqueStatuses.length > 1) {
    return { type: 'ERROR_MIX_STATUS' };
  }

  if (action === 'WAIT_APPROVED') {
    if (isInvitaliaAdmin) {
      return { type: 'OPEN_RESTORE_DIALOG' };
    }
    return { type: 'OPEN_MODAL', action };
  }

  return { type: 'OPEN_MODAL', action };
};
