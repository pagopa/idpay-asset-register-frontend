import { Box } from '@mui/material';
import EmptyList from '../components/EmptyList';

const UploadsHistory = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      justifyContent: 'center',
      width: '100%',
      backgroundColor: 'white',
      p: 2,
    }}
  >
    <Box
      sx={{
        display: 'inline',
        gridColumn: 'span 12',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <EmptyList message={'Pagina non implementata'} />
    </Box>
  </Box>
);
export default UploadsHistory;
