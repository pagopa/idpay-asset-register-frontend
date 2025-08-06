import React, { useEffect } from 'react';
import {Box} from '@mui/material';
import { useSelector } from 'react-redux';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { institutionSelector } from '../../redux/slices/invitaliaSlice';
import ProductDataGrid from '../../components/Product/ProductDataGrid';

const InvitaliaProductsList: React.FC = () => {
  const institution = useSelector(institutionSelector);

  useEffect(() => {}, []);
  return (
    <Box pt={'16px'} pl={'8px'}>
      <Box pt={'16px'}>
        <Box sx={{ gridColumn: 'span 12' }}>
          <TitleBox
            title="Prodotti"
            subTitle="Visualizza tutti i prodotti caricati e i dettagli."
            mtTitle={2}
            mbSubTitle={5}
            variantTitle="h4"
            variantSubTitle="body1"
            data-testid="title"
          />
        </Box>
        <ProductDataGrid organizationId={institution?.institutionId || ''} />
      </Box>
    </Box>
  );
};

export default InvitaliaProductsList;
