import { Chip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

type ProductStatusChipProps = {
  status: string | undefined;
  isInvitaliaUser: boolean;
};

export default function ProductStatusChip({ status, isInvitaliaUser }: ProductStatusChipProps) {
  if (!isInvitaliaUser || !status) {
    return null;
  }

  if (status === 'REJECTED') {
    return (
      <Chip
        icon={<ErrorIcon color="error" />}
        color="error"
        label="Prodotto Escluso"
        size="medium"
        sx={{ mb: 1, ml: 2 }}
      />
    );
  }

  return (
    <Chip
      icon={<WarningIcon color="warning" />}
      color="warning"
      label="Prodotto contrassegnato"
      size="medium"
      sx={{ mb: 1, ml: 2 }}
    />
  );
}
