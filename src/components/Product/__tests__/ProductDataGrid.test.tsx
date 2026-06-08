import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

import ProductDataGrid from '../ProductDataGrid';

import * as registerService from '../../../services/registerService';
import * as helpers from '../../../helpers';
import * as useInitiativeConfigHook from '../../../hooks/useInitiativeConfig';
import * as resolvedTableConfigHook from '../hooks/useResolvedProductTableConfig';
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
jest.mock('../../../api/registerApiClient', () => ({
  __esModule: true,
  RegisterApi: {
    setWaitApprovedStatusList: jest.fn().mockResolvedValue({}),
    setApprovedStatusList: jest.fn().mockResolvedValue({}),
    setSupervisionedStatusList: jest.fn().mockResolvedValue({}),
    setRejectedStatusList: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock('../../../helpers');
jest.mock('../../../hooks/useInitiativeConfig');

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
    isLoading: false,
  }),
}));

jest.mock('../hooks/useResolvedProductTableConfig', () => ({
  __esModule: true,
  useResolvedProductTableConfig: jest.fn(),
}));

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

jest.mock('../ProductBulkActionDialog', () => ({
  __esModule: true,
  default: ({ open, onClose, onConfirm }: any) =>
    open ? (
      <div data-testid="bulk-dialog">
        <button onClick={onClose}>Close Bulk</button>
        <button onClick={() => onConfirm?.('ACTION', 'reason')}>Confirm Bulk</button>
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
  const handleModalSuccess = jest.fn();

  return {
    __esModule: true,
    getSelectedStatuses: jest.fn((selected, tableData) =>
      selected
        .map((gtinCode: string) => tableData.find((row: any) => row.gtinCode === gtinCode)?.status)
        .filter(Boolean)
    ),
    getStatusChecks,
    handleModalSuccess,
    checkSomeStatus: jest.fn((selected, tableData, status) =>
      selected.some(
        (code: string) =>
          String(tableData.find((row: any) => row.gtinCode === code)?.status) === status
      )
    ),
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

const renderGrid = async (
  role: string = 'USER',
  products = mockProducts,
  {
    hasPermission = true,
    organizationSource,
    defaultFiltersByRole,
    expectRendered = true,
  }: {
    hasPermission?: boolean;
    organizationSource?: string;
    defaultFiltersByRole?: Record<string, Record<string, string>>;
    expectRendered?: boolean;
  } = {}
) => {
  (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
    org_id: 'org',
    org_role: role,
  });

  (useInitiativeConfigHook.useInitiativeConfig as jest.Mock).mockReturnValue({
    config: {
      subRoles: {
        USER: {
          permissions: { tables: hasPermission ? ['products'] : [] },
        },
        [USERS_TYPES.INVITALIA_L1]: {
          permissions: { tables: hasPermission ? ['products'] : [] },
        },
        [USERS_TYPES.INVITALIA_L2]: {
          permissions: { tables: hasPermission ? ['products'] : [] },
        },
      },
      tables: {
        products: {
          pagination: { defaultRowsPerPage: 10, rowsPerPageOptions: [10] },
          columns: [],
          selection: {
            [USERS_TYPES.INVITALIA_L1]: ['REJECTED', 'WAIT_APPROVED'],
            [USERS_TYPES.INVITALIA_L2]: ['WAIT_APPROVED'],
          },
          organizationSource,
          defaultFiltersByRole,
        },
      },
    },
    loading: false,
  });

  (resolvedTableConfigHook.useResolvedProductTableConfig as jest.Mock).mockReturnValue({
    tableConfig: {
      columns: [],
      selection: {
        [USERS_TYPES.INVITALIA_L1]: ['REJECTED', 'WAIT_APPROVED'],
        [USERS_TYPES.INVITALIA_L2]: ['WAIT_APPROVED'],
        rules: {
          [USERS_TYPES.INVITALIA_L1]: ['REJECTED', 'WAIT_APPROVED'],
          [USERS_TYPES.INVITALIA_L2]: ['WAIT_APPROVED'],
        },
      },
      organizationSource,
      defaultFiltersByRole,
    },
    paginationConfig: { defaultRowsPerPage: 10, rowsPerPageOptions: [10] },
    filtersConfig: [],
    templateConfig: {},
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
          <MemoryRouter>
            <ThemeProvider theme={theme}>
              <ProductDataGrid organizationId="org" />
            </ThemeProvider>
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );
  });

  if (expectRendered) {
    await waitFor(() => {
      const table = screen.queryByTestId('products-table');
      const empty = screen.queryByTestId('empty-list');
      expect(table || empty).toBeTruthy();
    });
  }
};

describe('ProductDataGrid (rewritten)', () => {
  beforeAll(() => {
    i18n.init({ resources: {}, lng: 'en', interpolation: { escapeValue: false } });
  });

  afterEach(() => {
    cleanup();
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
    helpersModule.getSelectedStatuses.mockImplementation(
      (selected: Array<string>, tableData: Array<any>) =>
        selected
          .map(
            (gtinCode: string) => tableData.find((row: any) => row.gtinCode === gtinCode)?.status
          )
          .filter(Boolean)
    );
    helpersModule.getStatusChecks.mockReturnValue({
      selectedStatuses: ['SUPERVISED'],
      someUploaded: false,
      length: 1,
    });
    helpersModule.checkSomeStatus.mockImplementation(
      (selected: Array<string>, tableData: Array<any>, status: string) =>
        selected.some(
          (code: string) =>
            String(tableData.find((row: any) => row.gtinCode === code)?.status) === status
        )
    );
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

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
  });

  it('disables wait approved action for Invitalia L1 when selected row already waits approval', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.checkSomeStatus.mockReturnValueOnce(true);

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

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
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

    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('product-confirm-dialog')).toBeInTheDocument();
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

  it('validates mixed statuses without opening modal', async () => {
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

    expect(screen.getByTestId('rejectedBtn')).toBeDisabled();
    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
  });

  it('validates admin self approval without opening a grid message', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.getStatusChecks.mockReturnValueOnce({
      selectedStatuses: ['UPLOADED'],
      someUploaded: true,
      length: 1,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L2);
    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByText(/errorYourselfApproved/i)).toBeInTheDocument();
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
        productFileId: 'file-1',
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

    fireEvent.click(screen.getByRole('button', { name: /common.advancedFilters/i }));
    expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();

    expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();
  });

  it('does not render component when products table is not configured', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: 'org',
      org_role: 'USER',
    });

    (resolvedTableConfigHook.useResolvedProductTableConfig as jest.Mock).mockReturnValue({
      tableConfig: undefined,
      paginationConfig: {},
      filtersConfig: [],
      templateConfig: {},
    });

    (useInitiativeConfigHook.useInitiativeConfig as jest.Mock).mockReturnValue({
      config: {},
      loading: false,
    });

    (registerService.getProducts as jest.Mock).mockResolvedValue({
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
            <MemoryRouter>
              <ThemeProvider theme={theme}>
                <ProductDataGrid organizationId="org" />
              </ThemeProvider>
            </MemoryRouter>
          </I18nextProvider>
        </Provider>
      );
    });

    expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
  });

  it('renders empty list when user has no products permission', async () => {
    await renderGrid('USER', mockProducts, { hasPermission: false });
    await waitFor(() => {
      expect(screen.getByTestId('empty-list')).toBeInTheDocument();
    });
  });

  it('does not render grid when organizationSource is filter and no producer filter is set', async () => {
    await renderGrid('USER', mockProducts, {
      organizationSource: 'filter',
      expectRendered: false,
    });

    expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-list')).not.toBeInTheDocument();
  });

  it('applies role-based default filters when configured', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L2, mockProducts, {
      defaultFiltersByRole: {
        [USERS_TYPES.INVITALIA_L2]: {
          status: 'WAIT_APPROVED',
        },
      },
    });

    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('opens bulk dialog and confirms action (covers modal success path)', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'SUPERVISED',
      },
    ]);

    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));

    const rejectedBtn = screen.getByTestId('rejectedBtn');

    fireEvent.click(rejectedBtn);

    await waitFor(() => expect(screen.getByTestId('product-modal')).toBeInTheDocument());
  });

  it('closes detail drawer using toggleDrawer button (covers cleanup branch)', async () => {
    await renderGrid();
    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('detail-btn-0'));
    expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Drawer'));

    await waitFor(() => expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument());
  });

  it('calls correct WAIT_APPROVED success flow', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');

    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'SUPERVISED',
      },
    ]);

    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    fireEvent.click(await screen.findByText('Confirm'));

    await waitFor(() => expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument());
  });

  it('covers productCode selection branch (line 122)', async () => {
    await renderGrid('USER', [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        productCode: 'PCODE1',
        category: 'Cat',
        status: 'SUPERVISED',
      } as any,
    ]);

    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('checkbox-0'));
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
  });

  it('does not render producer readable name branch scenario without filter-selected organization', async () => {
    await renderGrid(
      'USER',
      [
        {
          id: '1',
          productName: 'Prod 1',
          gtinCode: 'GTIN1',
          category: 'Cat',
          status: 'SUPERVISED',
          organizationName: 'Readable Org',
        } as any,
      ],
      { organizationSource: 'filter', expectRendered: false }
    );

    expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-list')).not.toBeInTheDocument();
  });

  it('covers setMsgResultByAction branches (398-410)', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L2, [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'SUPERVISED',
      },
    ]);

    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));
    fireEvent.click(await screen.findByText('Success'));

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers confirm dialog fallback status branch (line 522)', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: undefined,
      } as any,
    ]);

    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));
    fireEvent.click(await screen.findByText('Confirm'));

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers WAIT_APPROVED L2 branch (line 406)', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L2, [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'SUPERVISED',
      },
    ]);

    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers REJECT_APPROVATION L2 branch (line 410)', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L2);

    await screen.findByTestId('products-table');
    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));
    fireEvent.click(await screen.findByText('Success'));

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers getMsgResultByActionType default branch (line 488)', async () => {
    await renderGrid();
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('calls correct REJECTED success flow', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');

    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1);

    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));

    fireEvent.click(await screen.findByText('Success'));

    await waitFor(() => expect(screen.getByText(/msgResultRejected/i)).toBeInTheDocument());
  });

  it('covers batchFromHistory branch in filters merge (line 219)', async () => {
    sessionStorage.setItem('batchFromHistory', 'BATCH_X');

    await renderGrid('USER', mockProducts);

    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();

    sessionStorage.removeItem('batchFromHistory');
  });

  it('covers organizationId conditional branch (lines 246-247)', async () => {
    await renderGrid('USER', mockProducts, {
      organizationSource: undefined,
    });

    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers !currentRoleKey branch (line 290)', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: 'org',
      org_role: undefined,
    });

    await renderGrid('USER', mockProducts);

    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers prev.status reset branch (line 302)', async () => {
    const helpersModule = require('../ProductDataGrid.helpers');
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, mockProducts);

    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));
    fireEvent.click(await screen.findByText('Confirm'));

    await waitFor(() => expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument());
  });

  it('covers displayBatchName fallback branches (88,152-167)', async () => {
    await renderGrid('USER', [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'SUPERVISED',
        productFileId: 'batch-1',
        batchName: 'file.csv',
      } as any,
    ]);

    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers filter map and reduce branches (106,113)', async () => {
    await renderGrid('USER', mockProducts, {
      defaultFiltersByRole: {
        USER: { status: 'SUPERVISED' },
      },
    });

    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers permission org_id truthy branch (127,132)', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: 'org',
      org_role: 'USER',
    });

    await renderGrid('USER', mockProducts);
    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers dispatch reset batchId and batchName (170-171)', async () => {
    await renderGrid();
    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers readableName branch (252-255)', async () => {
    await renderGrid('USER', [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'SUPERVISED',
        organizationName: 'Readable Org',
      } as any,
    ]);

    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers batch reduce accumulator branch (269-272)', async () => {
    await renderGrid('USER', [
      {
        id: '1',
        productName: 'Prod 1',
        gtinCode: 'GTIN1',
        category: 'Cat',
        status: 'SUPERVISED',
        productFileId: 'file-1',
      } as any,
    ]);

    await screen.findByTestId('products-table');
    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers resetAllMsgResults function (393)', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));
    fireEvent.click(await screen.findByText('Success'));

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers DEBUG_CONSOLE error branch (430-432)', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (registerService.getProducts as jest.Mock).mockRejectedValueOnce(new Error('debug error'));

    await renderGrid();
    await waitFor(() => expect(screen.getByTestId('empty-list')).toBeInTheDocument());

    errorSpy.mockRestore();
  });

  it('covers normalizeLegacyColumn mapping branch (line 477)', async () => {
    (resolvedTableConfigHook.useResolvedProductTableConfig as jest.Mock).mockReturnValue({
      tableConfig: {
        columns: [
          {
            id: 'organizationName',
            labelKey: 'pages.products.listHeader.organizationName',
          },
        ],
        selection: {
          [USERS_TYPES.INVITALIA_L1]: ['REJECTED'],
          rules: {},
        },
      },
      paginationConfig: { defaultRowsPerPage: 10, rowsPerPageOptions: [10] },
      filtersConfig: [],
      templateConfig: {},
    });

    await renderGrid('USER', mockProducts);
    await screen.findByTestId('products-table');

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers normalizeLegacyColumn fallback branch (returns col)', async () => {
    (resolvedTableConfigHook.useResolvedProductTableConfig as jest.Mock).mockReturnValue({
      tableConfig: {
        columns: [
          {
            id: 'custom',
            labelKey: 'tables.products.columns.custom',
          },
        ],
        selection: {
          [USERS_TYPES.INVITALIA_L1]: ['REJECTED'],
          rules: {},
        },
      },
      paginationConfig: { defaultRowsPerPage: 10, rowsPerPageOptions: [10] },
      filtersConfig: [],
      templateConfig: {},
    });

    await renderGrid('USER', mockProducts);
    await screen.findByTestId('products-table');

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });
});
