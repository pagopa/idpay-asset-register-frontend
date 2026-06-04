/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsTable from '../ProductsTable';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (k: string) => k }),
}));

jest.mock('../../../hooks/useInitiativeConfig', () => ({
  useInitiativeConfig: () => ({
    config: { tables: { products: { style: { lengths: { table: 10 } } } } },
  }),
}));

jest.mock('../../../helpers', () => ({
  truncateString: jest.fn((v: string, l: number) => v.slice(0, l)),
  getResponsiveTableMaxLength: jest.fn(() => 5),
}));

jest.mock('../../../components/Product/ProductStatusChip', () => ({
  __esModule: true,
  default: ({ status }: any) => <div data-testid="status">{status}</div>,
}));

jest.mock('../../../components/Product/EprelLinks', () => ({
  __esModule: true,
  default: () => <div data-testid="eprel">eprel</div>,
}));

const baseColumns: any = [
  { id: 'checkbox', labelKey: 'chk', type: 'checkbox' },
  { id: 'name', labelKey: 'name', sortable: true },
  { id: 'status', labelKey: 'status' },
  { id: 'link', labelKey: 'link', type: 'eprelLink' },
  { id: 'action', labelKey: 'act', type: 'action' },
];

const baseRow: any = {
  gtinCode: '123',
  name: 'LongValueName',
  status: 'APPROVED',
};

describe('ProductsTable', () => {
  it('renders empty state', () => {
    render(
      <ProductsTable
        tableData={[]}
        columns={baseColumns}
        order="asc"
        orderBy="name"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={jest.fn()}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders rows and checkbox selection', () => {
    const setSelected = jest.fn();

    render(
      <ProductsTable
        tableData={[baseRow]}
        columns={baseColumns}
        selection={{ enabled: true }}
        order="asc"
        orderBy="name"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={setSelected}
        handleListButtonClick={jest.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(setSelected).toHaveBeenCalled();
  });

  it('renders status and eprel link', () => {
    render(
      <ProductsTable
        tableData={[baseRow]}
        columns={baseColumns}
        order="asc"
        orderBy="name"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={jest.fn()}
      />
    );

    expect(screen.getByTestId('status')).toHaveTextContent('APPROVED');
    expect(screen.getByTestId('eprel')).toBeInTheDocument();
  });

  it('handles action click', () => {
    const handler = jest.fn();

    render(
      <ProductsTable
        tableData={[baseRow]}
        columns={baseColumns}
        order="asc"
        orderBy="name"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={handler}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalled();
  });

  it('handles sortable header click', () => {
    const sort = jest.fn();

    render(
      <ProductsTable
        tableData={[baseRow]}
        columns={baseColumns}
        order="asc"
        orderBy="name"
        onRequestSort={sort}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('name'));
    expect(sort).toHaveBeenCalled();
  });

  it('truncates long string values', () => {
    render(
      <ProductsTable
        tableData={[baseRow]}
        columns={[{ id: 'name', labelKey: 'name' }]}
        order="asc"
        orderBy="name"
        onRequestSort={jest.fn()}
        selected={[]}
        setSelected={jest.fn()}
        handleListButtonClick={jest.fn()}
      />
    );

    expect(screen.getByText('LongV')).toBeInTheDocument();
  });
});
