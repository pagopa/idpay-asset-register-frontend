import {
  Box,
  Paper, Typography,
} from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';

const GestioneBeni = () => {
  const { t } = useTranslation();

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.panoramica.title')}
        subTitle={"Tieni sotto controllo tutte le tue attività da qui."}
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={5}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title"
      />

      <Box sx={{ display: 'grid', gridColumn: 'span 12', mb: 5 }}>
        <Paper sx={{
          display: 'grid',
          width: '50%',
          gridTemplateColumns: 'repeat(12, 1fr)',
          alignItems: 'baseline',
          background: 'background.paper',
          p: 3,
          columnGap: 3,
        }}
        >
          <TitleBox
            title="Informazioni"
            mbTitle={2}
            variantTitle="h5"
            variantSubTitle="body1"
            data-testid="title"/>
          <Box
            sx={{
              gridColumn: 'span 12',
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              rowGap: 2,
            }}
          >
            <Box sx={{ gridColumn: 'span 3' }}>
              <Typography variant="body2">
                Ragione sociale
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 9' }}>
              <Typography variant="body1">
                AB Electrolux
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 3' }}>
              <Typography variant="body2">
                Codice Fiscale
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 9' }}>
              <Typography variant="body1">
                01724290935
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 3' }}>
              <Typography variant="body2">
                Partita IVA
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 9' }}>
              <Typography variant="body1">
                01724290935
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 3' }}>
              <Typography variant="body2">
                Sede legale
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 9' }}>
              <Typography variant="body1">
                Corso Lino Zanussi 24, 33080 Porcia (PN)
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 3' }}>
              <Typography variant="body2">
                PEC
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 9' }}>
              <Typography variant="body1">
                amministrazione.appliances@electroluxpe...
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          columnGap: 2,
          justifyContent: 'center',
          width: '100%',
          mb: 5,
        }}
      >
      </Box>

      <Paper
        sx={{
          width: '100%',
          mb: 2,
          pb: 3,
          backgroundColor: grey.A100,
        }}
      >
      </Paper>
    </Box>
  );
};
export default GestioneBeni;
