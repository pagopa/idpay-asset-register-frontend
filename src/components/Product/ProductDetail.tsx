import { List, Divider, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useState } from 'react';
import { EMPTY_DATA } from '../../utils/constants';
import { ProductDTO } from '../../api/generated/register/ProductDTO';
import { setApprovedStatusList, setRejectedStatusList } from '../../services/registerService';
import ProductConfirmDialog from './ProductConfirmDialog';
import ProductModal from './ProductModal';
import ProductInfoRow from './ProductInfoRow';
import ProductStatusChip from './ProductStatusChip';
import ProductActionButtons from './ProductActionButtons';

type Props = {
  open: boolean;
  data: ProductDTO;
  isInvitaliaUser: boolean;
  onUpdateTable?: () => void;
  onClose?: () => void;
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
        <ProductStatusChip status={data.status} isInvitaliaUser={isInvitaliaUser} />
        <ProductInfoRow
          label=""
          value={data?.productName}
          valueVariant="h6"
          sx={{ mb: 1, ml: 2, maxWidth: 350, wordWrap: 'break-word' }}
        />
        <ProductInfoRow
          label=""
          value={data?.batchName || EMPTY_DATA}
          labelVariant="body2"
          valueVariant="body2"
        />
        <Divider sx={{ mb: 2, fontWeight: '600', fontSize: '16px' }} />
        <ProductInfoRow
          label="Data verifica EPREL"
          value={String(format(Number(data?.registrationDate), 'dd/MM/yyyy')) || EMPTY_DATA}
        />
        <ProductInfoRow
          label=""
          value="SCHEDA PRODOTTO"
          labelVariant="body2"
          valueVariant="body2"
          sx={{ mt: 4 }}
        />
        <ProductInfoRow label="Codice EPREL" value={data?.eprelCode || EMPTY_DATA} />
        <ProductInfoRow label="Codice GTIN/EAN" value={data?.gtinCode || EMPTY_DATA} />
        <ProductInfoRow label="Codice prodotto" value={data?.productCode || EMPTY_DATA} />
        <ProductInfoRow
          label="Categoria"
          value={data?.category ? t(`pages.products.categories.${data?.category}`) : EMPTY_DATA}
        />
        <ProductInfoRow label="Marca" value={data?.brand || EMPTY_DATA} />
        <ProductInfoRow label="Modello" value={data?.model || EMPTY_DATA} />
        <ProductInfoRow label="Classe energetica" value={data?.energyClass || EMPTY_DATA} />
        <ProductInfoRow
          label="Paese di produzione"
          value={data?.countryOfProduction || EMPTY_DATA}
        />
        <ProductInfoRow label="Capacità" value={data?.capacity || EMPTY_DATA} />
        <ProductActionButtons
          isInvitaliaUser={isInvitaliaUser}
          status={data.status}
          onRestore={() => setRestoreDialogOpen(true)}
          onExclude={() => setExcludeModalOpen(true)}
        />
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
