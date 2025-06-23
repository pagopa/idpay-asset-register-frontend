import { Box, LinearProgress, Typography } from '@mui/material';

interface Props {
  message: string;
}

const LoadingFile = ({ message }: Props) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
    }}
  >
    <Box
      sx={{
        gridColumn: 'span 12',
        alignItems: 'center',
        width: '100%',
        border: '1px solid #E3E7EB',
        borderRadius: '10px',
        px: 3,
        py: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
      }}
    >
      <Typography variant="body2" sx={{ gridColumn: 'span 3' }}>
        {message}
      </Typography>
      <Box sx={{ gridColumn: 'span 9' }}>
        <LinearProgress />
      </Box>
    </Box>
  </Box>
);

export default LoadingFile;
