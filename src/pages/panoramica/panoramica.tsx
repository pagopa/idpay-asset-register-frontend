import React, { useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Button, Tooltip } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';

const fetchUserFromLocalStorage = (): { [key: string]: string } | null => {
  try {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Errore nel recupero dei dati dal localStorage:', error);
    return null;
  }
};

const truncateString = (str?: string, maxLength: number = 40): string => {
  if (!str) {
    return '-';
  } else {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }
};

const Panoramica: React.FC = () => {
  const { t } = useTranslation();

  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  useEffect(() => {
    console.log('User recuperato dal localStorage:', user);
  }, [user]);

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.overview.overviewTitle')}
        subTitle={t('pages.overview.overviewTitleDescription')}
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
          gridTemplateColumns: 'repeat(12, 1fr)',
          columnGap: 3,
          mb: 5,
        }}
      >
        {/* Sezione Informazioni */}
        <Box sx={{ gridColumn: 'span 6' }}>
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
              title={t('pages.overview.overviewTitleBoxInfo')}
              mbTitle={2}
              variantTitle="h5"
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
                { label: 'overviewTitleBoxInfoTitleLblRs', value: user?.org_name },
                { label: 'overviewTitleBoxInfoTitleLblCf', value: user?.org_taxcode },
                { label: 'overviewTitleBoxInfoTitleLblPiva', value: user?.org_vat },
                { label: 'overviewTitleBoxInfoTitleLblSl', value: user?.org_address },
                { label: 'overviewTitleBoxInfoTitleLblPec', value: user?.org_pec, truncate: true },
                {
                  label: 'overviewTitleBoxInfoTitleLblEmailOp',
                  value: user?.org_email,
                  truncate: true,
                },
              ].map(({ label, value, truncate }) => (
                <React.Fragment key={label}>
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <Typography variant="body2">{t(`pages.overview.${label}`)}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: 'span 9' }}>
                    {truncate && value ? (
                      <Tooltip title={value}>
                        <Typography variant="body1" sx={{ cursor: 'pointer' }}>
                          {truncateString(value)}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body1">{value || '-'}</Typography>
                    )}
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Sezione Prodotti */}
        <Box sx={{ gridColumn: 'span 6' }}>
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
              title={t('pages.overview.overviewTitleBoxProdTitle')}
              mbTitle={2}
              variantTitle="h5"
              variantSubTitle="body1"
              data-testid="title-box-prod"
            />
            <Box
              sx={{
                gridColumn: 'span 12',
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                rowGap: 2,
              }}
            >
              <Box sx={{ gridColumn: 'span 12' }}>
                <Typography variant="body2">
                  {t('pages.overview.overviewTitleBoxProdDescription')}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: 'span 12', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => console.log('Caricamento file .csv')}
                >
                  {t('pages.overview.overviewTitleBoxProdBtn')}
                </Button>
              </Box>
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

export default Panoramica;
