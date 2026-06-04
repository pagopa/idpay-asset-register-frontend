import React from 'react';
import { Box, Button } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { useTranslation } from 'react-i18next';
import { ProductDTO } from '../../api/generated/register';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../utils/constants';

type Props = {
  tableData: Array<ProductDTO>;
  selected: Array<string>;
  isInvitaliaUser: boolean;
  hookLoading: boolean;
  handleOpenModalWithStatusCheck: (action: string) => void;
};

const buttonStyle = {
  height: 48,
  fontWeight: 700,
  fontSize: 16,
  marginRight: 2,
};

const ProductStatusActionBar: React.FC<Props> = ({
  tableData,
  selected,
  isInvitaliaUser,
  hookLoading,
  handleOpenModalWithStatusCheck,
}) => {
  const { t } = useTranslation();
  if (!(tableData?.length > 0 && !hookLoading && selected.length !== 0)) {
    return null;
  }

  const isSomeSupervised = selected.some(
    (gtinCode) =>
      String(tableData.find((row) => row.gtinCode === gtinCode)?.status) ===
      PRODUCTS_STATES.SUPERVISED
  );

  const selectedStatuses = selected.map((selectedKey) => {
    const row = tableData.find(
      (r) =>
        String(r.gtinCode) === String(selectedKey) ||
        String((r as any).gtin) === String(selectedKey) ||
        String(r.productCode) === String(selectedKey)
    );
    return String(row?.status);
  });

  const allUploaded = selectedStatuses.every((s) => s === PRODUCTS_STATES.UPLOADED);

  const allApproved = selectedStatuses.every((s) => s === PRODUCTS_STATES.APPROVED);

  const allSupervised = selectedStatuses.every((s) => s === PRODUCTS_STATES.SUPERVISED);

  const allWaitApproved = selectedStatuses.every((s) => s === PRODUCTS_STATES.WAIT_APPROVED);

  const disableApprove =
    selected.length === 0 ||
    (isInvitaliaUser ? !(allUploaded || allSupervised || allWaitApproved) : !allWaitApproved);

  const disableSupervise =
    selected.length === 0 || !(isInvitaliaUser && (allUploaded || allApproved));

  const disableReject =
    selected.length === 0 ||
    (isInvitaliaUser ? !(allUploaded || allApproved || allSupervised) : !allWaitApproved);

  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-end">
      <Button
        data-testid="rejectedBtn"
        variant="outlined"
        color="error"
        sx={{ ...buttonStyle }}
        disabled={disableReject}
        onClick={() => {
          console.log('[DEBUG] Rejected clicked', {
            selected,
            isInvitaliaUser,
            tableData,
          });
          handleOpenModalWithStatusCheck(
            isInvitaliaUser ? PRODUCTS_STATES.REJECTED : MIDDLE_STATES.REJECT_APPROVATION
          );
        }}
      >
        {isInvitaliaUser
          ? `${t('invitaliaModal.rejected.buttonText')} (${selected.length})`
          : `${t('invitaliaModal.rejectApprovation.buttonText')} (${selected.length})`}
      </Button>

      {isInvitaliaUser && !isSomeSupervised && (
        <Button
          data-testid="supervisedBtn"
          color="primary"
          variant="outlined"
          sx={{ ...buttonStyle }}
          disabled={disableSupervise}
          onClick={() => {
            console.log('[DEBUG] Supervised clicked', {
              selected,
              tableData,
            });
            handleOpenModalWithStatusCheck(PRODUCTS_STATES.SUPERVISED);
          }}
        >
          <FlagIcon />
          {` ${t('invitaliaModal.supervised.buttonText')} (${selected.length})`}
        </Button>
      )}

      <Button
        data-testid="waitApprovedBtn"
        color="primary"
        variant="contained"
        sx={{ ...buttonStyle }}
        disabled={disableApprove}
        onClick={() => {
          console.log('[DEBUG] WaitApproved clicked', {
            selected,
            tableData,
          });
          handleOpenModalWithStatusCheck(
            isInvitaliaUser ? PRODUCTS_STATES.WAIT_APPROVED : MIDDLE_STATES.ACCEPT_APPROVATION
          );
        }}
      >
        {` ${t('invitaliaModal.waitApproved.buttonText')} (${selected.length})`}
      </Button>
    </Box>
  );
};

export default ProductStatusActionBar;
