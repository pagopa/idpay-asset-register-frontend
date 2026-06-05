import React, { useEffect, useMemo, useState } from 'react';
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
import { ProductDTO, ProductStatus } from '../../api/generated/register';
import { DEBUG_CONSOLE, EMPTY_DATA, USERS_NAMES } from '../../utils/constants';
import { setWaitApprovedStatusList } from '../../services/registerService';

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
};

import { useResolvedProductTableConfig } from './hooks/useResolvedProductTableConfig';
import { useEnrichedProductFilters } from './hooks/useEnrichedProductFilters';
import { useTargetOrganization } from './hooks/useTargetOrganization';
import ProductModal from './ProductModal';
import ProductConfirmDialog from './ProductConfirmDialog';
import { getStatusChecks } from './ProductDataGrid.helpers';

const ProductDataGrid: React.FC<Props> = ({ organizationId }) => {
  const { t } = useScopedTranslation();
  const dispatch = useDispatch();
  const initiativeId = useCurrentInitiativeId();
  const { config } = useInitiativeConfig();
  const typedConfig = config as import('../../model/config/ConfigSchema').InitiativeConfig;
  const { tableConfig, paginationConfig, filtersConfig, templateConfig } =
    useResolvedProductTableConfig(typedConfig);

  const [filters, setFilters] = useState<Record<string, { value: string; label?: string }>>({});
  const filtersValue: typeof filters & { producer?: string } = Object.keys(filters).length
    ? Object.entries(filters)?.reduce((acc, [key, obj]) => ({ ...acc, [key]: obj?.value }), {})
    : {};

  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const subRoleConfig = config?.subRoles?.[user?.org_role as string];
  const hasProductsPermission = subRoleConfig?.permissions?.tables?.includes('products');

  const currentRoleKey = user?.org_role as string | undefined;

  const selectionRules = tableConfig?.selection?.rules ?? {};
  const currentRoleRules = currentRoleKey ? selectionRules[currentRoleKey] : undefined;

  const isInvitaliaUser = Array.isArray(currentRoleRules) && currentRoleRules.length > 0;
  const isInvitaliaAdmin =
    Array.isArray(currentRoleRules) && currentRoleRules.includes('WAIT_APPROVED');

  const institution = useSelector(institutionSelector);

  const { targetId } = useTargetOrganization({
    organizationId,
    user,
    filtersValue,
    institutionId: institution?.institutionId,
    tableConfig,
  });

  useEffect(() => {
    if (organizationId && tableConfig?.organizationSource === 'filter') {
      setFilters((prev) => ({
        ...prev,
        producer: {
          value: organizationId,
          label: institution?.description || organizationId,
        },
      }));
    }
  }, [organizationId, institution?.description, tableConfig]);

  const { batchFilterItems } = useProductDataGridInit({
    initiativeId,
    organizationId,
    isInvitaliaUser,
    isInvitaliaAdmin,
    institutionId: institution?.institutionId,
    dispatch,
    setInstitutionList,
  });

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof ProductDTO>('category');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(paginationConfig?.defaultRowsPerPage ?? 10);
  const [selected, setSelected] = useState<Array<string>>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);

  const { tableData, loading, itemsQty, paginatorFrom, paginatorTo } = useProductsTable({
    refreshKey,
    initiativeId,
    organizationId: targetId,
    orderBy,
    order,
    page,
    rowsPerPage,
    ...filtersValue,
  });

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
        const batchName = batch?.batchName?.replace('.csv', '') || '';
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
    typedConfig,
    filtersConfig,
    batchFilter,
    t,
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
    // Reset state only when initiative changes
    setFilters({});
    setPage(0);
    setSelected([]);
  }, [initiativeId]);

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

        setFilters(defaultFilters);
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
  const [showGenericError, setShowGenericError] = useState(false);

  const handleOpenModal = (action: string) => {
    if (action === PRODUCTS_STATES.WAIT_APPROVED) {
      setRestoreDialogOpen(true);
    } else {
      setModalAction(action);
      setModalOpen(true);
    }
    return Promise.resolve();
  };

  const handleOpenModalWithStatusCheck = (action: string) => {
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

    void handleOpenModal(action);
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

  if (!tableConfig) {
    return null;
  }

  if (!hasProductsPermission) {
    return <EmptyListTable message="pages.products.noFileLoaded" />;
  }

  const handleListButtonClick = (row: ProductDTO) => {
    setSelectedProduct(row);
    setDetailOpen(true);
  };

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
    }
  };

  const handleConfirmRestore = async (
    gtinCodes: Array<string>,
    currentStatus: ProductStatus,
    motivation: string
  ) => {
    await callWaitApprovedApi(gtinCodes, currentStatus, motivation);
    setRestoreDialogOpen(false);
    setShowMsgApproved(true);
  };

  const resetAllMsgResults = () => {
    setShowMsgRejected(false);
    setShowMsgApproved(false);
    setShowMsgWaitApproved(false);
    setShowMsgSupervised(false);
    setShowMsgRejectedApprovation(false);
    setMsgAcceptApprovation(false);
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
    if (actionType === PRODUCTS_STATES.WAIT_APPROVED && isInvitaliaAdmin) {
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
        handleListButtonClick={handleListButtonClick}
        setSelected={setSelected}
        handleChangePage={(_event: unknown, p: number) => setPage(p)}
        handleChangeRowsPerPage={(e: React.ChangeEvent<HTMLInputElement>) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        handleDeleteFiltersButtonClick={() => {
          setFilters({});
          dispatch(
            setInstitution({
              institutionId: '',
              createdAt: '',
              updatedAt: '',
              description: '',
            })
          );
        }}
        handleToggleFiltersDrawer={(isOpen: boolean) => setFiltersDrawerOpen(isOpen)}
        handleOpenModalWithStatusCheck={handleOpenModalWithStatusCheck}
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
        getMsgResultByActionType={(t, actionType) => {
          switch (actionType) {
            case PRODUCTS_STATES.WAIT_APPROVED:
              return t('invitaliaModal.waitApproved.msgResultWaitApproved');
            case PRODUCTS_STATES.SUPERVISED:
              return t('invitaliaModal.supervised.msgResultSupervised');
            case PRODUCTS_STATES.REJECTED:
              return t('invitaliaModal.rejected.msgResultRejected');
            case MIDDLE_STATES.REJECT_APPROVATION:
              return t('invitaliaModal.rejectApprovation.msgResultRejectedApprovation');
            case MIDDLE_STATES.ACCEPT_APPROVATION:
            case PRODUCTS_STATES.APPROVED:
              return t('invitaliaModal.acceptApprovation.msgResultAcceptApprovation');
            default:
              return '';
          }
        }}
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
        onUpdateTable={() => setRefreshKey(prev => prev + 1)}
        selectedProducts={
          tableData
            .filter((row) => row.gtinCode && selected.includes(row.gtinCode))
            .map((row) => ({
              status: row.status as ProductStatus,
              productName: row.productName,
              gtinCode: row.gtinCode,
              category: row.category,
            })) as Array<{
              status: ProductStatus;
              productName?: string;
              gtinCode: string;
              category?: string;
            }>
        }
        onSuccess={(actionType) => {
          setMsgResultByAction(actionType, isInvitaliaUser, isInvitaliaAdmin);
        }}
      />

      <ProductConfirmDialog
        open={restoreDialogOpen}
        cancelButtonText={t('invitaliaModal.waitApproved.buttonTextCancel')}
        confirmButtonText={`${t('invitaliaModal.waitApproved.buttonTextConfirm')} (${selected.length
          })`}
        title={t('invitaliaModal.waitApproved.listTitle')}
        message={t('invitaliaModal.waitApproved.description', { L2: USERS_NAMES.INVITALIA_L2 })}
        onCancel={() => setRestoreDialogOpen(false)}
        onConfirm={async () => {
          const currentStatus =
            (tableData.find((row) => row.gtinCode === selected[0])
              ?.status as unknown as ProductStatus) || ProductStatus.SUPERVISED;
          try {
            await handleConfirmRestore(selected, currentStatus, EMPTY_DATA);
            setRefreshKey(prev => prev + 1);
            setRestoreDialogOpen(false);
          } catch (error) {
            if (DEBUG_CONSOLE) {
              console.error('Error during restore:', error);
            }
          }
        }}
        onSuccess={() => {
          resetAllMsgResults();
          const currentStatus =
            (tableData.find((row) => row.gtinCode === selected[0])
              ?.status as unknown as ProductStatus) || ProductStatus.SUPERVISED;
          if (isInvitaliaUser && currentStatus === ProductStatus.UPLOADED) {
            setShowMsgWaitApproved(true);
          } else {
            setShowMsgApproved(true);
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
            onClose={() => {
              setDetailOpen(false);
              setSelectedProduct(null);
            }}
            onUpdateTable={() => {
              setDetailOpen(false);
              setSelectedProduct(null);
              setRefreshKey(prev => prev + 1);
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
            onShowGenericError={() => setShowGenericError(true)}
          />
        </DetailDrawer>
      )}

      <FiltersDrawer
        open={filtersDrawerOpen}
        toggleFiltersDrawer={(isOpen: boolean) => setFiltersDrawerOpen(isOpen)}
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
