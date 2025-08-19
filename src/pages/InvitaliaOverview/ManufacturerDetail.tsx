import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import { InstitutionResponse } from '../../api/generated/register/InstitutionResponse';
import DrawerHeader from './DrawerHeader';
import DrawerSubHeader from './DrawerSubHeader';
import DrawerItem from './DrawerItem';

type ManufacturerDetailProps = {
  data: InstitutionResponse;
};

const ManufacturerDetail: React.FC<ManufacturerDetailProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: 400, pl: 2 }} role="presentation" data-testid="manufacturer-detail">
      <DrawerHeader label={data.description} />
      <Divider />
      <List>
        <DrawerSubHeader label={t('pages.invitaliaOverview.manufacturerSheet')} />
        <DrawerItem
          itemHeader={t('pages.invitaliaProductsList.ragioneSociale')}
          itemValue={data.description}
        />
        <DrawerItem
          itemHeader={t('pages.invitaliaProductsList.codiceFiscale')}
          itemValue={data.fiscalCode}
        />
        <DrawerItem itemHeader={t('pages.invitaliaProductsList.piva')} itemValue={data.vatNumber} />
        <DrawerItem
          itemHeader={t('pages.invitaliaProductsList.sedeLegale')}
          itemValue={data.address}
        />
        <DrawerItem
          itemHeader={t('pages.invitaliaProductsList.pec')}
          itemValue={String(data.digitalAddress)}
          copyable={true}
        />
      </List>
    </Box>
  );
};

export default ManufacturerDetail;
