import React, { useMemo, useState } from 'react';
import { Alert, Box, Paper, Typography, Tooltip } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { grey } from '@mui/material/colors';
import { ButtonNaked } from '@pagopa/mui-italia';
import { EditOutlined } from '@mui/icons-material';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import MsgResult from '../../components/Product/MsgResult';
import OverviewProductionSection from '../components/OverviewProductionSection';
import OperativeEmailModal from '../components/OperativeEmailModal';
import { fetchUserFromLocalStorage, truncateString } from '../../helpers';
import { EMPTY_DATA, MAX_LENGTH_OVERVIEW_PROD } from '../../utils/constants';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { updateOperativeEmail } from '../../services/registerService';
import { useCurrentInitiative } from '../../hooks/useCurrentInitiative';
import { useInitiativesQuery } from '../../hooks/useInitiativesQuery';

type ToastState = {
  open: boolean;
  severity: 'success' | 'error';
  messageKey: string;
  key: number;
};

const Overview: React.FC = () => {
  const { t } = useScopedTranslation();
  const initiativeId = useCurrentInitiativeId();
  const currentInitiative = useCurrentInitiative();
  const { refetch: refetchInitiatives } = useInitiativesQuery();
  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const [operativeEmailModalOpen, setOperativeEmailModalOpen] = useState(false);
  const [operativeEmailLoading, setOperativeEmailLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    severity: 'success',
    messageKey: 'success',
    key: 0,
  });
  const operativeEmail = currentInitiative?.organizationEmail;
  const isOperativeEmailMissing =
    typeof operativeEmail !== 'string' || operativeEmail.trim().length === 0;

  const handleSaveOperativeEmail = (newOperativeEmail: string) => {
    if (!initiativeId) {
      return;
    }

    const successMessageKey = isOperativeEmailMissing ? 'insertedSuccess' : 'success';

    setOperativeEmailLoading(true);
    updateOperativeEmail(initiativeId, newOperativeEmail)
      .then(() => refetchInitiatives())
      .then(() => {
        setToast((current) => ({
          open: true,
          severity: 'success',
          messageKey: successMessageKey,
          key: current.key + 1,
        }));
      })
      .catch(() => {
        setToast((current) => ({
          open: true,
          severity: 'error',
          messageKey: 'error',
          key: current.key + 1,
        }));
      })
      .finally(() => {
        setOperativeEmailModalOpen(false);
        setOperativeEmailLoading(false);
      });
  };

  const fields = useMemo(
    () => [
      { label: 'overviewTitleBoxInfoTitleLblRs', value: user?.org_name },
      { label: 'overviewTitleBoxInfoTitleLblCf', value: user?.org_taxcode },
      { label: 'overviewTitleBoxInfoTitleLblPiva', value: user?.org_vat },
      { label: 'overviewTitleBoxInfoTitleLblSl', value: user?.org_address },
      { label: 'overviewTitleBoxInfoTitleLblPec', value: user?.org_pec },
      { label: 'overviewTitleBoxInfoTitleLblEmailOp', value: operativeEmail },
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
    [user, operativeEmail]
  );

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.overview.overviewTitle')}
        subTitle={t('pages.overview.overviewTitleDescription')}
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={2}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title-overview"
        titleFontSize="42px"
      />

      {isOperativeEmailMissing && (
        <Box sx={{mb: 3, '& .MuiAlert-message': { fontSize: 16, }, '& .MuiAlert-root': {display: "flex", alignItems: "center", justifyContent: "flex-start" }}}>
          <Alert severity="warning" variant='outlined'>
            <Typography>
              {t('pages.overview.missingOperativeEmailWarning')}
            </Typography>
          </Alert>
        </Box>
      )}

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
              {fields.map(({ label, value, hasValidValue, displayValue }) => {
                const isOperativeEmail = label === 'overviewTitleBoxInfoTitleLblEmailOp';

                return (
                  <React.Fragment key={label}>
                    <Box sx={{ gridColumn: 'span 3', alignContent: 'center' }}>
                      <Typography variant="body2">{t(`pages.overview.${label}`)}</Typography>
                    </Box>
                    <Box
                      sx={{
                        gridColumn: 'span 9',
                        display: isOperativeEmail ? 'flex' : 'block',
                        alignItems: isOperativeEmail ? 'center' : undefined,
                        minWidth: isOperativeEmail ? 0 : undefined,
                        gap: isOperativeEmail ? 2 : undefined,
                      }}
                    >
                      {hasValidValue ? (
                        <Tooltip title={value}>
                          <Typography
                            variant="body2"
                            sx={{
                              cursor: 'pointer',
                              fontWeight: '600',
                              ...(isOperativeEmail
                                ? {
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }
                                : {}),
                            }}
                          >
                            {isOperativeEmail ? value : displayValue}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: '600' }}>
                          {displayValue}
                        </Typography>
                      )}
                      {isOperativeEmail && (
                        <ButtonNaked
                          aria-label="Modifica e-mail operativa"
                          onClick={() => setOperativeEmailModalOpen(true)}
                          size="medium"
                          sx={{ flexShrink: 0 }}
                        >
                          <EditOutlined color='primary' sx={{ width: 22 }} />
                        </ButtonNaked>
                      )}
                    </Box>
                  </React.Fragment>
                );
              })}
            </Box>
          </Paper>
        </Box>

        <OverviewProductionSection />
      </Box>

      <OperativeEmailModal
        open={operativeEmailModalOpen}
        onClose={() => setOperativeEmailModalOpen(false)}
        onSave={handleSaveOperativeEmail}
        initialEmail={operativeEmail}
        isLoading={operativeEmailLoading}
      />

      {toast.open && (
        <MsgResult
          key={toast.key}
          severity={toast.severity}
          message={t(`pages.overview.operativeEmailModal.toast.${toast.messageKey}`)}
        />
      )}

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
