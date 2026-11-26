import { Chip } from '@mui/material';
import { MIChip } from '@pagopa/mui-italia/components/MIChip';
import useScopedTranslation from '../../hooks/useScopedTranslation';

type ProductStatusChipProps = {
  status: string | undefined;
};

const chipSx = {
  mb: 1,
  minWidth: 104,
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  '& .MuiChip-label': {
    overflow: 'visible',
    textOverflow: 'clip',
    whiteSpace: 'nowrap',
  },
};

export default function ProductStatusChip({ status }: ProductStatusChipProps) {
  const { t } = useScopedTranslation();
  if (!status) {
    return null;
  }

  switch (status) {
    case 'APPROVED':
      return (
        <MIChip
          color="success"
          label={t('chip.productStatusLabel.approved')}
          sx={chipSx}
        />
      );
    case 'UPLOADED':
      return (
        <MIChip
          color="default"
          label={t('chip.productStatusLabel.uploaded')}
          sx={chipSx}
        />
      );
    case 'WAIT_APPROVED':
      return (
        <MIChip
          color="info"
          label={t('chip.productStatusLabel.waitApproved')}
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
        <MIChip
          color="error"
          label={t('chip.productStatusLabel.rejected')}
          sx={chipSx}
        />
      );
    default:
      return null;
  }
}
