import React from 'react';
import {Box} from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useTranslation } from 'react-i18next';


type Props = {
  children?: React.ReactNode;
};

const Products = ({children}:Props) => {


  const { t } = useTranslation();



  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.products.title')}
        subTitle={t('pages.products.subtitle')}
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={5}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title"
      />
        {children}
    </Box>
  );
};
export default Products;
