import { Box } from '@mui/material';
import TitleBox from '@pagopa/selfcare-common-frontend/lib/components/TitleBox';
import OverviewHistoryUpload from '../components/OverviewHistoryUpload';

const UploadsHistory = () => (
  <Box width="100%" px={2}>
    <TitleBox
      title="Storico caricamenti"
      subTitle="Visualizza tutti i caricamenti e i dettagli"
      mbTitle={2}
      mtTitle={2}
      mbSubTitle={5}
      variantTitle="h4"
      variantSubTitle="body1"
      data-testid="title-overview"
      titleFontSize="42px"
    />
    <Box
      sx={{
        display: 'inline',
        gridColumn: 'span 12',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <OverviewHistoryUpload />
    </Box>
  </Box>
);
export default UploadsHistory;
