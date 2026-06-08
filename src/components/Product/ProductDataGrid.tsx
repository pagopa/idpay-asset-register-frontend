import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';

import { fetchUserFromLocalStorage } from '../../helpers';
import {
  institutionSelector,
  setInstitutionList,
  setInstitution,
} from '../../redux/slices/invitaliaSlice';
import {
  batchIdSelector,
  batchNameSelector,
  setBatchId,
  setBatchName,
} from '../../redux/slices/productsSlice';

import { ProductStatus, ProductDTO } from '../../api/generated/register';
import { setWaitApprovedStatusList } from '../../services/registerService';

import { DEBUG_CONSOLE, EMPTY_DATA, USERS_NAMES, USERS_TYPES } from '../../utils/constants';

import DetailDrawer from '../DetailDrawer/DetailDrawer';
import FiltersDrawer from '../FiltersDrawer/FiltersDrawer';
import { SelectProps } from '../FiltersDrawer/filtersRender';
import EmptyListTable from '../../pages/components/EmptyListTable';

import { useProductsTable } from './hooks/useProductsTable';
import { useProductDataGridInit } from './hooks/useProductDataGridInit';
import { useResolvedProductTableConfig } from './hooks/useResolvedProductTableConfig';
import { useEnrichedProductFilters } from './hooks/useEnrichedProductFilters';
import { useTargetOrganization } from './hooks/useTargetOrganization';

import ProductDataGridView from './ProductDataGridView';
import ProductResultMessages from './ProductResultMessages';
import ProductDetail from './ProductDetail';
import ProductModal from './ProductModal';
import ProductConfirmDialog from './ProductConfirmDialog';

import { getStatusChecks } from './ProductDataGrid.helpers';
import {
  deriveSelectedProducts,
  computeEffectiveColumns,
  buildFiltersValue,
} from './productSelectors';
import { resolveProductAction } from './productActionResolver';
import { resolveMessageForAction, ProductRoleContext } from './productRoleLogic';

type Props = {
  organizationId: string;
  organizationLabel?: string;
};

type FilterValue = { value: string; label?: string };
type FiltersState = Record<string, FilterValue>;

/* ============================================================================
 * Helpers
 * ========================================================================== */

const normalizeLegacyColumn = (col: any) => {
  if (typeof col?.labelKey === 'string' && col.labelKey.startsWith('pages.products.listHeader.')) {
    const legacyIdMap: Record<string, string> = {
      organizationName: 'producer',
    };

    const mappedId = legacyIdMap[col.id] ?? col.id;

    return {
      ...col,
      labelKey: `tables.products.columns.${mappedId}`,
    };
  }

  return col;
};

const useResultMessages = () => {
  const [state, setState] = useState({
    rejected: false,
    approved: false,
    waitApproved: false,
    supervised: false,
    rejectedApprovation: false,
    acceptApprovation: false,
    mixStatusError: false,
    yourselfApprovedError: false,
    genericError: false,
  });

  const reset = useCallback(() => {
    setState((prev) =>
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {} as typeof prev)
    );
  }, []);

  useEffect(() => {
    const isVisible = Object.values(state).some(Boolean);

    if (!isVisible) {
      return;
    }

    const timer = setTimeout(reset, 3000);
    return () => clearTimeout(timer);
  }, [state, reset]);

  return { state, setState, reset };
};

/* ============================================================================
 * Component
 * ========================================================================== */

const ProductDataGrid: React.FC<Props> = ({ organizationId }) => {
  const { t } = useScopedTranslation();
  const dispatch = useDispatch();
  const location = useLocation();

  const initiativeId = useCurrentInitiativeId();
  const { config } = useInitiativeConfig();
  const typedConfig = config as import('../../model/config/ConfigSchema').InitiativeConfig;

  const { tableConfig, paginationConfig, filtersConfig, templateConfig } =
    useResolvedProductTableConfig(typedConfig);

  const user = useMemo(() => fetchUserFromLocalStorage(), []);
  const role = user?.org_role as string | undefined;
  const currentRoleKey = user?.org_role as string | undefined;

  const isInvitaliaUser = role === USERS_TYPES.INVITALIA_L1;
  const isInvitaliaAdmin = role === USERS_TYPES.INVITALIA_L2;

  const subRoleConfig = config?.subRoles?.[currentRoleKey as string];
  const hasProductsPermission = subRoleConfig?.permissions?.tables?.includes('products');

  const institution = useSelector(institutionSelector);
  const batchId = useSelector(batchIdSelector);
  const batchName = useSelector(batchNameSelector);

  const batchFromHistory = (location.state as any)?.batchId;

  /* --------------------------------------------------------------------------
   * Filters
   * ------------------------------------------------------------------------ */

  const initialBatchFilters = useMemo<FiltersState>(() => {
    if (!batchId) {
      return {} as FiltersState;
    }

    const displayBatchName = batchName?.replace(/\.csv$/i, '') || batchName || batchId;

    return {
      productFileId: {
        value: batchId,
        label: displayBatchName,
      },
    } as FiltersState;
  }, [batchId, batchName]);

  const [filters, setFilters] = useState<FiltersState>(() => {
    const base = initialBatchFilters;

    // UAT storico: L2 deve atterrare su WAIT_APPROVED
    if (role === USERS_TYPES.INVITALIA_L2) {
      return {
        ...base,
        status: {
          value: ProductStatus.WAIT_APPROVED,
          label: t(`pages.products.categories.${ProductStatus.WAIT_APPROVED}`),
        },
      };
    }

    return base;
  });

  const filtersSignature = useMemo(
    () =>
      Object.entries(filters)
        .map(([key, obj]) => `${key}:${obj?.value}`)
        .join('|'),
    [filters]
  );

  const filtersValue = useMemo(() => buildFiltersValue(filters), [filters]);

  /* --------------------------------------------------------------------------
   * Organization resolution
   * ------------------------------------------------------------------------ */

  const [activeOrganizationId, setActiveOrganizationId] = useState(organizationId);

  const { targetId } = useTargetOrganization({
    organizationId: activeOrganizationId,
    user,
    filtersValue,
    tableConfig,
  });

  const isReady = useMemo(() => {
    if (tableConfig?.organizationSource === 'user') {
      return !!user?.org_id;
    }

    if (tableConfig?.organizationSource === 'filter') {
      if (isInvitaliaAdmin) {
        return true;
      }
      return !!institution?.institutionId;
    }

    return true;
  }, [tableConfig?.organizationSource, user?.org_id, isInvitaliaAdmin, institution?.institutionId]);

  /* --------------------------------------------------------------------------
   * Init hooks
   * ------------------------------------------------------------------------ */

  const { batchFilterItems } = useProductDataGridInit({
    initiativeId,
    organizationId,
    isInvitaliaUser,
    isInvitaliaAdmin,
    institutionId: institution?.institutionId,
    dispatch,
    setInstitutionList,
  });

  const batchFilter: Record<string, SelectProps> = useMemo(
    () =>
      batchFilterItems.reduce((acc, batch) => {
        const name = batch?.batchName?.replace(/\.csv$/i, '') || '';
        return {
          ...acc,
          [batch?.productFileId || '']: {
            label: name,
            value: name,
          },
        };
      }, {}),
    [batchFilterItems]
  );

  const { enrichedFiltersConfig } = useEnrichedProductFilters({
    typedConfig,
    filtersConfig,
    batchFilter,
    t,
  });

  /* --------------------------------------------------------------------------
   * Table state
   * ------------------------------------------------------------------------ */

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof ProductDTO>('category');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(paginationConfig?.defaultRowsPerPage ?? 10);
  const [selected, setSelected] = useState<Array<string>>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * SAFE FIX definitivo (explicit role check):
   * - OPERATORE → attende targetId
   * - L1 / L2 → non attendono targetId
   */
  const enabled = !!tableConfig && isReady && (role !== USERS_TYPES.OPERATORE || !!targetId);

  const { tableData, loading, itemsQty, paginatorFrom, paginatorTo } = useProductsTable({
    refreshKey,
    initiativeId,
    organizationId: targetId,
    orderBy,
    order,
    page,
    rowsPerPage,
    enabled,
    organizationSource: tableConfig?.organizationSource,
    ...(batchFromHistory ? { batch: batchFromHistory } : { ...filtersValue }),
  });

  /* --------------------------------------------------------------------------
   * Selection derived data
   * ------------------------------------------------------------------------ */

  const selectedProductsList = useMemo(
    () => deriveSelectedProducts(tableData, selected),
    [selected, tableData]
  );

  /* --------------------------------------------------------------------------
   * Result messages
   * ------------------------------------------------------------------------ */

  const { state: msg, setState: setMsg, reset: resetMsg } = useResultMessages();

  const roleContext: ProductRoleContext = {
    isL1: isInvitaliaUser,
    isL2: isInvitaliaAdmin,
  };

  const setMsgResultByAction = (actionType?: string) => {
    const messageKey = resolveMessageForAction({
      actionType,
      role: roleContext,
    });

    if (!messageKey) {
      return;
    }

    setMsg((s) => ({ ...s, [messageKey]: true }));
  };

  /* --------------------------------------------------------------------------
   * Effects (grouped logically)
   * ------------------------------------------------------------------------ */

  useEffect(() => {
    setSelected([]);
  }, [filtersSignature]);

  useEffect(() => {
    if (paginationConfig?.defaultRowsPerPage) {
      setRowsPerPage(paginationConfig.defaultRowsPerPage);
    }
    setPage(0);
  }, [initiativeId, paginationConfig]);

  useEffect(() => {
    // UAT storico: al cambio iniziativa L2 deve restare su WAIT_APPROVED
    if (role === USERS_TYPES.INVITALIA_L2) {
      setFilters({
        status: {
          value: ProductStatus.WAIT_APPROVED,
          label: t(`pages.products.categories.${ProductStatus.WAIT_APPROVED}`),
        },
      });
    } else {
      setFilters({});
    }

    setPage(0);
    setSelected([]);
  }, [initiativeId, role]);

  /* --------------------------------------------------------------------------
   * Actions
   * ------------------------------------------------------------------------ */

  const callWaitApprovedApi = async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatus,
    motivation: string
  ) => {
    try {
      await setWaitApprovedStatusList(initiativeId, gtinCodes, currentStatus, motivation);
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error(error);
      }
      setMsg((s) => ({ ...s, genericError: true }));
    }
  };

  const handleOpenModalWithStatusCheck = (action: string) => {
    const { selectedStatuses, someUploaded, length } = getStatusChecks(selected, tableData);

    const resolution = resolveProductAction({
      action,
      isInvitaliaAdmin,
      selectedStatuses,
      someUploaded,
      selectedLength: length,
      preventSameStatusTransition: tableConfig?.actionPolicies?.preventSameStatusTransition,
    });

    console.log('RESOLUTION', resolution);

    switch (resolution.type) {
      case 'NO_SELECTION':
        return;
      case 'ERROR_SELF_APPROVAL':
        setMsg((s) => ({ ...s, yourselfApprovedError: true }));
        return;
      case 'ERROR_MIX_STATUS':
        setMsg((s) => ({ ...s, mixStatusError: true }));
        return;
      case 'ERROR_SAME_STATUS':
        setMsg((s) => ({ ...s, genericError: true }));
        return;
      case 'OPEN_RESTORE_DIALOG':
        setRestoreDialogOpen(true);
        return;
      case 'OPEN_MODAL':
        setModalAction(resolution.action);
        setModalOpen(true);
        return;
    }
  };

  /* --------------------------------------------------------------------------
   * UI state
   * ------------------------------------------------------------------------ */

  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<string | undefined>();
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  /* --------------------------------------------------------------------------
   * Columns
   * ------------------------------------------------------------------------ */

  const effectiveColumns = useMemo(
    () => computeEffectiveColumns(tableConfig?.columns ?? [], normalizeLegacyColumn),
    [tableConfig]
  );

  /* --------------------------------------------------------------------------
   * Guards
   * ------------------------------------------------------------------------ */

  if (!tableConfig || !isReady) {
    return null;
  }

  if (!hasProductsPermission) {
    return <EmptyListTable message="pages.products.noFileLoaded" />;
  }

  /* ==========================================================================
   * Render
   * ========================================================================= */

  return (
    <>
      <ProductDataGridView
        isInvitaliaUser={isInvitaliaUser}
        isInvitaliaAdmin={isInvitaliaAdmin}
        tableData={tableData}
        hookLoading={loading}
        itemsQty={itemsQty ?? 0}
        paginatorFrom={paginatorFrom ?? 0}
        paginatorTo={paginatorTo ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        order={order}
        orderBy={orderBy}
        filters={filters}
        enrichedFiltersConfig={enrichedFiltersConfig}
        selected={selected}
        effectiveColumns={effectiveColumns}
        paginationConfig={paginationConfig}
        tableConfig={tableConfig}
        refreshKey={refreshKey}
        onRequestSort={(_event: React.MouseEvent<unknown>, prop: keyof ProductDTO) => {
          const isAsc = orderBy === prop && order === 'asc';
          setOrder(isAsc ? 'desc' : 'asc');
          setOrderBy(prop);
        }}
        handleListButtonClick={(row: ProductDTO) => {
          setSelectedProduct(row);
          setDetailOpen(true);
        }}
        setSelected={setSelected}
        handleChangePage={(_event: unknown, p: number) => setPage(p)}
        handleChangeRowsPerPage={(e: React.ChangeEvent<HTMLInputElement>) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        handleDeleteFiltersButtonClick={() => {
          setFilters({});
          setActiveOrganizationId('');
          setPage(0);
          setSelected([]);
          dispatch(setBatchId(''));
          dispatch(setBatchName(''));
          dispatch(
            setInstitution({
              institutionId: '',
              createdAt: '',
              updatedAt: '',
              description: '',
            })
          );
        }}
        handleToggleFiltersDrawer={setFiltersDrawerOpen}
        handleOpenModalWithStatusCheck={handleOpenModalWithStatusCheck}
      />

      <ProductResultMessages
        showMsgWaitApproved={msg.waitApproved}
        showMsgSupervised={msg.supervised}
        showMsgApproved={msg.approved}
        showMsgAcceptApprovation={msg.acceptApprovation}
        showMsgRejected={msg.rejected}
        showMsgRejectedApprovation={msg.rejectedApprovation}
        showMixStatusError={msg.mixStatusError}
        showYourselfApprovedError={msg.yourselfApprovedError}
        showGenericError={msg.genericError}
        bottom={80}
      />

      <ProductModal
        open={modalOpen}
        onClose={(cancelled) => {
          setModalOpen(false);
          if (cancelled) {
            resetMsg();
          }
        }}
        actionType={modalAction}
        onUpdateTable={() => {
          setRefreshKey((prev) => prev + 1);
          setSelected([]);
        }}
        selectedProducts={selectedProductsList}
        onSuccess={(actionType) => setMsgResultByAction(actionType)}
      />

      <ProductConfirmDialog
        open={restoreDialogOpen}
        cancelButtonText={t('invitaliaModal.waitApproved.buttonTextCancel')}
        confirmButtonText={`${t('invitaliaModal.waitApproved.buttonTextConfirm')} (${
          selected.length
        })`}
        title={t('invitaliaModal.waitApproved.listTitle')}
        message={t('invitaliaModal.waitApproved.description', {
          L2: USERS_NAMES.INVITALIA_L2,
        })}
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={async () => {
          const currentStatus =
            (tableData.find((r) => r.gtinCode === selected[0])?.status as ProductStatus) ||
            ProductStatus.SUPERVISED;

          await callWaitApprovedApi(selected, currentStatus, EMPTY_DATA);

          setRefreshKey((prev) => prev + 1);
          setRestoreDialogOpen(false);
          setMsg((s) => ({ ...s, approved: true }));
        }}
      />

      {selectedProduct && (
        <DetailDrawer
          open={detailOpen}
          toggleDrawer={(isOpen) => {
            setDetailOpen(isOpen);
            if (!isOpen) {
              setSelectedProduct(null);
            }
          }}
        >
          <ProductDetail
            open={detailOpen}
            data={selectedProduct}
            detailFields={tableConfig?.detail?.fields}
            isInvitaliaUser={isInvitaliaUser}
            isInvitaliaAdmin={isInvitaliaAdmin}
            onClose={() => {
              setDetailOpen(false);
              setSelectedProduct(null);
            }}
            onUpdateTable={() => {
              setDetailOpen(false);
              setSelectedProduct(null);
              setRefreshKey((prev) => prev + 1);
            }}
            onShowApprovedMsg={() => setMsg((s) => ({ ...s, approved: true }))}
            onShowRejectedMsg={() => setMsg((s) => ({ ...s, rejected: true }))}
            onShowWaitApprovedMsg={() => setMsg((s) => ({ ...s, waitApproved: true }))}
            onShowSupervisedMsg={() => setMsg((s) => ({ ...s, supervised: true }))}
            onShowRejectedApprovationMsg={() =>
              setMsg((s) => ({ ...s, rejectedApprovation: true }))
            }
            onShowAcceptApprovationMsg={() => setMsg((s) => ({ ...s, acceptApprovation: true }))}
            onShowGenericError={() => setMsg((s) => ({ ...s, genericError: true }))}
          />
        </DetailDrawer>
      )}

      <FiltersDrawer
        open={filtersDrawerOpen}
        toggleFiltersDrawer={setFiltersDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        setPage={setPage}
        batchFilterItems={batchFilter}
        filtersConfig={enrichedFiltersConfig}
        templateConfig={templateConfig}
      />
    </>
  );
};

export default ProductDataGrid;
