/* eslint-disable complexity */
import { List, ListItem, Typography, Divider, Button, Chip } from '@mui/material';
import { Box } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useState } from 'react';
import { EMPTY_DATA } from '../../utils/constants';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { setApprovedStatusList, setRejectedStatusList } from '../../services/registerService';
import ProductConfirmDialog from './ProductConfirmDialog';
import ProductModal from './ProductModal';

type Props = {
  open: boolean;
  data: ProductDTO;
  isInvitaliaUser: boolean;
  onUpdateTable?: () => void;
  onClose?: () => void;
};

const buttonStyle = {
  height: 48,
  fontWeight: 600,
  fontSize: 16,
  marginRight: 2,
};

const callApprovedApi = async (
  organizationId: string,
  gtinCodes: Array<string>,
  reason: string
) => {
  try {
    await setApprovedStatusList(organizationId, gtinCodes, reason);
  } catch (error) {
    console.error(error);
  }
};

const callRejectedApi = async (
  organizationId: string,
  gtinCodes: Array<string>,
  reason: string
) => {
  try {
    await setRejectedStatusList(organizationId, gtinCodes, reason);
  } catch (error) {
    console.error(error);
  }
};

const handleOpenModal = (
  action: string,
  organizationId: string,
  gtinCodes: Array<string>,
  reason: string
) => {
  if (action === 'REJECTED') {
    void callRejectedApi(organizationId, gtinCodes, reason);
  } else if (action === 'APPROVED') {
    void callApprovedApi(organizationId, gtinCodes, reason);
  }
};

export default function ProductDetail({ data, isInvitaliaUser, onUpdateTable, onClose }: Props) {
  const { t } = useTranslation();
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [excludeModalOpen, setExcludeModalOpen] = useState(false);

  const handleConfirmRestore = () => {
    handleOpenModal('APPROVED', data.organizationId, [data.gtinCode], 'TODO');
    setRestoreDialogOpen(false);
    if (typeof onUpdateTable === 'function') {
      onUpdateTable();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleExcludeClose = () => {
    setExcludeModalOpen(false);
    if (typeof onUpdateTable === 'function') {
      onUpdateTable();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <Box sx={{ minWidth: 400, pl: 2 }} role="presentation" data-testid="product-detail">
      <List>
        {isInvitaliaUser && data.status && data.status === 'REJECTED' && (
          <ListItem disablePadding>
            <Box sx={{ mb: 1, ml: 2 }}>
              <Chip
                icon={<ErrorIcon color="error" />}
                color="error"
                label="Prodotto Escluso"
                size="medium"
              />
            </Box>
          </ListItem>
        )}
        {isInvitaliaUser && data.status && data.status !== 'REJECTED' && (
          <ListItem disablePadding>
            <Box sx={{ mb: 1, ml: 2 }}>
              <Chip
                icon={<WarningIcon color="warning" />}
                color="warning"
                label="Prodotto contrassegnato"
                size="medium"
              />
            </Box>
          </ListItem>
        )}
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
              {data?.batchName || EMPTY_DATA}
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
              {String(format(Number(data?.registrationDate), 'dd/MM/yyyy')) || EMPTY_DATA}
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
              {data?.eprelCode || EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Codice GTIN/EAN
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.gtinCode || EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Codice prodotto
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.productCode || EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Categoria
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.category ? t(`pages.products.categories.${data?.category}`) : EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Marca
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.brand || EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Modello
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.model || EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Classe energetica
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.energyClass || EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Paese di produzione
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.countryOfProduction || EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        <ListItem>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Capacità
            </Typography>
            <Typography variant="body2" fontWeight="fontWeightMedium">
              {data?.capacity || EMPTY_DATA}
            </Typography>
          </Box>
        </ListItem>
        {isInvitaliaUser && data.status && data.status !== 'REJECTED' && (
          <ListItem>
            <Box mt={2} display="flex" flexDirection="row" justifyContent="flex-start">
              <Button
                color="primary"
                variant="contained"
                sx={{
                  ...buttonStyle,
                  width: '138px',
                }}
                onClick={() => setRestoreDialogOpen(true)}
              >
                Ripristina
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{
                  ...buttonStyle,
                  width: '92px',
                }}
                onClick={() => setExcludeModalOpen(true)}
              >
                Escludi
              </Button>
            </Box>
          </ListItem>
        )}
        {isInvitaliaUser && data.status && data.status === 'REJECTED' && (
          <ListItem>
            <Box mt={2} display="flex" flexDirection="row" justifyContent="flex-start">
              <Button
                color="primary"
                variant="contained"
                sx={{
                  ...buttonStyle,
                  width: '138px',
                }}
                onClick={() => setRestoreDialogOpen(true)}
              >
                Ripristina
              </Button>
            </Box>
          </ListItem>
        )}
      </List>
      <ProductConfirmDialog
        open={restoreDialogOpen}
        title="Ripristina prodotto"
        message="Vuoi ripristinare il prodotto segnalato in precedenza?"
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={handleConfirmRestore}
      />
      <ProductModal
        open={excludeModalOpen}
        onClose={handleExcludeClose}
        gtinCodes={[data.gtinCode]}
        actionType="rejected"
        organizationId={data.organizationId}
        onUpdateTable={onUpdateTable}
      />
    </Box>
  );
}
