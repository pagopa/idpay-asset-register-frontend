import { useEffect, useState } from 'react';
import { getProducts } from '../../../services/registerService';
import { ProductDTO } from '../../../api/generated/register';
import { Order } from '../helpers';
import { DEBUG_CONSOLE } from '../../../utils/constants';

export type UseProductsTableParams = {
  refreshKey: number;
  initiativeId: string;
  organizationId: string;
  orderBy: keyof ProductDTO;
  order: Order;
  page: number;
  rowsPerPage: number;
  organizationSource?: string;
  category?: string;
  producer?: string;
  productFileId?: string;
  eprelCode?: string;
  status?: string;
  gtinCode?: string;
  productCode?: string;
};

export const useProductsTable = ({
  refreshKey,
  initiativeId,
  organizationId,
  orderBy,
  order,
  page,
  rowsPerPage,
  organizationSource,
  category,
  producer,
  productFileId,
  productCode,
  eprelCode,
  status,
  gtinCode,
}: UseProductsTableParams) => {
  const [tableData, setTableData] = useState<Array<ProductDTO>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsQty, setItemsQty] = useState<number | undefined>(0);
  const [apiErrorOccurred, setApiErrorOccurred] = useState<boolean>(false);
  const [paginatorFrom, setPaginatorFrom] = useState<number | undefined>(1);
  const [paginatorTo, setPaginatorTo] = useState<number | undefined>(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await getProducts(
        initiativeId,
        organizationId,
        page,
        rowsPerPage,
        `${orderBy},${order}`,
        category?.toUpperCase(),
        status || undefined,
        eprelCode,
        gtinCode,
        productCode,
        productFileId
      );

      const { content, pageNo, totalElements } = res.data;

      setTableData(content ? Array.from(content) : []);
      setItemsQty(totalElements);

      if (pageNo !== undefined && totalElements) {
        setPaginatorFrom(pageNo * rowsPerPage + 1);
        setPaginatorTo(
          rowsPerPage * (Number(pageNo) + 1) < totalElements
            ? rowsPerPage * (Number(pageNo) + 1)
            : totalElements
        );
      }

      setApiErrorOccurred(false);
    } catch (error) {
      if (DEBUG_CONSOLE) {
        console.error('Error fetching products:', error);
      }
      setApiErrorOccurred(true);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationSource === 'filter' && !organizationId && !productFileId) {
      setLoading(false);
      setTableData([]);
      return;
    }

    void fetchProducts();
  }, [
    refreshKey,
    initiativeId,
    organizationId,
    page,
    rowsPerPage,
    orderBy,
    order,
    category,
    producer,
    productFileId,
    productCode,
    eprelCode,
    status,
    gtinCode,
    organizationSource,
  ]);

  return {
    tableData,
    loading,
    itemsQty,
    apiErrorOccurred,
    paginatorFrom,
    paginatorTo,
    fetchProducts,
  };
};
