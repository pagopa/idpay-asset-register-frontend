import { Typography } from '@mui/material';
import { MIAlert } from '@pagopa/mui-italia/components/MIAlert';

interface Props {
  title: string;
  description: string;
  isReport?: boolean;
  onDownloadReport?: () => void;
  dismissFn: () => void;
}

const RejectedFile = ({ title, description, isReport = false, onDownloadReport }: Props) => (
  <MIAlert severity="error" title={title}>
    {isReport ? (
      <Typography variant="body2">
        <span
          onClick={onDownloadReport}
          style={{
            textDecoration: 'underline',
            cursor: 'pointer',
            color: 'inherit',
            fontWeight: 'normal',
          }}
        >
          Scarica il report
        </span>{' '}
        {description}
      </Typography>
    ) : (
      <Typography variant="body2">{description}</Typography>
    )}
  </MIAlert>
);

export default RejectedFile;
