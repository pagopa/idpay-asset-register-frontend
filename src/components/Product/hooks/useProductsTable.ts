import { useEffect, useState } from 'react';
import { getProducts } from '../../../services/registerService';
import { ProductDTO } from '../../../api/generated/register';
import { Order } from '../helpers';
import { DEBUG_CONSOLE } from '../../../utils/constants';

export type UseProductsTableParams = {
  initiativeId: string;
  organizationId: string;
  orderBy: keyof ProductDTO;
  order: Order;
  page: number;
  rowsPerPage: number;
  category?: string;
  producer?: string;
  productFileId?: string;
  eprelCode?: string;
  status?: string;
  gtinCode?: string;
  productCode?: string;
};

export const useProductsTable = ({
  initiativeId,
  organizationId,
  orderBy,
  order,
  page,
  rowsPerPage,
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
    void fetchProducts();
  }, [
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
