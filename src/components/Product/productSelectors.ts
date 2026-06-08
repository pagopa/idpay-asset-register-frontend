import { ProductDTO, ProductStatus } from '../../api/generated/register';

/* ============================================================================
 * Pure Selectors – No React, No Side Effects
 * ========================================================================== */

export const deriveSelectedProducts = (
  tableData: Array<ProductDTO>,
  selected: Array<string>
): Array<{
  status: ProductStatus;
  productName?: string;
  gtinCode: string;
  category?: string;
}> =>
  tableData
    .filter((row) => {
      const rowKey =
        (row.productCode as string | undefined) ?? (row.gtinCode as string | undefined) ?? '';
      return selected.includes(rowKey);
    })
    .map((row) => ({
      status: row.status as ProductStatus,
      productName: row.productName,
      gtinCode: (row.gtinCode ?? row.productCode) as string,
      category: row.category,
    }));

export const computeEffectiveColumns = (
  baseColumns: Array<any>,
  normalizeFn: (col: any) => any
) => {
  const columns = baseColumns.map(normalizeFn);
  const hasActionColumn = columns.some((c: any) => c.type === 'action');

  if (hasActionColumn) {
    return columns;
  }

  return [...columns, { id: '__detail__', labelKey: '', type: 'action' }];
};

export const buildFiltersValue = (
  filters: Record<string, { value: string; label?: string }>
): Record<string, string> => {
  if (!Object.keys(filters).length) {
    return {};
  }

  return Object.entries(filters).reduce((acc, [key, obj]) => ({ ...acc, [key]: obj?.value }), {});
};
