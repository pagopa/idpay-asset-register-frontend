import React from 'react';
import { Box, Button } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { ProductDTO } from '../../api/generated/register';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../utils/constants';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { checkSomeStatus } from './ProductDataGrid.helpers';

type Props = {
  tableData: Array<ProductDTO>;
  selected: Array<string>;
  isInvitaliaUser: boolean;
  isInvitaliaAdmin: boolean;
  hookLoading: boolean;
  handleOpenModalWithStatusCheck: (action: string) => void;
};

const buttonStyle = {
  height: 48,
  fontWeight: 700,
  fontSize: 16,
  marginRight: 2,
};

// eslint-disable-next-line complexity
const ProductStatusActionBar: React.FC<Props> = ({
  tableData,
  selected,
  isInvitaliaUser,
  isInvitaliaAdmin,
  hookLoading,
  handleOpenModalWithStatusCheck,
}) => {
  const { t } = useScopedTranslation();
  if (!(tableData?.length > 0 && !hookLoading && selected.length !== 0)) {
    return null;
  }

  const isSomeSupervised = checkSomeStatus(selected, tableData, PRODUCTS_STATES.SUPERVISED);
  const isSomeWaitApproved = checkSomeStatus(selected, tableData, PRODUCTS_STATES.WAIT_APPROVED);
  const isSomeRejected = checkSomeStatus(selected, tableData, PRODUCTS_STATES.REJECTED);
  const isSomeApproved = checkSomeStatus(selected, tableData, PRODUCTS_STATES.APPROVED);
  const isSomeUploaded = checkSomeStatus(selected, tableData, PRODUCTS_STATES.UPLOADED);

  const userCheck = (isSomeWaitApproved || isSomeRejected || isSomeApproved) && isInvitaliaUser;
  const adminCheck = (isSomeUploaded || isSomeRejected || isSomeApproved || isSomeSupervised) && isInvitaliaAdmin;

  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-end">
      <Button
        data-testid="rejectedBtn"
        variant="outlined"
        color="error"
        sx={{ ...buttonStyle }}
        disabled={
          selected.length === 0 ||
          (userCheck || adminCheck)
        }
        onClick={() => {
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
          disabled={
            selected.length === 0 ||
            (userCheck || adminCheck)
          }
          onClick={() => {
            handleOpenModalWithStatusCheck(PRODUCTS_STATES.SUPERVISED);
          }}
        >
          <FlagIcon /> {` ${t('invitaliaModal.supervised.buttonText')} (${selected.length})`}
        </Button>
      )}
      <Button
        data-testid="waitApprovedBtn"
        color="primary"
        variant="contained"
        sx={{ ...buttonStyle }}
        disabled={
          selected.length === 0 ||
          (userCheck || adminCheck)
        }
        onClick={() => {
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
