import React, { useRef, useState } from 'react';
import { Box, Breadcrumbs, Link, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { ButtonNaked } from '@pagopa/mui-italia';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { useNavigate } from 'react-router-dom';
import { BASE_ROUTE } from '../../routes';
import FormAddProducts, { FormAddProductsRef } from './formAddProducts';

const AddProducts: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onExit = useUnloadEventOnExit();
  const [fileAccepted, setFileAccepted] = useState(false);
  const formRef = useRef<FormAddProductsRef>(null);

  return (
    <Box pb={0}  data-testid="add-products-container">
      <Box sx={{ display: 'flex', gridColumn: 'span 12', alignItems: 'center', marginTop: 5 }}>
        <ButtonNaked
          component="button"
          onClick={() => onExit(() => navigate(BASE_ROUTE, { replace: true }))}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: 'primary.main',
            fontSize: '1rem',
            marginBottom: '3px',
            marginRight: '8px',
            fontWeight: 700,
          }}
          weight="default"
          data-testid="back-button-test"
        >
          {t('breadcrumbs.exit')}
        </ButtonNaked>
        <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '3px', marginRight: '8px' }}>
          <Typography color="text.primary" variant="body2">
            {t('breadcrumbs.home')}
          </Typography>
          <Typography color="text.disabled" variant="body2">
            {t('breadcrumbs.aggiungiProdotti')}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ gridColumn: 'span 12' }}>
        <TitleBox
          title={t('pages.addProducts.title')}
          mbTitle={5}
          mtTitle={5}
          mbSubTitle={5}
          variantTitle="h4"
          variantSubTitle="body1"
          data-testid="title"
        />
      </Box>

      {/* Sezione Carica i tuoi prodotti */}
      <Box sx={{ gridColumn: 'span 12' }}>
        <Paper
          sx={{
            display: 'grid',
            alignItems: 'baseline',
            background: 'background.paper',
            p: 3,
            pb: 0,
            columnGap: 3,
          }}
        >
          <TitleBox
            title={t('pages.addProducts.boxAddTitle')}
            mbTitle={2}
            variantTitle="h6"
            data-testid="title-box-info"
            titleFontSize="24px"
          />
          <Box gridColumn="auto" pt={2}>
            <Typography>
              {t('pages.addProducts.boxAddText')}
              <strong>{t('pages.addProducts.boxAddTextProduct')}</strong>
            </Typography>
            <Typography letterSpacing={'0.3px'} fontWeight={700}>
              <Link href="">{t('pages.addProducts.goToManual')}</Link>
            </Typography>
          </Box>
        </Paper>

        <FormAddProducts
            ref={formRef}
            fileAccepted={fileAccepted}
            setFileAccepted={setFileAccepted}
        />
      </Box>
    </Box>
  );
};

export default AddProducts;
