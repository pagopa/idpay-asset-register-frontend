import React, { useMemo } from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { grey } from '@mui/material/colors';
import OverviewProductionSection from '../components/OverviewProductionSection';
import { fetchUserFromLocalStorage, truncateString } from '../../helpers';
import { EMPTY_DATA, maxLengthOverviewProd } from '../../utils/constants';

const Overview: React.FC = () => {
  const { t } = useTranslation();
  const user = useMemo(() => fetchUserFromLocalStorage(), []);

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
        data-testid="title-overview"
        titleFontSize="42px"
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
              variantTitle="h6"
              variantSubTitle="body1"
              data-testid="title-box-overview-info"
              aria-label="title-box-overview-info"
              titleFontSize="32px"
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
                { label: 'overviewTitleBoxInfoTitleLblRs', value: user?.org_name, truncate: true },
                {
                  label: 'overviewTitleBoxInfoTitleLblCf',
                  value: user?.org_taxcode,
                  truncate: true,
                },
                { label: 'overviewTitleBoxInfoTitleLblPiva', value: user?.org_vat, truncate: true },
                {
                  label: 'overviewTitleBoxInfoTitleLblSl',
                  value: user?.org_address,
                  truncate: true,
                },
                { label: 'overviewTitleBoxInfoTitleLblPec', value: user?.org_pec, truncate: true },
                {
                  label: 'overviewTitleBoxInfoTitleLblEmailOp',
                  value: user?.org_email,
                  truncate: true,
                },
              ].map(({ label, value, truncate }) => (
                <React.Fragment key={label}>
                  <Box sx={{ gridColumn: 'span 3', alignContent: 'center' }}>
                    <Typography variant="body2">{t(`pages.overview.${label}`)}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: 'span 9' }}>
                    {truncate && value ? (
                      <Tooltip title={value}>
                        <Typography variant="body2" sx={{ cursor: 'pointer', fontWeight: '600' }}>
                          {truncateString(value, maxLengthOverviewProd)}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {value || EMPTY_DATA}
                      </Typography>
                    )}
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </Paper>
        </Box>

        <OverviewProductionSection />
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

export default Overview;
