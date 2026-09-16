import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { fetchUserFromLocalStorage, isInitiativeTerminated } from '../../helpers';
import { useCurrentInitiative } from '../../hooks/useCurrentInitiative';
import {
  institutionSelector,
  setInstitutionList,
  setInstitution,
} from '../../redux/slices/invitaliaSlice';
import { ProductStatus } from '../../api/generated/register';
import { DEBUG_CONSOLE, EMPTY_DATA, USERS_NAMES, USERS_TYPES } from '../../utils/constants';
import { setWaitApprovedStatusList } from '../../services/registerService';
import {
  batchIdSelector,
  batchNameSelector,
  setBatchId,
  setBatchName,
} from '../../redux/slices/productsSlice';
import { ProductDTO } from '../../api/generated/register';

import DetailDrawer from '../DetailDrawer/DetailDrawer';
import FiltersDrawer from '../FiltersDrawer/FiltersDrawer';
import { SelectProps } from '../FiltersDrawer/filtersRender';
import EmptyListTable from '../../pages/components/EmptyListTable';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../utils/constants';
import { useProductsTable } from './hooks/useProductsTable';
import { useProductDataGridInit } from './hooks/useProductDataGridInit';

import ProductDataGridView from './ProductDataGridView';
import ProductResultMessages from './ProductResultMessages';
import ProductDetail from './ProductDetail';

type Props = {
  organizationId: string;
  organizationLabel?: string;
};

import { useResolvedProductTableConfig } from './hooks/useResolvedProductTableConfig';
import { useEnrichedProductFilters } from './hooks/useEnrichedProductFilters';
import { useTargetOrganization } from './hooks/useTargetOrganization';
import ProductModal from './ProductModal';
import ProductConfirmDialog from './ProductConfirmDialog';
import { getProductRowKey, getStatusChecks } from './ProductDataGrid.helpers';

const ProductDataGrid: React.FC<Props> = ({ organizationId, organizationLabel }) => {
  const { t } = useScopedTranslation();
  const dispatch = useDispatch();
  const initiativeId = useCurrentInitiativeId();
  const currentInitiative = useCurrentInitiative();
  const { config } = useInitiativeConfig();
  const typedConfig = config as import('../../model/config/ConfigSchema').InitiativeConfig;
  const { tableConfig, paginationConfig, filtersConfig, templateConfig } =
    useResolvedProductTableConfig(typedConfig);

  const [activeOrganizationId, setActiveOrganizationId] = useState(organizationId);
  const [redirectProducer, setRedirectProducer] = useState<{
    value: string;
    label?: string;
  } | null>(null);
  const [lastRedirectOrganizationId, setLastRedirectOrganizationId] = useState<string | null>(null);
  const [redirectProducerManuallyCleared, setRedirectProducerManuallyCleared] = useState(false);

  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const location = useLocation();
  const batchFromHistory = (location.state as any)?.batchId;

  const currentRoleKey = user?.org_role as string | undefined;

  const subRoleConfig = config?.subRoles?.[currentRoleKey as string];
  const hasProductsPermission = subRoleConfig?.permissions?.tables?.includes('products');

  const role = currentRoleKey?.toLowerCase();

  const isInvitaliaUser = role === USERS_TYPES.INVITALIA_L1;
  const isInvitaliaAdmin = role === USERS_TYPES.INVITALIA_L2;
  const isInitiativeClosed = isInitiativeTerminated(
    currentInitiative?.endDate,
    currentInitiative?.status
  );

  const institution = useSelector(institutionSelector);
  const batchId = useSelector(batchIdSelector);
  const batchName = useSelector(batchNameSelector);
  const initialBatchFilters = useMemo<Record<string, { value: string; label?: string }>>((): Record<
    string,
    { value: string; label?: string }
  > => {
    if (!batchId) {
      return {};
    }

    const displayBatchName = batchName?.replace(/\.csv$/i, '') || batchName || batchId;

    return {
      productFileId: {
        value: batchId,
        label: displayBatchName,
      },
    };
  }, [batchId, batchName]);

  const [filters, setFilters] = useState<Record<string, { value: string; label?: string }>>({
    ...initialBatchFilters,
    ...(isInvitaliaAdmin
      ? {
          status: {
            value: PRODUCTS_STATES.WAIT_APPROVED,
            label: t('chip.productStatusLabel.waitApproved'),
          },
        }
      : {}),
  });

  const effectiveFilters = useMemo(
    () => (redirectProducer ? { producer: redirectProducer, ...filters } : filters),
    [filters, redirectProducer]
  );

  const filtersSignature = useMemo(
    () =>
      Object.entries(effectiveFilters)
        .map(([key, obj]) => `${key}:${obj?.value}`)
        .join('|'),
    [effectiveFilters]
  );

  const filtersValue: typeof filters & { producer?: string } = Object.keys(effectiveFilters).length
    ? Object.entries(effectiveFilters)?.reduce(
        (acc, [key, obj]) => ({ ...acc, [key]: obj?.value }),
        {}
      )
    : {};

  const { targetId } = useTargetOrganization({
    organizationId: activeOrganizationId,
    user,
    filtersValue,
    tableConfig,
  });
  const queryOrganizationId = effectiveFilters.producer?.value || targetId;
  const apiFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(effectiveFilters)
          .filter(([key]) => key !== 'producer')
          .map(([key, value]) => [key, value.value])
      ),
    [effectiveFilters]
  );

  const isReady = useMemo(() => {
    if (tableConfig?.organizationSource === 'user') {
      return !!user?.org_id;
    }

    return true;
  }, [tableConfig?.organizationSource, user?.org_id]);

  useEffect(() => {
    if (batchId) {
      const displayBatchName = batchName?.replace(/\.csv$/i, '') || batchName || batchId;

      setPage(0);
      setSelected([]);
      setFilters((prev) => {
        if (prev.productFileId?.value === batchId) {
          return prev;
        }

        return {
          ...prev,
          productFileId: {
            value: batchId,
            label: displayBatchName,
          },
        };
      });

      dispatch(setBatchId(''));
      dispatch(setBatchName(''));
    }

    if (batchFromHistory) {
      setFilters((prev) => {
        if (prev.productFileId?.value === batchFromHistory) {
          return prev;
        }

        return {
          ...prev,
          productFileId: {
            value: batchFromHistory,
            label: batchFromHistory,
          },
        };
      });
    }
  }, [batchFromHistory, batchId, batchName, dispatch]);

  useEffect(() => {
    if ((!isInvitaliaUser && !isInvitaliaAdmin) || !organizationId) {
      return;
    }

    if (redirectProducerManuallyCleared && lastRedirectOrganizationId === organizationId) {
      return;
    }

    setRedirectProducer({
      value: organizationId,
      label: organizationLabel || institution?.description || organizationId,
    });
    setActiveOrganizationId(organizationId);
    setLastRedirectOrganizationId(organizationId);
    setRedirectProducerManuallyCleared(false);
  }, [
    isInvitaliaUser,
    isInvitaliaAdmin,
    organizationId,
    organizationLabel,
    institution?.description,
    lastRedirectOrganizationId,
    redirectProducerManuallyCleared,
  ]);

  const { batchFilterItems } = useProductDataGridInit({
    initiativeId,
    organizationId,
    isInvitaliaUser,
    isInvitaliaAdmin,
    institutionId: institution?.institutionId,
    dispatch,
    setInstitutionList,
  });

  const [trackedInitiativeId, setTrackedInitiativeId] = useState(initiativeId);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof ProductDTO>('category');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(paginationConfig?.defaultRowsPerPage ?? 10);
  const [selected, setSelected] = useState<Array<string>>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSelected([]);
  }, [filtersSignature, queryOrganizationId, refreshKey]);

  useEffect(() => {
    if (trackedInitiativeId === initiativeId) {
      return;
    }

    setFilters({});
    setActiveOrganizationId(organizationId);
    setRedirectProducer(null);
    setLastRedirectOrganizationId(null);
    setRedirectProducerManuallyCleared(false);
    setPage(0);
    setSelected([]);
    setTrackedInitiativeId(initiativeId);
    dispatch(setBatchId(''));
    dispatch(setBatchName(''));
    dispatch(setInstitution({ institutionId: '', createdAt: '', updatedAt: '', description: '' }));
  }, [initiativeId, organizationId, trackedInitiativeId, dispatch]);

  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);

  const { tableData, loading, itemsQty, paginatorFrom, paginatorTo } = useProductsTable({
    refreshKey,
    initiativeId,
    organizationId: queryOrganizationId,
    orderBy,
    order,
    page,
    rowsPerPage,
    ...apiFilters,
  });

  const selectedProductsList = useMemo(
    () =>
      tableData
        .filter((row) => selected.includes(getProductRowKey(row)))
        .map((row) => ({
          status: row.status as ProductStatus,
          productName: row.productName,
          gtinCode: getProductRowKey(row),
          category: row.category,
        })) as Array<{
        status: ProductStatus;
        productName?: string;
        gtinCode: string;
        category?: string;
      }>,
    [selected, tableData]
  );

  // Replace producer label with readable name once products are loaded
  useEffect(() => {
    if (
      organizationId &&
      filters.producer &&
      filters.producer.label === organizationId &&
      tableData?.length > 0
    ) {
      const readableName = (tableData[0] as any)?.organizationName;

      if (readableName) {
        setFilters((prev) => ({
          ...prev,
          producer: {
            value: organizationId,
            label: readableName,
          },
        }));
      }
    }
  }, [organizationId, tableData]);

  const batchFilter: Record<string, SelectProps> = useMemo(
    () =>
      batchFilterItems.reduce((acc, batch) => {
        const batchName = batch?.batchName?.replace(/\.csv$/i, '') || '';
        return {
          ...acc,
          [batch?.productFileId || '']: {
            label: batchName,
            value: batchName,
          },
        };
      }, {}),
    [batchFilterItems]
  );

  const { enrichedFiltersConfig } = useEnrichedProductFilters({
    isInvitalia: isInvitaliaAdmin || isInvitaliaUser,
    typedConfig,
    filtersConfig,
    batchFilter,
    t,
    currentRoleKey,
  });

  // Apply role-based default filters (e.g. L2 -> WAIT_APPROVED)
  useEffect(() => {
    if (!currentRoleKey) {
      return;
    }

    const roleDefaults = tableConfig?.defaultFiltersByRole?.[currentRoleKey];

    if (!roleDefaults) {
      return;
    }

    setFilters((prev) => {
      // do not override manually set filters
      if (prev && Object.keys(prev).length > 0 && prev.status) {
        return prev;
      }

      const mappedDefaults = Object.entries(roleDefaults).reduce<
        Record<string, { value: string; label?: string }>
      >((acc, [key, value]) => {
        const filterConfigItem = enrichedFiltersConfig?.find((f: any) => f.id === key);

        const label =
          filterConfigItem?.options && value && filterConfigItem.options[value]
            ? t(filterConfigItem.options[value].labelKey)
            : (value as string);

        return {
          ...acc,
          [key]: { value: value as string, label },
        };
      }, {});

      return {
        ...mappedDefaults,
        ...prev,
      };
    });
  }, [currentRoleKey, tableConfig]);

  useEffect(() => {
    if (paginationConfig?.defaultRowsPerPage) {
      setRowsPerPage(paginationConfig.defaultRowsPerPage);
    }
    setPage(0);
  }, [initiativeId, paginationConfig]);

  useEffect(() => {
    if (enrichedFiltersConfig) {
      const defaultValues = enrichedFiltersConfig as Array<
        import('../../model/config/ConfigSchema').FilterConfig
      >;

      const filteredDefaults = defaultValues.filter((filter) => !!filter?.defaultValue);

      if (filteredDefaults.length > 0) {
        const defaultFilters = filteredDefaults.reduce<
          Record<string, { value: string; label?: string }>
        >((acc, filter) => {
          const { id, defaultValue, options } = filter;

          const label =
            options && defaultValue && options[defaultValue]?.labelKey
              ? t(options[defaultValue].labelKey)
              : defaultValue;

          return {
            ...acc,
            [id]: { value: defaultValue || '', label },
          };
        }, {});

        setFilters((prev) => ({
          ...defaultFilters,
          ...prev,
        }));
      }
    }
  }, [enrichedFiltersConfig, t]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<string | undefined>();
  const [showMsgRejected, setShowMsgRejected] = useState(false);
  const [showMsgApproved, setShowMsgApproved] = useState(false);
  const [showMsgWaitApproved, setShowMsgWaitApproved] = useState(false);
  const [showMsgSupervised, setShowMsgSupervised] = useState(false);
  const [showMsgRejectedApprovation, setShowMsgRejectedApprovation] = useState(false);
  const [showMsgAcceptApprovation, setMsgAcceptApprovation] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [showMixStatusError, setShowMixStatusError] = useState(false);
  const [showYourselfApprovedError, setShowYourselfApprovedError] = useState(false);
  const [showGenericError, setShowGenericError] = useState(0);

  const resetAllMsgResults = () => {
    setShowMsgRejected(false);
    setShowMsgApproved(false);
    setShowMsgWaitApproved(false);
    setShowMsgSupervised(false);
    setShowMsgRejectedApprovation(false);
    setMsgAcceptApprovation(false);
  };

  useEffect(() => {
    const isMsg =
      showMsgRejected ||
      showMsgApproved ||
      showMsgWaitApproved ||
      showMsgSupervised ||
      showMsgRejectedApprovation ||
      showMsgAcceptApprovation;
    if (isMsg) {
      setTimeout(() => resetAllMsgResults(), 3000);
    }
  }, [
    showMsgRejected,
    showMsgApproved,
    showMsgWaitApproved,
    showMsgSupervised,
    showMsgRejectedApprovation,
    showMsgAcceptApprovation,
  ]);

  useEffect(() => {
    if (showGenericError === 0) {
      return undefined;
    }

    const timer = setTimeout(() => setShowGenericError(0), 5000);
    return () => clearTimeout(timer);
  }, [showGenericError]);

  const callWaitApprovedApi = async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatus,
    motivation: string
  ) => {
    await setWaitApprovedStatusList(initiativeId, gtinCodes, currentStatus, motivation);
  };

  const handleConfirmRestore = async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatus,
    motivation: string
  ) => {
    await callWaitApprovedApi(gtinCodes, currentStatus, motivation);
    setRestoreDialogOpen(false);
  };

  const handleOpenModal = (action: string) => {
    if (isInitiativeClosed) {
      return;
    }

    setShowGenericError(0);
    if (action === PRODUCTS_STATES.WAIT_APPROVED) {
      setRestoreDialogOpen(true);
    } else {
      setModalAction(action);
      setModalOpen(true);
    }
  };

  const handleOpenModalWithStatusCheck = (action: string) => {
    if (isInitiativeClosed) {
      return;
    }

    const { selectedStatuses, someUploaded, length } = getStatusChecks(selected, tableData);

    if (length === 0) {
      return;
    }

    if (isInvitaliaAdmin && someUploaded) {
      setShowYourselfApprovedError(true);
      setTimeout(() => setShowYourselfApprovedError(false), 3000);
      return;
    }

    const uniqueStatuses = Array.from(new Set(selectedStatuses));
    if (uniqueStatuses.length > 1) {
      setShowMixStatusError(true);
      setTimeout(() => setShowMixStatusError(false), 3000);
      return;
    }
    handleOpenModal(action);
  };

  function normalizeLegacyColumn(col: any) {
    if (
      typeof col?.labelKey === 'string' &&
      col.labelKey.startsWith('pages.products.listHeader.')
    ) {
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
  }

  const effectiveColumns = useMemo(() => {
    const baseColumns = tableConfig?.columns ?? [];

    const columns = baseColumns.map(normalizeLegacyColumn);

    const hasActionColumn = columns.some((c: any) => c.type === 'action');

    if (hasActionColumn) {
      return columns;
    }

    return [...columns, { id: '__detail__', labelKey: '', type: 'action' }];
  }, [tableConfig]);

  if (!tableConfig || !isReady) {
    return null;
  }

  if (!hasProductsPermission) {
    return <EmptyListTable message="pages.products.noFileLoaded" />;
  }

  const selectionAllowedStatuses = currentRoleKey
    ? tableConfig?.selection?.rules?.[currentRoleKey]
    : undefined;

  const handleListButtonClick = (row: ProductDTO) => {
    setShowGenericError(0);
    setSelectedProduct(row);
    setDetailOpen(true);
  };

  const clearAppliedFilters = () => {
    setFilters({});
    setRedirectProducer(null);
    setLastRedirectOrganizationId(organizationId || null);
    setRedirectProducerManuallyCleared(true);
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
  };

  const handleApplyDrawerFilters = (
    nextFilters: Record<string, { value: string; label?: string }>
  ) => {
    setFilters(nextFilters);
    setPage(0);
    setSelected([]);

    if (Object.keys(nextFilters).length === 0) {
      clearAppliedFilters();
      return;
    }

    if (!nextFilters.producer) {
      setRedirectProducer(null);
      setLastRedirectOrganizationId(organizationId || null);
      setRedirectProducerManuallyCleared(true);
      setActiveOrganizationId('');
      return;
    }

    setRedirectProducer(null);
    setLastRedirectOrganizationId(null);
    setRedirectProducerManuallyCleared(false);
  };

  const setMsgResultByAction = (
    actionType?: string,
    isInvitaliaUser?: boolean,
    isInvitaliaAdmin?: boolean
  ) => {
    if (actionType === PRODUCTS_STATES.SUPERVISED && isInvitaliaUser) {
      setShowMsgSupervised(true);
      return;
    }
    if (actionType === PRODUCTS_STATES.WAIT_APPROVED && isInvitaliaUser) {
      setShowMsgWaitApproved(true);
      return;
    }
    if (actionType === MIDDLE_STATES.ACCEPT_APPROVATION && isInvitaliaAdmin) {
      setMsgAcceptApprovation(true);
      return;
    }
    if (actionType === MIDDLE_STATES.REJECT_APPROVATION && isInvitaliaAdmin) {
      setShowMsgRejectedApprovation(true);
      return;
    }
    if (actionType === PRODUCTS_STATES.REJECTED && isInvitaliaUser) {
      setShowMsgRejected(true);
    }
  };

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
        filters={effectiveFilters}
        enrichedFiltersConfig={enrichedFiltersConfig}
        selected={selected}
        effectiveColumns={effectiveColumns}
        paginationConfig={paginationConfig}
        tableConfig={tableConfig}
        selectionAllowedStatuses={selectionAllowedStatuses}
        refreshKey={refreshKey}
        onRequestSort={(_event: React.MouseEvent<unknown>, prop: keyof ProductDTO) => {
          const isAsc = orderBy === prop && order === 'asc';
          setOrder(isAsc ? 'desc' : 'asc');
          setOrderBy(prop);
        }}
        handleListButtonClick={handleListButtonClick}
        setSelected={setSelected}
        handleChangePage={(_event: unknown, p: number) => setPage(p)}
        handleChangeRowsPerPage={(e: React.ChangeEvent<HTMLInputElement>) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        handleDeleteFiltersButtonClick={clearAppliedFilters}
        handleToggleFiltersDrawer={(isOpen: boolean) => setFiltersDrawerOpen(isOpen)}
        handleOpenModalWithStatusCheck={handleOpenModalWithStatusCheck}
        isInitiativeClosed={isInitiativeClosed}
      />

      <ProductResultMessages
        showMsgWaitApproved={showMsgWaitApproved}
        showMsgSupervised={showMsgSupervised}
        showMsgApproved={showMsgApproved}
        showMsgAcceptApprovation={showMsgAcceptApprovation}
        showMsgRejected={showMsgRejected}
        showMsgRejectedApprovation={showMsgRejectedApprovation}
        showMixStatusError={showMixStatusError}
        showYourselfApprovedError={showYourselfApprovedError}
        showGenericError={showGenericError}
        bottom={80}
      />

      <ProductModal
        open={modalOpen}
        onClose={(cancelled) => {
          setModalOpen(false);
          if (cancelled) {
            resetAllMsgResults();
          }
        }}
        actionType={modalAction}
        onUpdateTable={() => setRefreshKey((prev) => prev + 1)}
        selectedProducts={selectedProductsList}
        onSuccess={(actionType) => {
          setMsgResultByAction(actionType, isInvitaliaUser, isInvitaliaAdmin);
        }}
      />

      <ProductConfirmDialog
        open={restoreDialogOpen}
        cancelButtonText={t('invitaliaModal.waitApproved.buttonTextCancel')}
        confirmButtonText={`${t('invitaliaModal.waitApproved.buttonTextConfirm')} (${
          selected.length
        })`}
        title={t('invitaliaModal.waitApproved.listTitle')}
        message={t('invitaliaModal.waitApproved.description', { L2: USERS_NAMES.INVITALIA_L2 })}
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={async () => {
          const currentStatus =
            (tableData.find((row) => getProductRowKey(row) === selected[0])
              ?.status as unknown as ProductStatus) || ProductStatus.SUPERVISED;
          try {
            await handleConfirmRestore(selected, currentStatus, EMPTY_DATA);
            setRefreshKey((prev) => prev + 1);
            setRestoreDialogOpen(false);
            resetAllMsgResults();
            if (isInvitaliaUser && currentStatus === ProductStatus.UPLOADED) {
              setShowMsgWaitApproved(true);
            } else {
              setShowMsgApproved(true);
            }
          } catch (error) {
            if (DEBUG_CONSOLE) {
              console.error('Error during restore:', error);
            }
            resetAllMsgResults();
            setRestoreDialogOpen(false);
            setShowGenericError((key) => key + 1);
          }
        }}
      />

      {selectedProduct && (
        <DetailDrawer
          open={detailOpen}
          toggleDrawer={(isOpen: boolean) => {
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
            isInitiativeClosed={isInitiativeClosed}
            onClose={() => {
              setDetailOpen(false);
              setSelectedProduct(null);
            }}
            onUpdateTable={() => {
              setDetailOpen(false);
              setSelectedProduct(null);
              setRefreshKey((prev) => prev + 1);
            }}
            onShowApprovedMsg={() => {
              setShowMsgApproved(true);
              setShowMsgWaitApproved(false);
              setShowMsgRejected(false);
            }}
            onShowRejectedMsg={() => {
              setShowMsgRejected(true);
              setShowMsgApproved(false);
              setShowMsgWaitApproved(false);
            }}
            onShowWaitApprovedMsg={() => {
              setShowMsgWaitApproved(true);
              setShowMsgApproved(false);
              setShowMsgRejected(false);
            }}
            onShowSupervisedMsg={() => {
              setShowMsgSupervised(true);
              setShowMsgApproved(false);
              setShowMsgWaitApproved(false);
              setShowMsgRejected(false);
            }}
            onShowRejectedApprovationMsg={() => {
              setShowMsgRejectedApprovation(true);
              setShowMsgApproved(false);
              setShowMsgWaitApproved(false);
              setShowMsgRejected(false);
            }}
            onShowAcceptApprovationMsg={() => {
              setMsgAcceptApprovation(true);
              setShowMsgApproved(false);
              setShowMsgWaitApproved(false);
              setShowMsgRejected(false);
            }}
            onShowGenericError={() => setShowGenericError((key) => key + 1)}
          />
        </DetailDrawer>
      )}

      <FiltersDrawer
        open={filtersDrawerOpen}
        toggleFiltersDrawer={(isOpen: boolean) => setFiltersDrawerOpen(isOpen)}
        filters={effectiveFilters}
        setFilters={handleApplyDrawerFilters}
        setPage={setPage}
        batchFilterItems={batchFilter}
        filtersConfig={enrichedFiltersConfig}
        templateConfig={templateConfig}
      />
    </>
  );
};

export default ProductDataGrid;
