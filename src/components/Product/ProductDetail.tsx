import { List, ListItem, Typography, Divider } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { emptyData } from '../../utils/constants';
import { ProductDTO } from '../../api/generated/register/ProductDTO';

type Props = {
  data: ProductDTO;
};

export default function ProductDetail({ data }: Props) {
  const { t } = useTranslation();
  return (
    <Box sx={{ minWidth: 400, pl: 2 }} role="presentation" data-testid="product-detail">
      <List>
        <ListItem disablePadding>
          <Box sx={{ mb: 1, ml: 2 }}>
            <Typography variant="h6" sx={{ maxWidth: 350, wordWrap: 'break-word' }}>
              {data?.productName}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.batchName || emptyData}
            </Typography>
          </Box>
        </ListItem>
        <Divider sx={{ mb: 2, fontWeight: '600', fontSize: '16px' }} />

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Data verifica EPREL
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {String(format(Number(data?.registrationDate), 'dd/MM/yyyy')) || emptyData}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body2" fontWeight="fontWeightMedium" sx={{ mt: 4 }}>
              SCHEDA PRODOTTO
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              {' '}
              Codice EPREL
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.eprelCode || emptyData}
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Codice GTIN/EAN
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.gtinCode || emptyData}
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Codice prodotto
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.productCode || emptyData}
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Categoria
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.category ? t(`pages.products.categories.${data?.category}`) : emptyData}
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Marca
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.brand || emptyData}
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Modello
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.model || emptyData}
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Classe energetica
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.energyClass || emptyData}
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Paese di produzione
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.countryOfProduction || emptyData}
            </Typography>
          </Box>
        </ListItem>

        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Capacità
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.capacity || emptyData}
            </Typography>
          </Box>
        </ListItem>
      </List>
    </Box>
  );
}
