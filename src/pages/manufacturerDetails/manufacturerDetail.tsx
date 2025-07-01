import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import mockdata from './mockdata.json';

const mockedData = mockdata;

const ManufacturerDetail: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box width="100%" px={2}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button variant="text" startIcon={<ArrowBackIcon />}>
          {t('pages.manufacturerDetail.backButton')}
        </Button>
        Panoramica &nbsp;/&nbsp;&nbsp;
        <Box sx={{ display: 'inline', fontWeight: 'bold' }}>Test Manufacturer</Box>
      </Box>
      <TitleBox
        title="Test Manufacturer"
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={5}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '50% 50%',
          columnGap: 3,
          mb: 5,
        }}
      >
        {/* Sezione Informazioni */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Paper
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              alignItems: 'baseline',
              background: 'background.paper',
              p: 3,
              columnGap: 3,
            }}
          >
            <TitleBox
              title={String(t('pages.manufacturerDetail.dataPanel.title')).replace(' ', '\xa0')}
              mbTitle={2}
              variantTitle="overline"
              variantSubTitle="body1"
              data-testid="title-box-info"
            />
            <Box
              sx={{
                gridColumn: 'span 12',
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                rowGap: 2,
              }}
            >
              {[
                { label: 'businessName', value: mockedData?.manufacturerData?.businessName },
                { label: 'fiscalCode', value: mockedData?.manufacturerData?.fiscalCode },
                { label: 'vatNumber', value: mockedData?.manufacturerData?.vatNumber },
                {
                  label: 'registeredOffice',
                  value: mockedData?.manufacturerData?.registeredOffice,
                },
                { label: 'PEC', value: mockedData?.manufacturerData?.PEC },
              ].map(({ label, value }) => (
                <React.Fragment key={label}>
                  <Box sx={{ gridColumn: 'span 3', alignContent: 'center' }}>
                    <Typography variant="body2">
                      {t(`pages.manufacturerDetail.dataPanel.${label}`)}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: 'span 9' }}>
                    <Typography variant="body2" sx={{ fontWeight: '600' }}>
                      {value || '-'}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </Paper>
          <Paper
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              alignItems: 'baseline',
              background: 'background.paper',
              p: 3,
              columnGap: 3,
            }}
          >
            <TitleBox
              title={String(t('pages.manufacturerDetail.legalRepresentativePanel.title')).replace(
                ' ',
                '\xa0'
              )}
              mbTitle={2}
              variantTitle="overline"
              data-testid="title-box-info"
            />
            <Box
              sx={{
                gridColumn: 'span 12',
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                rowGap: 2,
              }}
            >
              {[
                { label: 'fullName', value: mockedData?.legalRepresentative?.fullName },
                { label: 'fiscalCode', value: mockedData?.legalRepresentative?.fiscalCode },
                { label: 'businessEmail', value: mockedData?.legalRepresentative?.businessEmail },
              ].map(({ label, value }) => (
                <React.Fragment key={label}>
                  <Box sx={{ gridColumn: 'span 3', alignContent: 'center' }}>
                    <Typography variant="body2">
                      {t(`pages.manufacturerDetail.legalRepresentativePanel.${label}`)}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: 'span 9' }}>
                    <Typography variant="body2" sx={{ fontWeight: '600' }}>
                      {value || '-'}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Sezione Footer */}
      <Paper
        sx={{
          width: '100%',
          mb: 2,
          pb: 3,
          backgroundColor: grey.A100,
        }}
      />
    </Box>
  );
};

export default ManufacturerDetail;
