import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

type ProductStatusChipProps = {
  status: string | undefined;
};

const chipSx = {
  mb: 1,
};

export default function ProductStatusChip({ status }: ProductStatusChipProps) {
  const { t } = useTranslation();
  if (!status) {
    return null;
  }

  switch (status) {
    case 'APPROVED':
      return (
        <Chip
          color="success"
          label={t('chip.productStatusLabel.approved')}
          size="medium"
          sx={chipSx}
        />
      );
    case 'UPLOADED':
      return (
        <Chip
          color="default"
          label={t('chip.productStatusLabel.uploaded')}
          size="medium"
          sx={chipSx}
        />
      );
    case 'WAIT_APPROVED':
      return (
        <Chip
          color="info"
          label={t('chip.productStatusLabel.waitApproved')}
          size="medium"
          sx={chipSx}
        />
      );
    case 'SUPERVISED':
      return (
        <Chip
          color="primary"
          label={t('chip.productStatusLabel.supervised')}
          size="medium"
          sx={chipSx}
        />
      );
    case 'REJECTED':
      return (
        <Chip
          color="error"
          label={t('chip.productStatusLabel.rejected')}
          size="medium"
          sx={chipSx}
        />
      );
    default:
      return null;
  }
}
