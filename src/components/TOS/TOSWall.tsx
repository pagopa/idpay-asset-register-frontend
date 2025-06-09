import { useTranslation } from 'react-i18next';
import { Box, Typography, Link } from '@mui/material';
import { TOSAgreement } from '@pagopa/mui-italia';

interface TOSWallProps {
  acceptTOS: () => void;
  tosRoute: string;
  privacyRoute: string;
  firstAcceptance: boolean | undefined;
}

const TOSWall = ({ acceptTOS, tosRoute, privacyRoute, firstAcceptance }: TOSWallProps) => {
  const { t } = useTranslation();

  const description = firstAcceptance ? (
    <Typography color="text.secondary">
      {t('pages.tos.termsDescription')}{' '}
      <Link underline="hover" href={tosRoute}>
        {t('pages.tos.linkTos')}
      </Link>{' '}
      {t('pages.tos.termsDescription2')}
      <Link underline="hover" href={privacyRoute}>
        {t('pages.tos.linkPrivacy')}
      </Link>
    </Typography>
  ) : (
    <Typography color="text.secondary">
      {t('pages.tos.termsDescriptionChanged')}{' '}
      <Link underline="hover" href={tosRoute}>
        {t('pages.tos.linkTos')}
      </Link>{' '}
      {t('pages.tos.and')}{' '}
      <Link underline="hover" href={privacyRoute}>
        {t('pages.tos.linkPrivacy')}
      </Link>
    </Typography>
  );

  return (
    <Box height="100%" width="100%" px={2} sx={{ backgroundColor: '#FAFAFA' }}>
      <TOSAgreement
        sx={{ textAlign: 'center' }}
        productName={t('pages.tos.title')}
        description={description}
        onConfirm={() => acceptTOS()}
      >
        {null}
      </TOSAgreement>
    </Box>
  );
};

export default TOSWall;
