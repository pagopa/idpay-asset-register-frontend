import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import EmptyList from '../components/EmptyList';

const Caricamenti = () => {
  const { t } = useTranslation();
  return (
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
        <EmptyList message={t('pages.initiativesList.emptyList')} />
      </Box>
    </Box>
  );
};
export default Caricamenti;
