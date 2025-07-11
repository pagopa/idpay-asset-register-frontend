export interface Data {
  category: string;
  energyClass: string;
  eprelCode: string;
  gtinCode: string;
  batchName: string;
  id: number;
}

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const dA = a[orderBy] as unknown as string;
  const dB = b[orderBy] as unknown as string;
  if (dB.toLowerCase() < dA.toLowerCase()) {
    return -1;
  }
  if (dB.toLowerCase() > dA.toLowerCase()) {
    return 1;
  }
  return 0;
}

export type Order = 'asc' | 'desc';
export type Value = string;

export function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(array: ReadonlyArray<T>, comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  // eslint-disable-next-line functional/immutable-data
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

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
