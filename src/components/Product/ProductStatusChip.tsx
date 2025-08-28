import { Chip } from '@mui/material';
import { PRODUCTS_STATES } from '../../utils/constants';

type ProductStatusChipProps = {
  status: string | undefined;
};

const chipSx = {
  mb: 1,
};

export default function ProductStatusChip({ status }: ProductStatusChipProps) {
  if (!status || status === PRODUCTS_STATES.APPROVED) {
    return null;
  }

  switch (status) {
    case 'APPROVED':
    case 'UPLOADED':
      return <Chip color="default" label="Da revisionare" size="medium" sx={chipSx} />;
    case 'WAIT_APPROVED':
      return <Chip color="info" label="Da approvare" size="medium" sx={chipSx} />;
    case 'SUPERVISED':
      return <Chip color="primary" label="Da controllare" size="medium" sx={chipSx} />;
    case 'REJECTED':
      return <Chip color="error" label="Escluso" size="medium" sx={chipSx} />;
    default:
      return null;
  }
}
