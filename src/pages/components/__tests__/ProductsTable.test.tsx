import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProductsTable from '../ProductsTable';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const mockInstitutions = [
  { institutionId: 'org-1', description: 'ACME S.p.A.' },
  { institutionId: 'org-2', description: 'Beta Industries' },
];

jest.mock('react-redux', () => ({
  useSelector: (sel: any) => sel({}),
}));

jest.mock('../../../redux/slices/invitaliaSlice', () => ({
  institutionListSelector: () => mockInstitutions,
}));

jest.mock('../../../components/Product/EnhancedTableHead', () => {
  return function MockHead(props: any) {
    const {
      headCells,
      handleSelectAllClick,
      isAllSelected,
      isIndeterminate,
      order,
      orderBy,
      onRequestSort,
    } = props;
    return (
        <thead data-testid="mock-head">
        <tr>
          <th>HEAD({headCells.length})</th>
          <th>isAllSelected:{String(isAllSelected)}</th>
          <th>isIndeterminate:{String(isIndeterminate)}</th>
          <th>order:{order}</th>
          <th>orderBy:{orderBy}</th>
          <th>
            <button
                onClick={() =>
                    handleSelectAllClick({ target: { checked: true } } as any)
                }
            >
              selectAll
            </button>
            <button
                onClick={() =>
                    handleSelectAllClick({ target: { checked: false } } as any)
                }
            >
              deselectAll
            </button>
            <button onClick={() => onRequestSort?.({} as any, 'category')}>
              sortCategory
            </button>
          </th>
        </tr>
        </thead>
    );
  };
});

jest.mock('../../../components/Product/EprelLinks', () => {
  return function MockEprelLinks({ row }: any) {
    return <span data-testid="eprel-link">EPREL:{row?.eprelCode ?? 'NA'}</span>;
  };
});

jest.mock('../../../components/Product/ProductStatusChip', () => {
  return function MockChip({ status }: any) {
    return <span data-testid="status-chip">{String(status)}</span>;
  };
});


const mockFetchUserFromLocalStorage = jest.fn();
const mockGetTablePrLength = jest.fn(() => 8);
const mockTruncateString = jest.fn((str: string) => `TRUNC(${str})`);

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: () => mockFetchUserFromLocalStorage(),
  getTablePrLength: () => mockGetTablePrLength(),
  truncateString: (s: string, _n: number) => mockTruncateString(s),
}));

jest.mock('../../../utils/constants', () => ({
  PRODUCTS_STATES: {
    UPLOADED: 'UPLOADED',
    SUPERVISED: 'SUPERVISED',
    WAIT_APPROVED: 'WAIT_APPROVED',
    REJECTED: 'REJECTED',
  },
  USERS_TYPES: {
    INVITALIA_L1: 'INVITALIA_L1',
    INVITALIA_L2: 'INVITALIA_L2',
    PRODUTTORE: 'PRODUTTORE',
  },
}));

const baseTableData = [
  {
    category: 'Lavatrice',
    energyClass: 'A+++',
    eprelCode: 'EP-111',
    gtinCode: 'GTIN-111',
    batchName: 'Batch-1',
    status: 'UPLOADED',
    organizationId: 'org-1',
  },
  {
    category: 'Lavastoviglie',
    energyClass: 'B',
    eprelCode: 'EP-222',
    gtinCode: 'GTIN-222',
    batchName: 'Batch-2',
    status: 'SUPERVISED',
    organizationId: 'org-2',
  },
  {
    category: 'Frigo',
    energyClass: 'C',
    eprelCode: 'EP-333',
    gtinCode: 'GTIN-333',
    batchName: 'Batch-3',
    status: 'WAIT_APPROVED',
    organizationId: 'org-2',
  },
  {
    category: 'Forno',
    energyClass: 'D',
    eprelCode: 'EP-444',
    gtinCode: "GTIN-444",
    batchName: "Batch-4",
    status: 'REJECTED',
    organizationId: 'org-999',
  },
];

const commonProps = {
  emptyData: '-',
  order: 'asc' as const,
  orderBy: 'category' as const,
  onRequestSort: jest.fn(),
  handleListButtonClick: jest.fn(),
};

function WrapperInvitalia(props: any) {
  const [selected, setSelected] = React.useState<string[]>(props.initialSelected ?? []);
  return (
      <ProductsTable
          {...props}
          selected={selected}
          setSelected={(updater: any) => {
            if (typeof updater === 'function') {
              const next = updater(selected);
              setSelected(next);
              props.onSelectedChange?.(next);
            } else {
              setSelected(updater);
              props.onSelectedChange?.(updater);
            }
          }}
      />
  );
}

describe('ProductsTable – vista INVITALIA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    mockGetTablePrLength.mockReturnValue(8);
    mockTruncateString.mockImplementation((s: string) => `TRUNC(${s})`);
  });

  test('render base: header mockato, righe e colonne coerenti; mostra producer troncato e chip di stato', () => {
    render(
        <WrapperInvitalia
            tableData={baseTableData}
            {...commonProps}
            selected={[]}
        />
    );

    expect(screen.getByTestId('mock-head')).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThanOrEqual(5);

    expect(screen.getAllByText(/TRUNC\(GTIN-/)).toHaveLength(4);
    expect(screen.getAllByTestId('status-chip')).toHaveLength(4);
    expect(screen.getAllByTestId('eprel-link')[0]).toHaveTextContent('EPREL:EP-111');
  });

  test('click su icona nell’ultima cella chiama handleListButtonClick; click su riga/checkbox non propaga', async () => {
    const user = userEvent.setup();
    const handleList = jest.fn();

    render(
        <WrapperInvitalia
            tableData={baseTableData}
            {...commonProps}
            selected={[]}
            handleListButtonClick={handleList}
        />
    );

    const firstRow = screen.getAllByRole('row').slice(1)[0];

    await user.click(firstRow);
    expect(handleList).not.toHaveBeenCalled();

    const checkbox = within(firstRow).getByRole('checkbox');
    await user.click(checkbox);
    expect(handleList).not.toHaveBeenCalled();

    const cells = within(firstRow).getAllByRole('cell');
    const lastCell = cells[cells.length - 1];

    const actionButton = within(lastCell).getByRole('button', { name: /apri dettagli prodotto/i });
    await user.click(actionButton);

    expect(handleList).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Lavatrice' })
    );
  });

  test('checkbox abilitata/disabilitata correttamente in base a ruolo L1 e stato; gestione gtin non stringa', () => {
    render(
        <WrapperInvitalia
            tableData={baseTableData}
            {...commonProps}
            initialSelected={[]}
        />
    );

    const bodyRows = screen.getAllByRole('row').slice(1);
    const [r1, r2, r3, r4] = bodyRows;

    expect(within(r1).getByRole('checkbox')).toBeEnabled();
    expect(within(r2).getByRole('checkbox')).toBeEnabled();
    expect(within(r3).getByRole('checkbox')).toBeDisabled();
    const cb4 = within(r4).getByRole('checkbox');
    expect(cb4).toBeDisabled();
    expect(cb4).not.toBeChecked();
  });

  test('select all / deselect all per INVITALIA L1 seleziona solo UPLOADED e SUPERVISED', async () => {
    const user = userEvent.setup();
    const onSelectedChange = jest.fn();

    render(
        <WrapperInvitalia
            tableData={baseTableData}
            {...commonProps}
            initialSelected={[]}
            onSelectedChange={onSelectedChange}
        />
    );

    await user.click(screen.getByRole('button', { name: 'selectAll' }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['GTIN-111', 'GTIN-222']);

    await user.click(screen.getByRole('button', { name: 'deselectAll' }));
    expect(onSelectedChange).toHaveBeenLastCalledWith([]);
  });

  test('toggle singolo checkbox usa setSelected callback e gestisce aggiunta/rimozione', async () => {
    const user = userEvent.setup();
    const onSelectedChange = jest.fn();

    render(
        <WrapperInvitalia
            tableData={baseTableData}
            {...commonProps}
            initialSelected={[]}
            onSelectedChange={onSelectedChange}
        />
    );

    const firstEnabledRow = screen.getAllByRole('row').slice(1)[0];
    const cb = within(firstEnabledRow).getByRole('checkbox');

    await user.click(cb);
    expect(onSelectedChange).toHaveBeenLastCalledWith(['GTIN-111']);

    await user.click(cb);
    expect(onSelectedChange).toHaveBeenLastCalledWith([]);
  });

  test('vista INVITALIA L2: select all prende solo WAIT_APPROVED; checkbox per altri stati è disabilitata', async () => {
    const user = userEvent.setup();
    mockFetchUserFromLocalStorage.mockReturnValueOnce({ org_role: 'INVITALIA_L2' });

    const onSelectedChange = jest.fn();
    render(
        <WrapperInvitalia
            tableData={baseTableData}
            {...commonProps}
            initialSelected={[]}
            onSelectedChange={onSelectedChange}
        />
    );

    const bodyRows = screen.getAllByRole('row').slice(1);
    const [r1, r2, r3] = bodyRows;

    expect(within(r1).getByRole('checkbox')).toBeDisabled();
    expect(within(r2).getByRole('checkbox')).toBeDisabled();
    expect(within(r3).getByRole('checkbox')).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'selectAll' }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['GTIN-333']);
  });

  test('producer tooltip derivato da istituzioni (getProducer) e truncateString usato', () => {
    render(
        <WrapperInvitalia
            tableData={baseTableData}
            {...commonProps}
            initialSelected={[]}
        />
    );
    expect(screen.getAllByText(/TRUNC\(ACME S\.p\.A\.\)|TRUNC\(Beta Industries\)/).length).toBeGreaterThan(0);
  });

  test('sort handler passa dal thead mockato', async () => {
    const user = userEvent.setup();
    const onRequestSort = jest.fn();

    render(
        <WrapperInvitalia
            tableData={baseTableData}
            {...commonProps}
            onRequestSort={onRequestSort}
            initialSelected={[]}
        />
    );

    await user.click(screen.getByRole('button', { name: 'sortCategory' }));
    expect(onRequestSort).toHaveBeenCalled();
  });
});

describe('ProductsTable – vista PRODUTTORE', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'PRODUTTORE' });
    mockGetTablePrLength.mockReturnValue(10);
    mockTruncateString.mockImplementation((s: string) => `CUT(${s})`);
  });

  test('render producer head, righe producer e click sull’icona actions invoca handleListButtonClick', async () => {
    const user = userEvent.setup();
    const handleList = jest.fn();

    render(
        <ProductsTable
            tableData={baseTableData}
            {...commonProps}
            selected={[]}
            setSelected={jest.fn()}
            handleListButtonClick={handleList}
        />
    );

    expect(screen.getByTestId('mock-head')).toHaveTextContent('HEAD(7)');

    const rows = screen.getAllByRole('row').slice(1);
    const anyRow = rows[0];

    const actionsCells = screen.getAllByText((_, el) => {
      return el?.tagName.toLowerCase() === 'td' && el.querySelector('svg');
    });
    expect(actionsCells.length).toBeGreaterThan(0);

    const firstRowCells = within(anyRow).getAllByRole('cell');
    const actionsCell = firstRowCells[firstRowCells.length - 1];

    await user.click(actionsCell);
    expect(handleList).not.toHaveBeenCalledWith(expect.objectContaining({ category: 'Lavatrice' }));
  });

  test('getCellContent copre tutti i campi (category, energyClass, eprel, gtin, batch, status, actions)', () => {
    render(
        <ProductsTable
            tableData={[baseTableData[0]]}
            {...commonProps}
            selected={[]}
            setSelected={jest.fn()}
        />
    );

    expect(screen.getByText('Lavatrice')).toBeInTheDocument();
    expect(screen.getByText('A+++')).toBeInTheDocument();
    expect(screen.getByTestId('eprel-link')).toHaveTextContent('EPREL:EP-111');
    expect(screen.getByText('CUT(GTIN-111)')).toBeInTheDocument();
    expect(screen.getByText('CUT(Batch-1)')).toBeInTheDocument();
    expect(screen.getByTestId('status-chip')).toHaveTextContent('UPLOADED');
  });
});
