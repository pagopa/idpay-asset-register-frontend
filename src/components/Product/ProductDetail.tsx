import { List, Divider, Box } from '@mui/material';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_DATA, MAX_LENGTH_DETAILL_PR } from '../../utils/constants';
import { truncateString } from '../../helpers';
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
  motivation: string
) => {
  try {
    await setApprovedStatusList(organizationId, gtinCodes, motivation);
  } catch (error) {
    console.error(error);
  }
};

const callRejectedApi = async (
  organizationId: string,
  gtinCodes: Array<string>,
  motivation: string
) => {
  try {
    await setRejectedStatusList(organizationId, gtinCodes, motivation);
  } catch (error) {
    console.error(error);
  }
};

const handleOpenModal = (
  action: string,
  organizationId: string,
  gtinCodes: Array<string>,
  motivation: string
) => {
  if (action === 'REJECTED') {
    return callRejectedApi(organizationId, gtinCodes, motivation);
  } else if (action === 'APPROVED') {
    return callApprovedApi(organizationId, gtinCodes, motivation);
  }
  return Promise.resolve();
};

export default function ProductDetail({ data, isInvitaliaUser, onUpdateTable, onClose }: Props) {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [excludeModalOpen, setExcludeModalOpen] = useState(false);
  const [supervisionModalOpen, setSupervisionModalOpen] = useState(false);

  const { t } = useTranslation();

  const handleConfirmRestore = async () => {
    await handleOpenModal('APPROVED', data.organizationId, [data.gtinCode], 'TODO');
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

  const handleSupervisionClose = () => {
    setSupervisionModalOpen(false);
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
        <ProductStatusChip status={data.status} />
        <ProductInfoRow
          label=""
          value={truncateString(data?.productName, MAX_LENGTH_DETAILL_PR)}
          valueVariant="h6"
          sx={{ mb: 1, maxWidth: 350, wordWrap: 'break-word' }}
        />
        <ProductInfoRow
          label=""
          value={truncateString(data?.batchName || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
          labelVariant="body2"
          valueVariant="body2"
        />
        <Divider sx={{ mb: 2, fontWeight: '600', fontSize: '16px' }} />
        <ProductInfoRow
          label={t('pages.productDetail.eprelCheckDate')}
          value={truncateString(
            String(format(Number(data?.registrationDate), 'dd/MM/yyyy')) || EMPTY_DATA,
            MAX_LENGTH_DETAILL_PR
          )}
        />
        <ProductInfoRow
          label=""
          value={t('pages.productDetail.productSheet')}
          labelVariant="body2"
          valueVariant="body2"
          sx={{ mt: 4, mb: 2 }}
        />
        <ProductInfoRow
          label={t('pages.productDetail.eprelCode')}
          value={truncateString(data?.eprelCode || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        <ProductInfoRow
          label={t('pages.productDetail.gtinCode')}
          value={truncateString(data?.gtinCode || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        <ProductInfoRow
          label={t('pages.productDetail.productCode')}
          value={truncateString(data?.productCode || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        <ProductInfoRow
          label={t('pages.productDetail.category')}
          value={truncateString(data?.category || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        <ProductInfoRow
          label={t('pages.productDetail.brand')}
          value={truncateString(data?.brand || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        <ProductInfoRow
          label={t('pages.productDetail.model')}
          value={truncateString(data?.model || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        <ProductInfoRow
          label={t('pages.productDetail.energyClass')}
          value={truncateString(data?.energyClass || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        <ProductInfoRow
          label={t('pages.productDetail.countryOfProduction')}
          value={truncateString(data?.countryOfProduction || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        <ProductInfoRow
          label={t('pages.productDetail.capacity')}
          value={truncateString(data?.capacity || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
        />
        {data.status !== 'APPROVED' && (
          <ProductInfoRow
            label={t('pages.productDetail.motivation')}
            value={truncateString(data?.motivation || EMPTY_DATA, MAX_LENGTH_DETAILL_PR)}
          />
        )}

        <ProductActionButtons
          isInvitaliaUser={isInvitaliaUser}
          status={data.status}
          onRestore={() => setRestoreDialogOpen(true)}
          onExclude={() => setExcludeModalOpen(true)}
          onSupervision={() => setSupervisionModalOpen(true)}
        />
      </List>
      <ProductConfirmDialog
        open={restoreDialogOpen}
        title={t('pages.productDetail.restoreProductTitle')}
        message={t('pages.productDetail.restoreProductMessage')}
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={handleConfirmRestore}
      />
      <ProductModal
        open={excludeModalOpen}
        onClose={handleExcludeClose}
        gtinCodes={[data.gtinCode]}
        productName={data.productName}
        actionType="rejected"
        organizationId={data.organizationId}
        onUpdateTable={onUpdateTable}
      />
      <ProductModal
        open={supervisionModalOpen}
        onClose={handleSupervisionClose}
        gtinCodes={[data.gtinCode]}
        productName={data.productName}
        actionType="supervisioned"
        organizationId={data.organizationId}
        onUpdateTable={onUpdateTable}
      />
    </Box>
  );
}
