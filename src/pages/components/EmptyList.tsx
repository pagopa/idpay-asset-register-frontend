import { Box, Typography } from '@mui/material';

interface Props {
  message: string;
}

const EmptyList = ({ message }: Props) => (
  <Box
    sx={{
      display: 'grid',
      width: '100%',
      gridTemplateColumns: 'repeat(12, 1fr)',
      alignItems: 'center',
      backgroundColor: 'white',
    }}
  >
    <Box sx={{ display: 'grid', gridColumn: 'span 12', justifyContent: 'center', py: 2 }}>
      <Typography variant="body2">{message}</Typography>
    </Box>
  </Box>
);

export default EmptyList;
