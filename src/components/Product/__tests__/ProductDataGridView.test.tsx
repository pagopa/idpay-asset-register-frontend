import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductDataGridView from '../ProductDataGridView';
import { ProductDTO } from '../../../api/generated/register';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../hooks/useProductFilters', () => ({
  useProductFilters: jest.fn(),
}));

jest.mock('../../../pages/components/EmptyListTable', () => () => (
  <div data-testid="empty-list">EmptyListTable</div>
));

jest.mock('../../../pages/components/ProductsTable', () => (props: any) => (
  <div data-testid="products-table-mock">
    ProductsTable
    <button onClick={() => props.onRequestSort?.({}, 'name')}>sort</button>
  </div>
));

jest.mock('../NewFilter', () => (props: any) => (
  <button data-testid="new-filter" onClick={props.onClick}>
    NewFilter
  </button>
));

jest.mock('../ProductStatusActionBar', () => () => (
  <div data-testid="status-action-bar">StatusActionBar</div>
));

const { useProductFilters } = require('../hooks/useProductFilters');

const baseProps = {
  isInvitaliaUser: false,
  isInvitaliaAdmin: false,
  tableData: [] as Array<ProductDTO>,
  hookLoading: false,
  itemsQty: 0,
  paginatorFrom: 1,
  paginatorTo: 10,
  page: 0,
  rowsPerPage: 10,
  order: 'asc',
  orderBy: 'name' as keyof ProductDTO,
  filters: {},
  enrichedFiltersConfig: [],
  selected: [],
  effectiveColumns: [],
  paginationConfig: undefined,
  tableConfig: {},
  refreshKey: 1,
  onRequestSort: jest.fn(),
  handleListButtonClick: jest.fn(),
  setSelected: jest.fn(),
  handleChangePage: jest.fn(),
  handleChangeRowsPerPage: jest.fn(),
  handleDeleteFiltersButtonClick: jest.fn(),
  handleToggleFiltersDrawer: jest.fn(),
  handleOpenModalWithStatusCheck: jest.fn(),
};

describe('ProductDataGridView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title with default subtitle', () => {
    useProductFilters.mockReturnValue({ filtersLabel: undefined });

    render(<ProductDataGridView {...baseProps} />);

    expect(screen.getByText('pages.products.title')).toBeInTheDocument();
    expect(screen.getByText('pages.products.subtitle')).toBeInTheDocument();
  });

  it('renders title with invitalia subtitle', () => {
    useProductFilters.mockReturnValue({ filtersLabel: undefined });

    render(<ProductDataGridView {...baseProps} isInvitaliaUser={true} />);

    expect(screen.getByText('pages.products.subtitleL1L2')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    useProductFilters.mockReturnValue({ filtersLabel: undefined });

    render(<ProductDataGridView {...baseProps} hookLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty list when no data and not loading', () => {
    useProductFilters.mockReturnValue({ filtersLabel: undefined });

    render(<ProductDataGridView {...baseProps} />);

    expect(screen.getByTestId('empty-list')).toBeInTheDocument();
  });

  it('renders products table and new filter button when data exists', () => {
    useProductFilters.mockReturnValue({ filtersLabel: undefined });

    const tableData = [{ id: '1' } as ProductDTO];

    render(<ProductDataGridView {...baseProps} tableData={tableData} />);

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
    expect(screen.getByTestId('products-table-mock')).toBeInTheDocument();
    expect(screen.getByTestId('new-filter')).toBeInTheDocument();
  });

  it('calls handleToggleFiltersDrawer when new filter clicked', () => {
    useProductFilters.mockReturnValue({ filtersLabel: undefined });

    const tableData = [{ id: '1' } as ProductDTO];

    render(<ProductDataGridView {...baseProps} tableData={tableData} />);

    fireEvent.click(screen.getByTestId('new-filter'));
    expect(baseProps.handleToggleFiltersDrawer).toHaveBeenCalledWith(true);
  });

  it('renders filter chip and triggers delete', () => {
    useProductFilters.mockReturnValue({ filtersLabel: 'FILTER_LABEL' });

    render(<ProductDataGridView {...baseProps} />);

    expect(screen.getByText('FILTER_LABEL')).toBeInTheDocument();

    const deleteIcon = screen.getByTestId('CloseIcon');
    fireEvent.click(deleteIcon);

    expect(screen.getByText('FILTER_LABEL')).toBeInTheDocument();
  });

  it('renders pagination when configured', () => {
    useProductFilters.mockReturnValue({ filtersLabel: undefined });

    render(
      <ProductDataGridView
        {...baseProps}
        paginationConfig={{ rowsPerPageOptions: [10, 20] }}
        itemsQty={100}
      />
    );

    expect(screen.getByText('pages.products.elementsPerPage')).toBeInTheDocument();
    expect(screen.getByText('1 - 10 pages.products.tablePaginationFrom 100')).toBeInTheDocument();
  });
});
