import { ProductDTO } from '../../api/generated/register/ProductDTO';

export interface Data {
  category: string;
  energyClass: string;
  eprelCode: string;
  gtinCode: string;
  codice_produttore: string;
  batchName: string;
  id: number;
}


export type Order = 'asc' | 'desc';
export type Value = string;



export interface GetProductListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface EnhancedTableProps {
  order: Order;
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ProductDTO) => void;
}

export interface HeadCell {
  disablePadding: boolean;
  id: keyof ProductDTO;
  label: string;
  numeric: boolean;
  textAlign?: any;
}

export type BatchFilterItems = { productFileId: string; batchName: string } | undefined;

export interface BatchFilterList {
  _tag: string;
  left: Array<{ context: Array<object>; message: string; value: any }>;
}

export function extractBatchFilterItems(obj: any): Array<BatchFilterItems> | [] {
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }
  if (Object.prototype.hasOwnProperty.call(obj, 'value') && Array.isArray(obj.value)) {
    return obj.value;
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = extractBatchFilterItems(obj[key]);
      if (result.length > 0) {
        return result;
      }
    }
  }
  return [];
}
