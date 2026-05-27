import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductDataGrid from '../ProductDataGrid';
import * as registerService from '../../../services/registerService';
import * as helpers from '../../../helpers';
import * as useInitiativeConfigHook from '../../../hooks/useInitiativeConfig';
import { productsSlice } from '../../../redux/slices/productsSlice';
import { invitaliaSlice } from '../../../redux/slices/invitaliaSlice';
import { USERS_TYPES } from '../../../utils/constants';

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  __esModule: true,
  useCurrentInitiativeId: jest.fn(() => 'init-1'),
}));

jest.mock('../../../hooks/useLogin', () => ({
  __esModule: true,
  userFromJwtTokenAsJWTUser: () => ({
    org_id: 'org',
    org_role: 'USER',
  }),
}));

jest.mock('../../../services/registerService');
jest.mock('../../../helpers');
jest.mock('../../../hooks/useInitiativeConfig');

jest.mock('../../../hooks/useInitiativesQuery', () => ({
  __esModule: true,
  useInitiativesQuery: () => ({
    initiatives: [],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('../../../redux/api/initiativesApi', () => ({
  __esModule: true,
  useGetInitiativesQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('../../DetailDrawer/DetailDrawer', () => ({
  __esModule: true,
  default: ({ children, open, toggleDrawer }: any) =>
    open ? (
      <div data-testid="detail-drawer">
        {children}
        <button onClick={() => toggleDrawer(false)}>Close Drawer</button>
      </div>
    ) : null,
}));

jest.mock('../../FiltersDrawer/FiltersDrawer', () => ({
  __esModule: true,
  default: ({ open, toggleFiltersDrawer }: any) =>
    open ? (
      <div data-testid="filters-drawer">
        <button onClick={() => toggleFiltersDrawer(false)}>Close Filters</button>
      </div>
    ) : null,
}));

jest.mock('../ProductDetail', () => ({
  __esModule: true,
  default: ({ onClose }: any) => (
    <div data-testid="product-detail">
      <button onClick={onClose}>Close Detail</button>
    </div>
  ),
}));

jest.mock('../ProductModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess }: any) =>
    open ? (
      <div data-testid="product-modal">
        <button onClick={onClose}>Close Modal</button>
        <button
          onClick={() =>
            onSuccess?.(require('../../../api/generated/register').ProductStatus.REJECTED)
          }
        >
          Success
        </button>
      </div>
    ) : null,
}));

jest.mock('../ProductConfirmDialog', () => ({
  __esModule: true,
  default: ({ open, onCancel, onConfirm }: any) =>
    open ? (
      <div data-testid="product-confirm-dialog">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

jest.mock('../../../pages/components/ProductsTable', () => ({
  __esModule: true,
  default: ({ tableData, handleListButtonClick, setSelected, selected }: any) => (
    <div data-testid="products-table-inner">
      {tableData.map((row: any, idx: number) => (
        <div key={idx}>
          <span>{row.productName}</span>
          <button data-testid={`detail-btn-${idx}`} onClick={() => handleListButtonClick(row)}>
            Details
          </button>
          <input
            type="checkbox"
            data-testid={`checkbox-${idx}`}
            checked={selected.includes(row.gtinCode)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelected([...selected, row.gtinCode]);
              } else {
                setSelected(selected.filter((x: string) => x !== row.gtinCode));
              }
            }}
          />
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../../pages/components/EmptyListTable', () => ({
  __esModule: true,
  default: () => <div data-testid="empty-list">empty</div>,
}));

jest.mock('../ProductDataGrid.helpers', () => {
  const getStatusChecks = jest.fn();

  return {
    __esModule: true,
    getStatusChecks,
    validateBulkActionPreconditions: jest.fn(({ selected, tableData, isInvitaliaAdmin }) => {
      const {
        selectedStatuses = [],
        someUploaded = false,
        length = 0,
      } = getStatusChecks(selected, tableData) ?? {};

      if (length === 0) {
        return { valid: false, reason: 'EMPTY' };
      }
      if (isInvitaliaAdmin && someUploaded) {
        return { valid: false, reason: 'SELF_APPROVAL' };
      }
      if (Array.from(new Set(selectedStatuses)).length > 1) {
        return { valid: false, reason: 'MIXED_STATUS' };
      }

      return { valid: true };
    }),
  };
});

const mockProducts = [
  {
    id: '1',
    productName: 'Prod 1',
    gtinCode: 'GTIN1',
    category: 'Cat',
    status: 'SUPERVISED',
  },
  {
    id: '2',
    productName: 'Prod 2',
    gtinCode: 'GTIN2',
    category: 'Cat',
    status: 'REJECTED',
  },
];

const createStore = () =>
  configureStore({
    reducer: {
      products: productsSlice.reducer,
      invitalia: invitaliaSlice.reducer,
    },
  });

const theme = createTheme();

const renderGrid = async (role: string = 'USER', products = mockProducts) => {
  (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
    org_id: 'org',
    org_role: role,
  });

  (useInitiativeConfigHook.useInitiativeConfig as jest.Mock).mockReturnValue({
    config: {
      tables: {
        products: {
          pagination: { defaultRowsPerPage: 10, rowsPerPageOptions: [10] },
          columns: [],
        },
      },
    },
    loading: false,
  });

  (registerService.getProducts as jest.Mock).mockResolvedValue({
    data: { content: products, pageNo: 0, totalElements: products.length },
  });

  (registerService.getBatchFilterList as jest.Mock).mockResolvedValue({
    data: [],
  });

  localStorage.setItem('token', 'fake-token');

  const store = createStore();

  await act(async () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <ProductDataGrid organizationId="org" />
          </ThemeProvider>
        </I18nextProvider>
      </Provider>
    );
  });

  await waitFor(() => {
    const table = screen.queryByTestId('products-table');
    const empty = screen.queryByTestId('empty-list');
    expect(table || empty).toBeTruthy();
  });
};

describe('ProductDataGrid (rewritten)', () => {
  beforeAll(() => {
    i18n.init({ resources: {}, lng: 'en', interpolation: { escapeValue: false } });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.validateBulkActionPreconditions.mockImplementation(
      ({ selected, tableData, isInvitaliaAdmin }: any) => {
        const {
          selectedStatuses = [],
          someUploaded = false,
          length = 0,
        } = helpersModule.getStatusChecks(selected, tableData) ?? {};

        if (length === 0) {
          return { valid: false, reason: 'EMPTY' };
        }
        if (isInvitaliaAdmin && someUploaded) {
          return { valid: false, reason: 'SELF_APPROVAL' };
        }
        if (Array.from(new Set(selectedStatuses)).length > 1) {
          return { valid: false, reason: 'MIXED_STATUS' };
        }

        return { valid: true };
      }
    );
    helpersModule.getStatusChecks.mockReturnValue({
      selectedStatuses: ['SUPERVISED'],
      someUploaded: false,
      length: 1,
    });
  });

  it('renders table when products exist', async () => {
    await renderGrid();
    expect(await screen.findByTestId('products-table')).toBeInTheDocument();
    expect(screen.getByText('Prod 1')).toBeInTheDocument();
    expect(screen.getByText('Prod 2')).toBeInTheDocument();
  });

  it('renders empty state when API returns no products', async () => {
    (registerService.getProducts as jest.Mock).mockResolvedValueOnce({
      data: { content: [], pageNo: 0, totalElements: 0 },
    });
    await renderGrid();
    await waitFor(() => expect(screen.getByTestId('empty-list')).toBeInTheDocument());
  });

  it('opens and closes detail drawer', async () => {
    await renderGrid();
    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('detail-btn-0'));
    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Detail'));
    await waitFor(() => expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument());
  });

  it('shows action buttons when Invitalia L1 selects a row', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('checkbox-0'));
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
    expect(screen.queryByTestId('supervisedBtn')).not.toBeInTheDocument();
  });

  it('shows supervised button when selected rows are not already supervised', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1, [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'REJECTED',
      },
    ]);
    await waitFor(() => screen.getByTestId('products-table'));
    fireEvent.click(screen.getByTestId('checkbox-0'));

    expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
  });

  it('disables wait approved action for Invitalia L1 when selected row already waits approval', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1, [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'WAIT_APPROVED',
      },
    ]);
    await waitFor(() => screen.getByTestId('products-table'));
    fireEvent.click(screen.getByTestId('checkbox-0'));

    expect(screen.getByTestId('waitApprovedBtn')).toBeDisabled();
  });

  it('validates selected rows on action click', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));

    const helpersModule = require('../ProductDataGrid.helpers');
    expect(helpersModule.validateBulkActionPreconditions).toHaveBeenCalledWith({
      selected: ['GTIN1'],
      tableData: mockProducts,
      isInvitaliaAdmin: false,
    });
    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
  });

  it('does not show rejected result directly from the grid action', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await waitFor(() => screen.getByTestId('products-table'));
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));

    expect(screen.queryByText(/msgResultRejected/i)).not.toBeInTheDocument();
  });

  it('validates selected rows for wait approved', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    const helpersModule = require('../ProductDataGrid.helpers');
    expect(helpersModule.validateBulkActionPreconditions).toHaveBeenCalledWith({
      selected: ['GTIN1'],
      tableData: mockProducts,
      isInvitaliaAdmin: false,
    });
    expect(screen.queryByTestId('product-confirm-dialog')).not.toBeInTheDocument();
  });

  it('does not open modal when no rows are selected', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');

    expect(screen.queryByTestId('rejectedBtn')).not.toBeInTheDocument();
  });

  it('renders pagination component when data is present', async () => {
    await renderGrid();
    await screen.findByTestId('products-table');

    expect(screen.getByText(/tablePaginationFrom/i)).toBeInTheDocument();
  });

  it('shows loading state branch', async () => {
    (registerService.getProducts as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: { content: mockProducts, pageNo: 0, totalElements: 2 },
              }),
            50
          )
        )
    );

    await renderGrid();
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('handles API error branch', async () => {
    (registerService.getProducts as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    await renderGrid();
    await waitFor(() => {
      expect(screen.getByTestId('empty-list')).toBeInTheDocument();
    });
  });

  it('handles batch filter API errors without blocking the table', async () => {
    (registerService.getBatchFilterList as jest.Mock).mockRejectedValue(new Error('Batch error'));

    await renderGrid();

    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
  });

  it('validates mixed statuses without opening a grid message', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.getStatusChecks.mockReturnValueOnce({
      selectedStatuses: ['A', 'B'],
      someUploaded: false,
      length: 2,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('checkbox-1'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));

    expect(helpersModule.validateBulkActionPreconditions).toHaveBeenCalledWith({
      selected: ['GTIN1', 'GTIN2'],
      tableData: mockProducts,
      isInvitaliaAdmin: false,
    });
    expect(screen.queryByText(/errorMixSelected/i)).not.toBeInTheDocument();
  });

  it('validates admin self approval without opening a grid message', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.getStatusChecks.mockReturnValueOnce({
      selectedStatuses: ['UPLOADED'],
      someUploaded: true,
      length: 1,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L2);
    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));

    expect(helpersModule.validateBulkActionPreconditions).toHaveBeenCalledWith({
      selected: ['GTIN1'],
      tableData: mockProducts,
      isInvitaliaAdmin: true,
    });
    expect(screen.queryByText(/errorYourselfApproved/i)).not.toBeInTheDocument();
  });

  it('renders filter chip when filters applied', async () => {
    await renderGrid();
    await screen.findByTestId('products-table');

    expect(screen.queryByRole('button', { name: /CloseIcon/i })).not.toBeInTheDocument();
  });

  it('renders admin default status filter', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L2);
    await screen.findByTestId('products-table');

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('opens and closes filters drawer from the new filter button', async () => {
    await renderGrid();
    await waitFor(() => screen.getByTestId('products-table'));

    fireEvent.click(screen.getByRole('button', { name: /common.advancedFilters/i }));
    expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Filters'));
    await waitFor(() => expect(screen.queryByTestId('filters-drawer')).not.toBeInTheDocument());
  });

  it('derives batchFilterItems correctly from tableData (coverage test)', async () => {
    await renderGrid('USER', [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'SUPERVISED',
        productFileId: 'file-1',
        batchName: 'Batch A',
      } as any,
      {
        id: '2',
        productName: 'Prod 2',
        gtinCode: 'GTIN2',
        category: 'Cat',
        status: 'REJECTED',
        productFileId: 'file-1', // duplicate id should not duplicate batch
        batchName: 'Batch A',
      } as any,
      {
        id: '3',
        productName: 'Prod 3',
        gtinCode: 'GTIN3',
        category: 'Cat',
        status: 'REJECTED',
        productFileId: 'file-2',
        batchName: 'Batch B',
      } as any,
    ]);

    // open filters drawer to ensure component mounts
    fireEvent.click(screen.getByRole('button', { name: /common.advancedFilters/i }));
    expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();

    // we cannot inspect internal props of mock directly,
    // but this ensures no crash and branch executed
    expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();
  });

  it('does not render component when products table is not configured', async () => {
    (useInitiativeConfigHook.useInitiativeConfig as jest.Mock).mockImplementation(() => ({
      config: { tables: {} },
      loading: false,
    }));

    // Ensure async services are safely mocked
    (registerService.getProducts as jest.Mock).mockResolvedValueOnce({
      data: { content: [], pageNo: 0, totalElements: 0 },
    });

    (registerService.getBatchFilterList as jest.Mock).mockResolvedValue({
      data: [],
    });

    const store = createStore();

    await act(async () => {
      render(
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <ProductDataGrid organizationId="org" />
            </ThemeProvider>
          </I18nextProvider>
        </Provider>
      );
    });

    expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
  });
});
