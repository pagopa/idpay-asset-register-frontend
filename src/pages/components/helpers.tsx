import { ProductDTO } from '../../api/generated/register/ProductDTO';

export interface ProductsTableProps {
  tableData: Array<ProductDTO>;
  emptyData?: string;
  order: 'asc' | 'desc';
  orderBy: keyof ProductDTO;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ProductDTO) => void;
  handleListButtonClick: (row: ProductDTO) => void;
  selected: Array<string>;
  setSelected: React.Dispatch<React.SetStateAction<Array<string>>>;
}

export const rowTableSx = {
  backgroundColor: '#FFFFFF',
  transition: 'background-color 0.2s',
  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
};

export const cellBaseSx = {
  borderBottom: '1px solid #e0e0e0',
  boxSizing: 'border-box',
  whiteSpace: 'nowrap' as const,
};

export const cellLeftSx = {
  ...cellBaseSx,
  textAlign: 'left' as const,
};

export const cellCenterSx = {
  ...cellBaseSx,
  textAlign: 'center' as const,
};

export const cellRightSx = {
  ...cellBaseSx,
  textAlign: 'right' as const,
};

export const checkboxCellSx = {
  ...cellBaseSx,
  textAlign: 'left' as const,
  width: '60px',
  padding: '16px',
};

export const actionsCellSx = {
  ...cellBaseSx,
  textAlign: 'center' as const,
  width: '60px',
  padding: '16px',
};
