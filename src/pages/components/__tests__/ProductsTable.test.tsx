import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductsTable from '../ProductsTable';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (k: string) => k,
    initiativeName: 'test',
  }),
}));

// ✅ Mock useInitiativeConfig to avoid useGetInitiativesQuery dependency
jest.mock('../../../hooks/useInitiativeConfig', () => ({
  __esModule: true,
  useInitiativeConfig: () => ({
    config: {
      ui: {
        tables: {
          products: {
            style: {},
          },
        },
      },
    },
    loading: false,
  }),
}));

jest.mock('../../../components/Product/ProductStatusChip', () => ({
  __esModule: true,
  default: ({ status }: { status: string }) => <span data-testid="status-chip">{status}</span>,
}));

const columns = [
  { id: 'checkbox', labelKey: 'checkbox', type: 'checkbox' as const },
  { id: 'category', labelKey: 'category', sortable: true },
  { id: 'gtinCode', labelKey: 'gtin' },
  { id: 'status', labelKey: 'status' },
  { id: 'action', labelKey: 'action', type: 'action' as const },
];

const baseData = [
  {
    category: 'Lavatrice',
    gtinCode: 'GTIN-1',
    status: 'SUPERVISED',
  },
  {
    category: 'Forno',
    gtinCode: 'GTIN-2',
    status: 'REJECTED',
  },
];

const renderTable = (overrideProps: any = {}) => {
  const setSelected = jest.fn();
  const handleListButtonClick = jest.fn();

  render(
    <ProductsTable
      tableData={baseData}
      columns={columns}
      selection={{ enabled: true }}
      order="asc"
      orderBy="category"
      onRequestSort={jest.fn()}
      selected={[]}
      setSelected={setSelected}
      handleListButtonClick={handleListButtonClick}
      emptyData="-"
      {...overrideProps}
    />
  );

  return { setSelected, handleListButtonClick };
};

describe('ProductsTable (rewritten)', () => {
  it('renders headers, rows and status chip correctly', () => {
    renderTable();

    expect(screen.getByText('category')).toBeInTheDocument();
    expect(screen.getByText('Lavatrice')).toBeInTheDocument();
    expect(screen.getByText('Forno')).toBeInTheDocument();

    const chips = screen.getAllByTestId('status-chip');
    expect(chips[0]).toHaveTextContent('SUPERVISED');
    expect(chips[1]).toHaveTextContent('REJECTED');
  });

  it('calls onRequestSort when clicking sortable header', () => {
    const onRequestSort = jest.fn();

    renderTable({ onRequestSort });

    fireEvent.click(screen.getByRole('button', { name: 'category' }));
    expect(onRequestSort).toHaveBeenCalled();
  });

  it('toggles checkbox selection', () => {
    const { setSelected } = renderTable();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(setSelected).toHaveBeenCalled();
  });

  it('calls handleListButtonClick when action icon is clicked', () => {
    const { handleListButtonClick } = renderTable();

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // skip header

    const actionCell = within(firstDataRow).getAllByRole('cell').pop();
    const actionButton = within(actionCell as HTMLElement).getByRole('button');

    fireEvent.click(actionButton);

    expect(handleListButtonClick).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Lavatrice' })
    );
  });

  it('renders empty row when tableData is empty', () => {
    render(
      <ProductsTable
        tableData={[]}
        columns={columns}
        selection={{ enabled: true }}
        order="asc"
        orderBy="category"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={jest.fn()}
        emptyData="NO_DATA"
      />
    );

    expect(screen.getByText('NO_DATA')).toBeInTheDocument();
  });
});
