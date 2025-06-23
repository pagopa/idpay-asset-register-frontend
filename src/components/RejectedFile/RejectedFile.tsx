import { Alert, AlertTitle, Typography } from '@mui/material';

interface Props {
  title: string;
  description: string;
  dismissFn: () => void;
}

const RejectedFile = ({ title, description }: Props) => (
  <Alert
    severity="error"
  >
    <AlertTitle>{title}</AlertTitle>
    <Typography variant="body2">{description}</Typography>
  </Alert>
);

export default RejectedFile;
