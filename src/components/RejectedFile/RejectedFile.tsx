import {Alert, AlertTitle, Typography} from '@mui/material';

interface Props {
  title: string;
  description: string;
  isReport?: boolean;
  onDownloadReport?: () => void;
  dismissFn: () => void;
}

const RejectedFile = ({ title, description, isReport = false, onDownloadReport }: Props) => (
    <Alert severity="error">
      <AlertTitle>{title}</AlertTitle>
      {isReport ? (
          <Typography variant="body2">
            <span
                onClick={onDownloadReport}
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontWeight: 'normal'
                }}
            >
              Scarica il report
            </span>{' '}
            {description}
          </Typography>
      ) : (
          <Typography variant="body2">{description}</Typography>
      )}
    </Alert>

);

export default RejectedFile;
