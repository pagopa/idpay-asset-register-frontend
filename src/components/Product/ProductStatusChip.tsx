import { Chip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { PRODUCTS_STATES } from '../../utils/constants';

type ProductStatusChipProps = {
  status: string | undefined;
};

export default function ProductStatusChip({ status }: ProductStatusChipProps) {
  if (!status || status === PRODUCTS_STATES.APPROVED) {
    return null;
  }

  if (status === PRODUCTS_STATES.REJECTED) {
    return (
      <Chip
        icon={<ErrorIcon color="error" />}
        color="error"
        label="Prodotto Escluso"
        size="medium"
        sx={{ mb: 1 }}
      />
    );
  }

  return (
    <Chip
      icon={<WarningIcon color="warning" />}
      color="warning"
      label="Prodotto contrassegnato"
      size="medium"
      sx={{ mb: 1 }}
    />
  );
}
