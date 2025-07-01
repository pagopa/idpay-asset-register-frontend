import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../routes';

const ProductsSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onExit = useUnloadEventOnExit();

  return (
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
        <Box className="custom-titlebox" sx={{ gridColumn: 'span 12' }}>
          <TitleBox
            title={t('pages.overview.overviewTitleBoxProdTitle')}
            mbTitle={2}
            variantTitle="h6"
            variantSubTitle="body1"
            data-testid="title-box-prod"
          />
        </Box>
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
              onClick={() => onExit(() => navigate(ROUTES.ADD_PRODUCTS, { replace: true }))}
            >
              {t('pages.overview.overviewTitleBoxProdBtn')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductsSection;
