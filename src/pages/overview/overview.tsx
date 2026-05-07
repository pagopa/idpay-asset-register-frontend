import React, { useMemo } from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { grey } from '@mui/material/colors';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import OverviewProductionSection from '../components/OverviewProductionSection';
import { fetchUserFromLocalStorage, truncateString } from '../../helpers';
import { EMPTY_DATA, MAX_LENGTH_OVERVIEW_PROD } from '../../utils/constants';

const Overview: React.FC = () => {
  const { t } = useScopedTranslation();
  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const fields = useMemo(
    () => [
      { label: 'overviewTitleBoxInfoTitleLblRs', value: user?.org_name },
      { label: 'overviewTitleBoxInfoTitleLblCf', value: user?.org_taxcode },
      { label: 'overviewTitleBoxInfoTitleLblPiva', value: user?.org_vat },
      { label: 'overviewTitleBoxInfoTitleLblSl', value: user?.org_address },
      { label: 'overviewTitleBoxInfoTitleLblPec', value: user?.org_pec },
      { label: 'overviewTitleBoxInfoTitleLblEmailOp', value: user?.org_email },
    ].map(({ label, value }) => {
      const hasValidValue = typeof value === 'string' && value.length > 0;

      return {
        label,
        value,
        hasValidValue,
        displayValue: hasValidValue
          ? truncateString(value as string, MAX_LENGTH_OVERVIEW_PROD)
          : value || EMPTY_DATA,
      };
    }),
    [user]
  );

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
              {fields.map(({ label, value, hasValidValue, displayValue }) => (
                <React.Fragment key={label}>
                  <Box sx={{ gridColumn: 'span 3', alignContent: 'center' }}>
                    <Typography variant="body2">{t(`pages.overview.${label}`)}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: 'span 9' }}>
                    {hasValidValue ? (
                      <Tooltip title={value}>
                        <Typography variant="body2" sx={{ cursor: 'pointer', fontWeight: '600' }}>
                          {displayValue}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: '600' }}>
                        {displayValue}
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
