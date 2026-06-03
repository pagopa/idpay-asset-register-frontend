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
] as any[];

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
    const firstDataRow = rows[1];

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

  it('renders without crashing when columns is undefined (uses default [])', () => {
    render(
      <ProductsTable
        tableData={baseData}
        columns={undefined as any}
        selection={{ enabled: true }}
        order="asc"
        orderBy="category"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={jest.fn()}
      />
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('setSelected updater adds uniqueKey when checked and key is not in prev', () => {
    const setSelected = jest.fn().mockImplementation((fn: (prev: string[]) => string[]) => {
      const result = fn([]);
      expect(result).toContain('GTIN-1');
    });

    renderTable({ setSelected });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(setSelected).toHaveBeenCalled();
  });

  it('setSelected updater returns prev unchanged when key is already selected', () => {
    const setSelected = jest.fn().mockImplementation((fn: (prev: string[]) => string[]) => {
      const result = fn(['GTIN-1']);
      expect(result).toEqual(['GTIN-1']);
    });

    renderTable({ setSelected });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(setSelected).toHaveBeenCalled();
  });

  it('setSelected updater removes uniqueKey when checkbox is unchecked', () => {
    const setSelected = jest.fn().mockImplementation((fn: (prev: string[]) => string[]) => {
      const result = fn(['GTIN-1']);
      expect(result).not.toContain('GTIN-1');
    });

    renderTable({ selected: ['GTIN-1'], setSelected });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(setSelected).toHaveBeenCalled();
  });

  it('renders numeric cell value via the value ?? "-" fallback', () => {
    const colsWithNumber = [
      ...columns,
      { id: 'score', labelKey: 'score' },
    ];
    const dataWithNumber = [{ ...baseData[0], score: 99 }] as any[];

    render(
      <ProductsTable
        tableData={dataWithNumber}
        columns={colsWithNumber}
        selection={{ enabled: true }}
        order="asc"
        orderBy="category"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={jest.fn()}
      />
    );

    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('renders "-" when cell value is undefined', () => {
    const colsWithMissing = [
      ...columns,
      { id: 'missingField', labelKey: 'missingField' },
    ];

    render(
      <ProductsTable
        tableData={baseData}
        columns={colsWithMissing}
        selection={{ enabled: true }}
        order="asc"
        orderBy="category"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={jest.fn()}
      />
    );

    const cells = screen.getAllByRole('cell');
    const dashCells = cells.filter((c) => c.textContent === '-');
    expect(dashCells.length).toBeGreaterThan(0);
  });
});
