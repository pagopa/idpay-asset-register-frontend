export interface Data {
  category: string;
  energyClass: string;
  eprelCode: string;
  gtinCode: string;
  batchName: string;
  id: number;
}


export type Order = 'asc' | 'desc';
export type Value = string;


export interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

export interface EnhancedTableProps {
  order: Order;
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
}

export interface DataProp {
  category?: string;
  energyClass?: string;
  eprelCode?: string;
  gtinCode?: string;
  batchName?: string;
  codice_prodotto?: string;
  marca?: string;
  modello?: string;
  origine?: string;
}

export interface ProductsDrawerProps {
  open: boolean;
  toggleDrawer: (isOpen: boolean) => void;
  data: DataProp;
}
