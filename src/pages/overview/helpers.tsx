export interface Data {
  initiativeId: string;
  initiativeName: string;
  organizationName: string;
  spendingPeriod: string;
  serviceId: string;
  status: string;
  id: number;
}



export type Order = 'asc' | 'desc';



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
