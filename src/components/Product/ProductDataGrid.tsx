import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import { fetchUserFromLocalStorage } from '../../helpers';
import { USERS_TYPES } from '../../utils/constants';
import {
  institutionSelector,
  setInstitutionList,
  setInstitution,
} from '../../redux/slices/invitaliaSlice';
import { ProductDTO } from '../../api/generated/register';

import DetailDrawer from '../DetailDrawer/DetailDrawer';
import FiltersDrawer from '../FiltersDrawer/FiltersDrawer';
import { SelectProps } from '../FiltersDrawer/filtersRender';
import EmptyListTable from '../../pages/components/EmptyListTable';
import { useProductsTable } from './hooks/useProductsTable';
import { useProductDataGridInit } from './hooks/useProductDataGridInit';
import { validateBulkActionPreconditions } from './ProductDataGrid.helpers';

import ProductDataGridView from './ProductDataGridView';
import ProductResultMessages from './ProductResultMessages';
import ProductDetail from './ProductDetail';

type Props = {
  organizationId: string;
};

const ProductDataGrid: React.FC<Props> = ({ organizationId }) => {
  const { t } = useScopedTranslation();
  const dispatch = useDispatch();
  const initiativeId = useCurrentInitiativeId();
  const { config } = useInitiativeConfig();
  const [filters, setFilters] = useState<Record<string, { value: string; label?: string }>>({});
  const filtersValue: typeof filters & { producer?: string } = Object.keys(filters).length
    ? Object.entries(filters)?.reduce((acc, [key, obj]) => ({ ...acc, [key]: obj?.value }), {})
    : {};

  const tableConfig = (config as any)?.ui?.tables?.products ?? (config as any)?.tables?.products;
  const paginationConfig = tableConfig?.pagination;
  const filtersConfig =
    (config as any)?.ui?.tables?.products?.filters ?? (config as any)?.tables?.products?.filters;
  const templateConfig = config?.templates;

  const user = useMemo(() => fetchUserFromLocalStorage(), []);

  const subRoleConfig = config?.subRoles?.[user?.org_role as string];
  const hasProductsPermission = subRoleConfig?.permissions?.tables?.includes('products');
  const isInvitaliaUser = user?.org_role === USERS_TYPES.INVITALIA_L1;
  const isInvitaliaAdmin = user?.org_role === USERS_TYPES.INVITALIA_L2;

  const institution = useSelector(institutionSelector);

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
  const refreshKey = 0;

  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);

  const targetId = isInvitaliaUser
    ? filtersValue?.producer || institution?.institutionId || ''
    : organizationId || user?.org_id || '';

  const { tableData, loading, itemsQty, paginatorFrom, paginatorTo } = useProductsTable({
    initiativeId,
    organizationId: targetId,
    orderBy,
    order,
    page,
    rowsPerPage,
    ...filtersValue,
  });

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

  const buildCategoryOptions = () => {
    const configCategories = (config as any)?.categories;
    const templateCategories = (config as any)?.templates?.categories ?? {};

    if (!configCategories || Object.keys(configCategories).length === 0) {
      return Object.fromEntries(
        Object.keys(templateCategories).map((key: string) => {
          const upperKey = key.toUpperCase();
          return [
            upperKey,
            {
              label: t(`categories.${key}.label`),
            },
          ];
        })
      );
    }

    return Object.fromEntries(
      Object.entries(configCategories).map(([key, value]: any) => [
        key,
        {
          label: value?.labelKey ? t(value.labelKey, { returnObjects: false }) : key,
        },
      ])
    );
  };

  const enrichedFiltersConfig = useMemo(() => {
    if (!filtersConfig) {
      return filtersConfig;
    }

    return filtersConfig.map((filter: any) => {
      if (filter.useInitiativeCategories || filter.id === 'category') {
        return { ...filter, options: buildCategoryOptions() };
      }

      if (filter.id === 'status') {
        return {
          ...filter,
          options: {
            UPLOADED: {
              labelKey: 'chip.productStatusLabel.uploaded',
              color: 'default',
            },
            WAIT_APPROVED: {
              labelKey: 'chip.productStatusLabel.waitApproved',
              color: 'warning',
            },
            APPROVED: {
              labelKey: 'chip.productStatusLabel.approved',
              color: 'success',
            },
            SUPERVISED: {
              labelKey: 'chip.productStatusLabel.supervised',
              color: 'info',
            },
            REJECTED: {
              labelKey: 'chip.productStatusLabel.rejected',
              color: 'error',
            },
          },
        };
      }

      if (filter.id === 'productFileId') {
        return { ...filter, options: batchFilter };
      }

      return filter;
    });
  }, [filtersConfig, config, batchFilter]);

  useEffect(() => {
    setSelected([]);
  }, [tableData]);

  useEffect(() => {
    if (isInvitaliaAdmin && enrichedFiltersConfig) {
      const defaultValues = enrichedFiltersConfig.filter((filter: any) => filter?.defaultValue);
      if (defaultValues) {
        const defaultFilters = defaultValues.reduce(
          (
            acc: Record<string, { value: string; label?: string }>,
            { id, defaultValue, options }: any
          ) => {
            const label = options?.[defaultValue]?.labelKey
              ? t(options[defaultValue].labelKey)
              : defaultValue;
            return { ...acc, [id]: { value: defaultValue, label } };
          },
          {}
        );
        setFilters(defaultFilters);
      }
    }
  }, [isInvitaliaAdmin, enrichedFiltersConfig]);

  const handleOpenModalWithStatusCheck = () => {
    const result = validateBulkActionPreconditions({
      selected,
      tableData,
      isInvitaliaAdmin,
    });

    if (!result.valid) {
      return;
    }
  };

  const effectiveColumns = useMemo(() => {
    const baseCols = tableConfig?.columns ?? [];
    const hasAction = baseCols.some((c: any) => c.type === 'action');

    return hasAction ? baseCols : [...baseCols, { id: '__detail__', labelKey: '', type: 'action' }];
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
        showMsgWaitApproved={false}
        showMsgSupervised={false}
        showMsgApproved={false}
        showMsgAcceptApprovation={false}
        showMsgRejected={false}
        showMsgRejectedApprovation={false}
        showMixStatusError={false}
        showYourselfApprovedError={false}
        t={t}
        getMsgResultByActionType={() => ''}
        bottom={80}
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
            }}
            onShowRejectedMsg={() => {}}
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
