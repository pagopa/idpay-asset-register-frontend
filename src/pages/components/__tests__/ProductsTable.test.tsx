import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductsTable from '../ProductsTable';
import { ProductStatus } from '../../../api/generated/register';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (k: string) => k,
    initiativeName: 'test',
  }),
}));

const columns = [
  { id: 'checkbox', labelKey: 'checkbox', type: 'checkbox' as const },
  { id: 'category', labelKey: 'category', sortable: true },
  { id: 'gtinCode', labelKey: 'gtin' },
  { id: 'action', labelKey: 'action', type: 'action' as const },
];

const baseData = [
  {
    category: 'Lavatrice',
    gtinCode: 'GTIN-1',
    status: ProductStatus.SUPERVISED,
  },
  {
    category: 'Forno',
    gtinCode: 'GTIN-2',
    status: ProductStatus.REJECTED,
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
  it('renders headers and rows correctly', () => {
    renderTable();

    expect(screen.getByText('category')).toBeInTheDocument();
    expect(screen.getByText('Lavatrice')).toBeInTheDocument();
    expect(screen.getByText('Forno')).toBeInTheDocument();
  });

  it('calls onRequestSort when clicking sortable header', () => {
    const onRequestSort = jest.fn();

    renderTable({ onRequestSort });

    fireEvent.click(screen.getByText('category'));
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
    const firstDataRow = rows[1]; // skip header row

    const actionButton = firstDataRow.querySelector('button');
    fireEvent.click(actionButton as HTMLElement);

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
