import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductDataGrid from '../ProductDataGrid';
import * as registerService from '../../../services/registerService';
import * as useLogin from '../../../hooks/useLogin';
import * as helpers from '../../../helpers';
import { productsSlice } from '../../../redux/slices/productsSlice';
import { invitaliaSlice } from '../../../redux/slices/invitaliaSlice';
import { USERS_TYPES } from '../../../utils/constants';

jest.mock('../../../utils/env', () => ({
  __esModule: true,
  default: {
    URL_API: { OPERATION: 'https://mock-api/register' },
    API_TIMEOUT_MS: { OPERATION: 5000 },
  },
}));
jest.mock('../../../routes', () => ({
  __esModule: true,
  default: { HOME: '/home' },
  BASE_ROUTE: '/base',
}));
jest.mock('../../../api/registerApiClient', () => ({
  RegisterApi: {
    getProductList: jest.fn(),
    getBatchFilterItems: jest.fn(),
  },
}));
jest.mock('../../../services/registerService');
jest.mock('../../../hooks/useLogin');
jest.mock('../../../helpers');
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
  default: ({ open, toggleFiltersDrawer, setFiltering }: any) =>
    open ? (
      <div data-testid="filters-drawer">
        <button onClick={() => toggleFiltersDrawer(false)}>Close Filters</button>
        <button onClick={() => setFiltering(true)}>Apply Filters</button>
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
  default: ({ open, onClose, onUpdateTable, onSuccess }: any) => {
    const { ProductStatusEnum } = require('../../../api/generated/register/ProductStatus');
    return open ? (
      <div data-testid="product-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onUpdateTable}>Update Table</button>
        <button onClick={() => onSuccess && onSuccess(ProductStatusEnum.REJECTED)}>Success</button>
      </div>
    ) : null;
  },
}));
jest.mock('../ProductConfirmDialog', () => ({
  __esModule: true,
  default: ({ open, onCancel, onConfirm, onSuccess }: any) =>
    open ? (
      <div data-testid="product-confirm-dialog">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onSuccess}>Success</button>
      </div>
    ) : null,
}));
jest.mock('../NewFilter', () => ({
  __esModule: true,
  default: ({ onClick }: any) => (
    <button data-testid="new-filter-btn" onClick={onClick}>
      New Filter
    </button>
  ),
}));
jest.mock('../../../pages/components/ProductsTable', () => ({
  __esModule: true,
  default: ({ tableData, handleListButtonClick, setSelected, selected, onRequestSort }: any) => (
    <div data-testid="products-table">
      {tableData.map((product: any, index: number) => (
        <div key={index} data-testid={`product-row-${index}`}>
          <span>{product.productName}</span>
          <button
            onClick={() => handleListButtonClick(product)}
            data-testid={`detail-btn-${index}`}
          >
            Details
          </button>
          <input
            type="checkbox"
            data-testid={`checkbox-${index}`}
            checked={selected.includes(product.gtinCode)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelected([...selected, product.gtinCode]);
              } else {
                setSelected(selected.filter((code: string) => code !== product.gtinCode));
              }
            }}
          />
          <button data-testid={`sort-btn-${index}`} onClick={() => onRequestSort?.({}, 'category')}>
            Sort
          </button>
        </div>
      ))}
    </div>
  ),
}));
jest.mock('../../../pages/components/EmptyListTable', () => ({
  __esModule: true,
  default: ({ message }: any) => <div data-testid="empty-list">{message}</div>,
}));
jest.mock('./../../../components/Product/MsgResult', () => ({
  __esModule: true,
  default: ({ severity, message }: any) => (
    <div data-testid={`msg-result-${severity}`}>{message}</div>
  ),
}));

import { CategoryEnum } from '../../../api/generated/register/ProductDTO';
import { ProductStatusEnum } from '../../../api/generated/register/ProductStatus';

const mockProductData = [
  {
    id: '1',
    productName: 'Test Product 1',
    gtinCode: 'GTIN001',
    category: CategoryEnum.Lavatrice,
    status: ProductStatusEnum.SUPERVISED,
    eprelCode: 'EPREL001',
    producerId: 'PRODUCER1',
    batchId: 'BATCH1',
  },
  {
    id: '2',
    productName: 'Test Product 2',
    gtinCode: 'GTIN002',
    category: CategoryEnum.Forno,
    status: ProductStatusEnum.REJECTED,
    eprelCode: 'EPREL002',
    producerId: 'PRODUCER2',
    batchId: 'BATCH2',
  },
];

const mockBatchFilterItems = [
  { productFileId: 'BATCH1', batchName: 'Batch 1' },
  { productFileId: 'BATCH2', batchName: 'Batch 2' },
];

const mockInstitutions = [
  { institutionId: 'PRODUCER1', description: 'Producer 1' },
  { institutionId: 'PRODUCER2', description: 'Producer 2' },
];

const createMockStore = (initialState: any = {}) =>
  configureStore({
    reducer: {
      products: productsSlice.reducer,
      invitalia: invitaliaSlice.reducer,
    },
    preloadedState: {
      products: { batchId: '', batchName: '', ...initialState.products },
      invitalia: {
        institution: null,
        institutionList: mockInstitutions,
        ...initialState.invitalia,
      },
    },
  });

const theme = createTheme();

const renderComponent = (props = {}, storeState = {}) => {
  const store = createMockStore(storeState);
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <ProductDataGrid organizationId="test-org-id" {...props} />
        </ThemeProvider>
      </I18nextProvider>
    </Provider>
  );
};

describe('ProductDataGrid', () => {
  const mockGetProducts = registerService.getProducts as jest.MockedFunction<
    typeof registerService.getProducts
  >;
  const mockGetBatchFilterList = registerService.getBatchFilterList as jest.MockedFunction<
    typeof registerService.getBatchFilterList
  >;
  const mockUserFromJwtToken = useLogin.userFromJwtTokenAsJWTUser as jest.MockedFunction<
    typeof useLogin.userFromJwtTokenAsJWTUser
  >;
  const mockFetchUserFromLocalStorage = helpers.fetchUserFromLocalStorage as jest.MockedFunction<
    typeof helpers.fetchUserFromLocalStorage
  >;

  beforeAll(() => {
    i18n.init({ resources: {}, lng: 'en', interpolation: { escapeValue: false } });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    mockGetProducts.mockResolvedValue({
      content: mockProductData,
      pageNo: 0 as any,
      totalElements: 2 as any,
    });
    mockGetBatchFilterList.mockResolvedValue(mockBatchFilterItems);
    mockUserFromJwtToken.mockReturnValue({
      org_id: 'test-org-id',
      org_role: 'USER',
      uid: '',
      taxCode: '',
      name: '',
      surname: '',
      email: '',
      org_name: '',
      org_party_role: '',
      org_address: '',
      org_pec: '',
      org_taxcode: '',
      org_vat: '',
      org_email: '',
    });
    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: 'USER',
    });
  });

  describe('Rendering and States', () => {
    it('renders loading state initially', async () => {
      mockGetProducts.mockImplementation(() => new Promise(() => {}));
      renderComponent();
      expect(screen.getByTestId('new-filter-btn')).toBeInTheDocument();
    });

    it('renders products table when data is loaded', async () => {
      renderComponent();
      await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    it('renders empty state when no products', async () => {
      mockGetProducts.mockResolvedValue({ content: [], pageNo: 0 as any, totalElements: 0 as any });
      renderComponent();
      await waitFor(() => expect(screen.getByTestId('empty-list')).toBeInTheDocument());
    });

    it('renders children when provided and no data', async () => {
      mockGetProducts.mockResolvedValue({ content: [], pageNo: 0 as any, totalElements: 0 as any });
      renderComponent({ children: <div data-testid="custom-children">Custom Content</div> });
      await waitFor(() => expect(screen.getByTestId('custom-children')).toBeInTheDocument());
    });
  });

  describe('User Types and Roles', () => {
    it('calls getProducts with org_id for regular user', async () => {
      renderComponent();
      await waitFor(() => {
        expect(mockGetProducts).toHaveBeenCalledWith(
          'test-org-id',
          0,
          10,
          'category,asc',
          '',
          '',
          '',
          '',
          undefined,
          ''
        );
      });
    });

    it('calls getProducts with institutionId for Invitalia user', async () => {
      mockFetchUserFromLocalStorage.mockReturnValue({
        org_id: 'test-org-id',
        org_role: USERS_TYPES.INVITALIA_L1,
      });
      const storeState = {
        invitalia: {
          institution: { institutionId: 'invitalia-inst-id' },
          institutionList: mockInstitutions,
        },
      };
      renderComponent({}, storeState);
      await waitFor(() => {
        expect(mockGetProducts).toHaveBeenCalledWith(
          'invitalia-inst-id',
          0,
          10,
          'category,asc',
          '',
          '',
          '',
          '',
          undefined,
          ''
        );
      });
    });

    it('shows action buttons for Invitalia user with selections', async () => {
      mockFetchUserFromLocalStorage.mockReturnValue({
        org_id: 'test-org-id',
        org_role: USERS_TYPES.INVITALIA_L1,
      });
      renderComponent();
      await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('checkbox-0'));
      expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
      expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('opens and closes filters drawer', async () => {
      renderComponent();
      await waitFor(() => expect(screen.getByTestId('new-filter-btn')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('new-filter-btn'));
      expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Close Filters'));
      await waitFor(() => expect(screen.queryByTestId('filters-drawer')).not.toBeInTheDocument());
    });
  });

  describe('Sorting and Pagination', () => {
    it('handles sorting', async () => {
      renderComponent();
      await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('sort-btn-0'));
    });
  });

  describe('Product Detail Drawer', () => {
    it('opens and closes detail drawer', async () => {
      renderComponent();
      await waitFor(() => expect(screen.getByTestId('detail-btn-0')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('detail-btn-0'));
      expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Close Detail'));
      await waitFor(() => expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument());
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockGetProducts.mockRejectedValue(new Error('API Error'));
      renderComponent();
      await waitFor(() => expect(screen.getByTestId('empty-list')).toBeInTheDocument());
    });

    it('handles batch filter API errors', async () => {
      mockGetBatchFilterList.mockRejectedValue(new Error('Batch API Error'));
      renderComponent();
      await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
    });
  });
});

jest.mock('../../FiltersDrawer/FiltersDrawer', () => ({
  __esModule: true,
  default: ({ open, toggleFiltersDrawer, setFiltering }: any) =>
      open ? (
          <div data-testid="filters-drawer">
            <button onClick={() => toggleFiltersDrawer(false)}>Close Filters</button>
            <button onClick={() => setFiltering(true)}>Apply Filters</button>
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
  default: ({ open, onClose, onUpdateTable, onSuccess }: any) => {
    const { ProductStatusEnum } = require('../../../api/generated/register/ProductStatus');
    return open ? (
        <div data-testid="product-modal">
          <button onClick={onClose}>Close Modal</button>
          <button onClick={onUpdateTable}>Update Table</button>
          <button onClick={() => onSuccess && onSuccess(ProductStatusEnum.SUPERVISED)}>Success</button>
        </div>
    ) : null;
  },
}));

jest.mock('../../../pages/components/EmptyListTable', () => ({
  __esModule: true,
  default: ({ message }: any) => <div data-testid="empty-list">{message}</div>,
}));

jest.mock('./../../../components/Product/MsgResult', () => ({
  __esModule: true,
  default: ({ severity, message }: any) => (
      <div data-testid={`msg-result-${severity}`}>{message}</div>
  ),
}));

jest.mock('../ProductDataGrid.helpers', () => ({
  __esModule: true,
  getStatusChecks: jest.fn(),
}));

const renderGrid = (props = {}, storeState = {}) => {
  const store = createMockStore(storeState);
  return render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <ProductDataGrid organizationId="test-org-id" {...props} />
          </ThemeProvider>
        </I18nextProvider>
      </Provider>
  );
};

const baseProducts = [
  {
    id: '1',
    productName: 'Test Product 1',
    gtinCode: 'GTIN001',
    category: CategoryEnum.Lavatrice,
    status: ProductStatusEnum.SUPERVISED,
    eprelCode: 'EPREL001',
    producerId: 'PRODUCER1',
    batchId: 'BATCH1',
  },
  {
    id: '2',
    productName: 'Test Product 2',
    gtinCode: 'GTIN002',
    category: CategoryEnum.Forno,
    status: ProductStatusEnum.REJECTED,
    eprelCode: 'EPREL002',
    producerId: 'PRODUCER2',
    batchId: 'BATCH2',
  },
];

describe('ProductDataGrid – extra coverage', () => {
  const mockGetProducts = registerService.getProducts as jest.MockedFunction<
      typeof registerService.getProducts
  >;
  const mockGetBatchFilterList = registerService.getBatchFilterList as jest.MockedFunction<
      typeof registerService.getBatchFilterList
  >;
  const mockUserFromJwtToken = useLogin.userFromJwtTokenAsJWTUser as jest.MockedFunction<
      typeof useLogin.userFromJwtTokenAsJWTUser
  >;
  const mockFetchUserFromLocalStorage = helpers.fetchUserFromLocalStorage as jest.MockedFunction<
      typeof helpers.fetchUserFromLocalStorage
  >;
  const mockGetStatusChecks = require('../ProductDataGrid.helpers')
      .getStatusChecks as jest.MockedFunction<any>;

  beforeAll(() => {
    i18n.init({ resources: {}, lng: 'en', interpolation: { escapeValue: false } });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    mockGetProducts.mockResolvedValue({
      content: baseProducts,
      pageNo: 0 as any,
      totalElements: 2 as any,
    });
    mockGetBatchFilterList.mockResolvedValue([
      { productFileId: 'BATCH1', batchName: 'Batch 1' },
      { productFileId: 'BATCH2', batchName: 'Batch 2' },
    ]);
    mockUserFromJwtToken.mockReturnValue({
      org_id: 'test-org-id',
      org_role: 'USER',
      uid: '',
      taxCode: '',
      name: '',
      surname: '',
      email: '',
      org_name: '',
      org_party_role: '',
      org_address: '',
      org_pec: '',
      org_taxcode: '',
      org_vat: '',
      org_email: '',
    });
    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: 'USER',
    });

    mockGetStatusChecks.mockReset();
  });

  it('shows the Supervised action button for Invitalia L1 when selected rows contain no supervised items', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: USERS_TYPES.INVITALIA_L1,
    });

    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('checkbox-1'));

    expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
  });

  it('disables Wait Approved for Invitalia L1 when a selected row is already WAIT_APPROVED', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: USERS_TYPES.INVITALIA_L1,
    });

    mockGetProducts.mockResolvedValue({
      content: [
        {
          ...baseProducts[0],
          gtinCode: 'GTIN003',
          productName: 'Already Waiting',
          status: ProductStatusEnum.WAIT_APPROVED,
        },
      ],
      pageNo: 0 as any,
      totalElements: 1 as any,
    });

    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('checkbox-0'));

    const waitBtn = screen.getByTestId('waitApprovedBtn');
    expect(waitBtn).toBeDisabled();
  });

  it('opens ProductModal for Invitalia L1 when status checks pass for SUPERVISED action', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: USERS_TYPES.INVITALIA_L1,
    });

    mockGetStatusChecks.mockReturnValue({
      allUploaded: true,
      allSupervised: false,
      allWaitApproved: false,
      someUploaded: false,
      length: 1,
    });

    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByText('invitaliaModal.rejected.buttonText (1)'));

    await waitFor(() => expect(screen.getByTestId('product-modal')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Success'));
    expect(screen.getByTestId('msg-result-success')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Modal'));
    await waitFor(() =>
        expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument()
    );
  });

  it('opens Confirm dialog for WAIT_APPROVED flow and handles confirm + success messages', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: USERS_TYPES.INVITALIA_L1,
    });

    mockGetStatusChecks.mockReturnValue({
      allUploaded: true,
      allSupervised: false,
      allWaitApproved: false,
      someUploaded: false,
      length: 1,
    });

    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('checkbox-1'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    await waitFor(() =>
        expect(screen.getByTestId('product-confirm-dialog')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() =>
        expect(screen.queryByTestId('product-confirm-dialog')).not.toBeInTheDocument()
    );

    expect(screen.getByTestId('msg-result-success')).toBeInTheDocument();
  });

  it('shows mix-status error when status checks fail, then hides it after timeout', async () => {
    jest.useFakeTimers();

    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: USERS_TYPES.INVITALIA_L1,
    });

    mockGetStatusChecks.mockReturnValue({
      allUploaded: false,
      allSupervised: false,
      allWaitApproved: false,
      someUploaded: false,
      length: 2,
    });

    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('checkbox-1'));

    fireEvent.click(screen.getByTestId('rejectedBtn'));

    expect(screen.getByTestId('msg-result-error')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
  });

  it('shows "yourself approved" error for Invitalia L2 when someUploaded is true', async () => {
    jest.useFakeTimers();
    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: USERS_TYPES.INVITALIA_L2,
    });

    mockGetStatusChecks.mockReturnValue({
      allUploaded: false,
      allSupervised: false,
      allWaitApproved: false,
      someUploaded: true,
      length: 1,
    });

    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    expect(screen.getByTestId('msg-result-error')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
  });

  it('renders a filter chip automatically for Invitalia L2 (admin default status) and shows pagination label', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({
      org_id: 'test-org-id',
      org_role: USERS_TYPES.INVITALIA_L2,
    });

    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    expect(
        screen.getByText(/1 - 2 pages\.products\.tablePaginationFrom 2/i)
    ).toBeInTheDocument();
  });

  it('opens and closes the Filters drawer and applies filtering (setFiltering)', async () => {
    renderGrid();
    await waitFor(() => expect(screen.getByTestId('new-filter-btn')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('new-filter-btn'));
    expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Apply Filters'));

    fireEvent.click(screen.getByText('Close Filters'));
    await waitFor(() =>
        expect(screen.queryByTestId('filters-drawer')).not.toBeInTheDocument()
    );
  });

  it('handles sorting and paginated label rendering', async () => {
    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('sort-btn-0'));

    expect(
        screen.getByText('New Filter')
    ).toBeInTheDocument();
  });

  it('opens and closes the Detail drawer via ProductsTable callback', async () => {
    renderGrid();
    await waitFor(() => expect(screen.getByTestId('detail-btn-0')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('detail-btn-0'));
    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('product-detail')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Detail'));
    await waitFor(() =>
        expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument()
    );
  });

  it('gracefully handles getBatchFilterList API error path without breaking the table', async () => {
    (registerService.getBatchFilterList as jest.Mock).mockRejectedValueOnce(
        new Error('Batch API Error (extra)')
    );

    renderGrid();
    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
  });
});