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

jest.mock('../../../services/registerService');
jest.mock('../../../helpers');
jest.mock('../../../hooks/useInitiativeConfig');

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
    <div data-testid="products-table">
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

jest.mock('../ProductDataGrid.helpers', () => ({
  __esModule: true,
  getStatusChecks: jest.fn(() => ({
    selectedStatuses: [require('../../../api/generated/register').ProductStatus.SUPERVISED],
    someUploaded: false,
    length: 1,
  })),
}));

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

const renderGrid = async (role: string = 'USER') => {
  (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
    org_id: 'org',
    org_role: role,
  });

  (useInitiativeConfigHook.useInitiativeConfig as jest.Mock).mockReturnValue({
    config: {
      tables: {
        products: {
          ui: { pagination: { defaultRowsPerPage: 10, rowsPerPageOptions: [10] } },
        },
      },
    },
    loading: false,
  });

  (registerService.getProducts as jest.Mock).mockResolvedValue({
    data: { content: mockProducts, pageNo: 0, totalElements: 2 },
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
};

describe('ProductDataGrid (rewritten)', () => {
  beforeAll(() => {
    i18n.init({ resources: {}, lng: 'en', interpolation: { escapeValue: false } });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table when products exist', async () => {
    await renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
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
    await waitFor(() => screen.getByTestId('products-table'));
    fireEvent.click(screen.getByTestId('detail-btn-0'));
    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close Detail'));
    await waitFor(() => expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument());
  });

  it('shows action buttons when Invitalia L1 selects a row', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await waitFor(() => screen.getByTestId('products-table'));
    fireEvent.click(screen.getByTestId('checkbox-0'));
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
  });

  it('opens ProductModal on action click', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await waitFor(() => screen.getByTestId('products-table'));
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));
    await waitFor(() => expect(screen.getByTestId('product-modal')).toBeInTheDocument());
  });

  it('opens confirm dialog for wait approved', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await waitFor(() => screen.getByTestId('products-table'));
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));
    await waitFor(() => expect(screen.getByTestId('product-confirm-dialog')).toBeInTheDocument());
  });
});
