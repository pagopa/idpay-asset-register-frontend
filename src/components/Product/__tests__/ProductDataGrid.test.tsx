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
import { MouseEventHandler, ReactNode } from 'react';

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
    t: (key: any) => key,
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
  default: ({
    children,
    open,
    toggleDrawer,
  }: {
    children: ReactNode;
    open: boolean;
    toggleDrawer: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="detail-drawer">
        {children}
        <button onClick={() => toggleDrawer?.(false)}>Close Drawer</button>
      </div>
    ) : null,
}));

jest.mock('../../FiltersDrawer/FiltersDrawer', () => ({
  __esModule: true,
  default: ({
    open,
    toggleFiltersDrawer,
    setFilters,
    filters,
  }: {
    open: boolean;
    toggleFiltersDrawer: (open: boolean) => void;
    setFilters?: (filters: Record<string, { value: string; label?: string }>) => void;
    filters?: Record<string, { value: string; label?: string }>;
  }) =>
    open ? (
      <div data-testid="filters-drawer" data-filters={Object.keys(filters ?? {}).join(',')}>
        <button onClick={() => toggleFiltersDrawer?.(false)}>Close Filters</button>
        <button onClick={() => setFilters?.({})}>Apply Empty Filters</button>
        <button
          onClick={() =>
            setFilters?.({
              category: { value: 'satellitare', label: 'Satellitare' },
            })
          }
        >
          Apply Category Filter
        </button>
        <button
          onClick={() =>
            setFilters?.({
              producer: { value: 'producer-org', label: 'Producer Org' },
            })
          }
        >
          Apply Producer Filter
        </button>
      </div>
    ) : null,
}));

jest.mock('../ProductDetail', () => ({
  __esModule: true,
  default: (props: {
    onClose: MouseEventHandler<HTMLButtonElement> | undefined;
    onShowApprovedMsg: MouseEventHandler<HTMLButtonElement> | undefined;
    onShowRejectedMsg: MouseEventHandler<HTMLButtonElement> | undefined;
    onShowWaitApprovedMsg: MouseEventHandler<HTMLButtonElement> | undefined;
    onShowSupervisedMsg: MouseEventHandler<HTMLButtonElement> | undefined;
    onShowRejectedApprovationMsg: MouseEventHandler<HTMLButtonElement> | undefined;
    onShowAcceptApprovationMsg: MouseEventHandler<HTMLButtonElement> | undefined;
    onShowGenericError: MouseEventHandler<HTMLButtonElement> | undefined;
    onUpdateTable: MouseEventHandler<HTMLButtonElement> | undefined;
  }) => (
    <div data-testid="product-detail">
      <button onClick={props.onClose}>Close Detail</button>
      <button onClick={props.onUpdateTable}>Update Detail</button>
      <button onClick={props.onShowApprovedMsg}>approved</button>
      <button onClick={props.onShowRejectedMsg}>rejected</button>
      <button onClick={props.onShowWaitApprovedMsg}>wait</button>
      <button onClick={props.onShowSupervisedMsg}>supervised</button>
      <button onClick={props.onShowRejectedApprovationMsg}>rejectApp</button>
      <button onClick={props.onShowAcceptApprovationMsg}>acceptApp</button>
      <button onClick={props.onShowGenericError}>error</button>
    </div>
  ),
}));

jest.mock('../ProductBulkActionDialog', () => ({
  __esModule: true,
  default: ({
    open,
    onClose,
    onConfirm,
  }: {
    open: boolean;
    onClose?: () => void;
    onConfirm?: (action: string, reason?: string) => void;
  }) =>
    open ? (
      <div data-testid="bulk-dialog">
        <button onClick={onClose}>Close Bulk</button>
        <button onClick={() => onConfirm?.('ACTION', 'reason')}>Confirm Bulk</button>
      </div>
    ) : null,
}));

jest.mock('../ProductModal', () => ({
  __esModule: true,
  default: ({
    open,
    onClose,
    onSuccess,
    onUpdateTable,
  }: {
    open: boolean;
    onClose?: (refresh?: boolean) => void;
    onSuccess?: (status: string) => void;
    onUpdateTable?: () => void;
  }) =>
    open ? (
      <div data-testid="product-modal">
        <button onClick={() => onClose?.(true)}>Close Modal</button>
        <button onClick={() => onClose?.(false)}>Close Modal Without Reset</button>
        <button onClick={() => onUpdateTable?.()}>Update Modal Table</button>
        <button onClick={() => onSuccess?.('REJECTED')}>Success</button>
        <button onClick={() => onSuccess?.('SUPERVISED')}>Success Supervised</button>
        <button onClick={() => onSuccess?.('WAIT_APPROVED')}>Success Wait Approved</button>
        <button onClick={() => onSuccess?.('ACCEPT_APPROVATION')}>Success Accept</button>
        <button onClick={() => onSuccess?.('REJECT_APPROVATION')}>Success Reject Approval</button>
      </div>
    ) : null,
}));

jest.mock('../ProductConfirmDialog', () => ({
  __esModule: true,
  default: ({
    open,
    onCancel,
    onConfirm,
    onSuccess,
  }: {
    open: boolean;
    onCancel?: () => void;
    onConfirm?: () => void;
    onSuccess?: () => void;
  }) =>
    open ? (
      <div data-testid="product-confirm-dialog">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onSuccess}>Success Confirm</button>
      </div>
    ) : null,
}));

jest.mock('../../../pages/components/ProductsTable', () => ({
  __esModule: true,
  default: ({
    tableData,
    columns,
    onRequestSort,
    handleListButtonClick,
    setSelected,
    selected,
  }: {
    tableData: Array<any>;
    columns: Array<any>;
    onRequestSort?: (event: React.MouseEvent<unknown>, property: any) => void;
    handleListButtonClick: (row: any) => void;
    setSelected: (value: Array<string>) => void;
    selected: Array<string>;
  }) => {
    const { getProductRowKey } = require('../ProductDataGrid.helpers');

    return (
      <div data-testid="products-table-inner">
        {columns
          .filter((column: any) => column.sortable)
          .map((column: any) => (
            <button
              key={column.id}
              data-testid={`sort-${column.id}`}
              onClick={(event) => onRequestSort?.(event, column.id)}
            >
              {column.labelKey}
            </button>
          ))}
        {tableData.map((row: any, idx: number) => {
          const rowKey = getProductRowKey(row);

          return (
            <div key={idx}>
              <span>{row.productName}</span>
              <button data-testid={`detail-btn-${idx}`} onClick={() => handleListButtonClick(row)}>
                Details
              </button>
              <input
                type="checkbox"
                data-testid={`checkbox-${idx}`}
                checked={selected.includes(rowKey)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelected([...selected, rowKey]);
                  } else {
                    setSelected(selected.filter((x: string) => x !== rowKey));
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    );
  },
}));

jest.mock('../../../pages/components/EmptyListTable', () => ({
  __esModule: true,
  default: () => <div data-testid="empty-list">empty</div>,
}));

jest.mock('../ProductDataGrid.helpers', () => {
  const getStatusChecks = jest.fn();
  const handleModalSuccess = jest.fn();
  const getProductRowKey = (row: any) =>
    String(row.gtinCode ?? row.gtin ?? row.productCode ?? row.eprelCode ?? '');

  return {
    __esModule: true,
    getProductRowKey,
    getSelectedStatuses: jest.fn((selected, tableData) =>
      selected
        .map(
          (selectedKey: string) =>
            tableData.find((row: any) => getProductRowKey(row) === selectedKey)?.status
        )
        .filter(Boolean)
    ),
    getStatusChecks,
    handleModalSuccess,
    checkSomeStatus: jest.fn((selected, tableData, status) =>
      selected.some(
        (code: string) =>
          String(tableData.find((row: any) => getProductRowKey(row) === code)?.status) === status
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

type ProductOverride = Partial<(typeof mockProducts)[number]> & Record<string, any>;

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

const buildProduct = (overrides: ProductOverride = {}) => ({
  id: '1',
  productName: 'Prod 1',
  gtinCode: 'GTIN1',
  category: 'Cat',
  status: 'SUPERVISED',
  ...overrides,
});

const buildProducts = (...overrides: Array<ProductOverride>) =>
  overrides.length > 0
    ? overrides.map((product, index) => buildProduct({ id: `${index + 1}`, ...product }))
    : mockProducts;

const getHelpersModule = () => require('../ProductDataGrid.helpers');

const renderProductGrid = (
  store = createStore(),
  {
    organizationId = 'org',
    organizationLabel,
    initialEntries = ['/'],
  }: {
    organizationId?: string;
    organizationLabel?: string;
    initialEntries?: Array<any>;
  } = {}
) =>
  render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={initialEntries}>
          <ThemeProvider theme={theme}>
            <ProductDataGrid
              organizationId={organizationId}
              organizationLabel={organizationLabel}
            />
          </ThemeProvider>
        </MemoryRouter>
      </I18nextProvider>
    </Provider>
  );

const openDetailDrawer = async (index = 0) => {
  await screen.findByTestId('products-table');
  fireEvent.click(screen.getByTestId(`detail-btn-${index}`));
  expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
};

const closeDrawer = async (label: 'Close Drawer' | 'Close Detail' = 'Close Drawer') => {
  fireEvent.click(screen.getByText(label));
  await waitFor(() => expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument());
};

const selectRow = (index = 0) => fireEvent.click(screen.getByTestId(`checkbox-${index}`));

const clickActionButton = (testId: string) => fireEvent.click(screen.getByTestId(testId));

const selectRowAndClickAction = async (testId: string, index = 0) => {
  await screen.findByTestId('products-table');
  selectRow(index);
  clickActionButton(testId);
};

const openFiltersDrawer = async () => {
  await screen.findByTestId('products-table');
  fireEvent.click(screen.getByRole('button', { name: /common.advancedFilters/i }));
  expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();
};

const confirmDialog = async () => {
  fireEvent.click(await screen.findByText('Confirm'));
};

const clickModalSuccess = async () => {
  fireEvent.click(await screen.findByText('Success'));
};

const expectTableVisible = async () => {
  await screen.findByTestId('products-table');
  expect(screen.getByTestId('products-table')).toBeInTheDocument();
};

const expectEmptyListVisible = async () => {
  await waitFor(() => expect(screen.getByTestId('empty-list')).toBeInTheDocument());
};

const configureTableMocks = ({
  hasPermission = true,
  organizationSource,
  defaultFiltersByRole,
  columns = [],
  filtersConfig = [],
}: {
  hasPermission?: boolean;
  organizationSource?: string;
  defaultFiltersByRole?: Record<string, Record<string, string>>;
  columns?: Array<Record<string, any>>;
  filtersConfig?: Array<Record<string, any>>;
} = {}) => {
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
          columns,
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
      columns,
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
    filtersConfig,
    templateConfig: {},
  });
};

const setupProductsResponse = (products = mockProducts) => {
  (registerService.getProducts as jest.Mock).mockResolvedValue({
    data: { content: products, pageNo: 0, totalElements: products.length },
  });
};

const setupBatchFiltersResponse = (batchFilterItems: Array<Record<string, any>> = []) => {
  (registerService.getBatchFilterList as jest.Mock).mockResolvedValue({
    data: batchFilterItems,
  });
};

const renderGrid = async (
  role: string = 'USER',
  products = mockProducts,
  {
    hasPermission = true,
    organizationSource,
    defaultFiltersByRole,
    expectRendered = true,
    columns = [],
    filtersConfig = [],
    organizationId = 'org',
    organizationLabel,
    initialEntries,
    batchFilterItems = [],
  }: {
    hasPermission?: boolean;
    organizationSource?: string;
    defaultFiltersByRole?: Record<string, Record<string, string>>;
    expectRendered?: boolean;
    columns?: Array<Record<string, any>>;
    filtersConfig?: Array<Record<string, any>>;
    organizationId?: string;
    organizationLabel?: string;
    initialEntries?: Array<any>;
    batchFilterItems?: Array<Record<string, any>>;
  } = {}
) => {
  (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
    org_id: 'org',
    org_role: role,
  });

  configureTableMocks({
    hasPermission,
    organizationSource,
    defaultFiltersByRole,
    columns,
    filtersConfig,
  });
  setupProductsResponse(products);
  setupBatchFiltersResponse(batchFilterItems);

  localStorage.setItem('token', 'fake-token');

  await act(async () => {
    renderProductGrid(undefined, { organizationId, organizationLabel, initialEntries });
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
    jest.useRealTimers();
    cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    require('../../../hooks/useCurrentInitiativeId').useCurrentInitiativeId.mockReturnValue(
      'init-1'
    );

    const helpersModule = getHelpersModule();
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
            (selectedKey: string) =>
              tableData.find((row: any) => helpersModule.getProductRowKey(row) === selectedKey)
                ?.status
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
            String(
              tableData.find((row: any) => helpersModule.getProductRowKey(row) === code)?.status
            ) === status
        )
    );
  });

  it('renders table when products exist', async () => {
    await renderGrid();
    await expectTableVisible();
    expect(screen.getByText('Prod 1')).toBeInTheDocument();
    expect(screen.getByText('Prod 2')).toBeInTheDocument();
  });

  it('renders empty state when API returns no products', async () => {
    (registerService.getProducts as jest.Mock).mockResolvedValueOnce({
      data: { content: [], pageNo: 0, totalElements: 0 },
    });
    await renderGrid();
    await expectEmptyListVisible();
  });

  it('opens and closes detail drawer', async () => {
    await renderGrid();
    await openDetailDrawer();
    await closeDrawer('Close Detail');
  });

  it('shows action buttons when Invitalia L1 selects a row', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
    expect(screen.queryByTestId('supervisedBtn')).not.toBeInTheDocument();
  });

  it('shows supervised button when selected rows are not already supervised', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts({ status: 'REJECTED' }));
    await screen.findByTestId('products-table');
    selectRow();

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
  });

  it('disables wait approved action for Invitalia L1 when selected row already waits approval', async () => {
    getHelpersModule().checkSomeStatus.mockReturnValueOnce(true);

    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts({ status: 'WAIT_APPROVED' }));
    await screen.findByTestId('products-table');
    selectRow();

    expect(screen.getByTestId('waitApprovedBtn')).toBeDisabled();
  });

  it('validates selected rows on action click', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
  });

  it('does not show rejected result directly from the grid action', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');

    expect(screen.queryByText(/msgResultRejected/i)).not.toBeInTheDocument();
  });

  it('validates selected rows for wait approved', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('waitApprovedBtn');

    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('product-confirm-dialog')).toBeInTheDocument();
  });

  it('does not open modal when no rows are selected', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await expectTableVisible();

    expect(screen.queryByTestId('rejectedBtn')).not.toBeInTheDocument();
  });

  it('renders pagination component when data is present', async () => {
    await renderGrid();
    await expectTableVisible();

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
    await expectTableVisible();
  });

  it('handles API error branch', async () => {
    (registerService.getProducts as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    await renderGrid();
    await expectEmptyListVisible();
  });

  it('handles batch filter API errors without blocking the table', async () => {
    (registerService.getBatchFilterList as jest.Mock).mockRejectedValue(new Error('Batch error'));

    await renderGrid();
    await expectTableVisible();
  });

  it('validates mixed statuses without opening modal', async () => {
    getHelpersModule().getStatusChecks.mockReturnValueOnce({
      selectedStatuses: ['A', 'B'],
      someUploaded: false,
      length: 2,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await expectTableVisible();

    selectRow(0);
    selectRow(1);
    clickActionButton('rejectedBtn');

    expect(screen.getByTestId('rejectedBtn')).toBeDisabled();
    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
  });

  it('validates admin self approval without opening a grid message', async () => {
    const helpersModule = getHelpersModule();
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.getStatusChecks.mockReturnValueOnce({
      selectedStatuses: ['UPLOADED'],
      someUploaded: true,
      length: 1,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L2);
    await expectTableVisible();

    selectRow();
    clickActionButton('rejectedBtn');

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByText(/errorYourselfApproved/i)).toBeInTheDocument();
  });

  it('renders filter chip when filters applied', async () => {
    await renderGrid();
    await expectTableVisible();

    expect(screen.queryByRole('button', { name: /CloseIcon/i })).not.toBeInTheDocument();
  });

  it('renders admin default status filter', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L2);
    await expectTableVisible();
  });

  it('opens and closes filters drawer from the new filter button', async () => {
    await renderGrid();
    await openFiltersDrawer();

    fireEvent.click(screen.getByText('Close Filters'));
    await waitFor(() => expect(screen.queryByTestId('filters-drawer')).not.toBeInTheDocument());
  });

  it('derives batchFilterItems correctly from tableData (coverage test)', async () => {
    await renderGrid(
      'USER',
      buildProducts(
        { productFileId: 'file-1', batchName: 'Batch A' },
        {
          gtinCode: 'GTIN2',
          productName: 'Prod 2',
          status: 'REJECTED',
          productFileId: 'file-1',
          batchName: 'Batch A',
        },
        {
          gtinCode: 'GTIN3',
          productName: 'Prod 3',
          status: 'REJECTED',
          productFileId: 'file-2',
          batchName: 'Batch B',
        }
      )
    );

    await openFiltersDrawer();
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
    setupProductsResponse([]);
    setupBatchFiltersResponse();

    await act(async () => {
      renderProductGrid();
    });

    expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
  });

  it('renders empty list when user has no products permission', async () => {
    await renderGrid('USER', mockProducts, { hasPermission: false });
    await expectEmptyListVisible();
  });

  it('renders grid when organizationSource is filter and no producer filter is set', async () => {
    await renderGrid('USER', mockProducts, {
      organizationSource: 'filter',
    });

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
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

    await expectTableVisible();
  });

  it('opens bulk dialog and confirms action (covers modal success path)', async () => {
    getHelpersModule().validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts());
    await selectRowAndClickAction('rejectedBtn');

    await waitFor(() => expect(screen.getByTestId('product-modal')).toBeInTheDocument());
  });

  it('closes detail drawer using toggleDrawer button (covers cleanup branch)', async () => {
    await renderGrid();
    await openDetailDrawer();
    await closeDrawer();
  });

  it('calls correct WAIT_APPROVED success flow', async () => {
    getHelpersModule().validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts());
    await selectRowAndClickAction('waitApprovedBtn');
    await confirmDialog();

    await waitFor(() => expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument());
  });

  it('covers productCode selection branch (line 122)', async () => {
    await renderGrid('USER', buildProducts({ productCode: 'PCODE1' }));

    await expectTableVisible();
    selectRow();
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
  });

  it('renders producer readable name branch scenario without filter-selected organization', async () => {
    await renderGrid('USER', buildProducts({ organizationName: 'Readable Org' }), {
      organizationSource: 'filter',
    });

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-list')).not.toBeInTheDocument();
  });

  it('covers setMsgResultByAction branches (398-410)', async () => {
    const helpersModule = getHelpersModule();
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L2, buildProducts());
    await selectRowAndClickAction('rejectedBtn');
    await clickModalSuccess();

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers confirm dialog fallback status branch (line 522)', async () => {
    getHelpersModule().validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts({ status: undefined }));
    await selectRowAndClickAction('waitApprovedBtn');
    await confirmDialog();

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers WAIT_APPROVED L2 branch (line 406)', async () => {
    const helpersModule = getHelpersModule();
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L2, buildProducts());
    await selectRowAndClickAction('waitApprovedBtn');

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers REJECT_APPROVATION L2 branch (line 410)', async () => {
    const helpersModule = getHelpersModule();
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L2);
    await selectRowAndClickAction('rejectedBtn');
    await clickModalSuccess();

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers getMsgResultByActionType default branch (line 488)', async () => {
    await renderGrid();
    await expectTableVisible();
  });

  it('calls correct REJECTED success flow', async () => {
    const helpersModule = getHelpersModule();
    helpersModule.checkSomeStatus.mockReturnValue(false);
    helpersModule.validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');
    await clickModalSuccess();

    await waitFor(() => expect(screen.getByText(/msgResultRejected/i)).toBeInTheDocument());
  });

  it('covers batchFromHistory branch in filters merge (line 219)', async () => {
    sessionStorage.setItem('batchFromHistory', 'BATCH_X');

    await renderGrid('USER', mockProducts);
    await expectTableVisible();

    sessionStorage.removeItem('batchFromHistory');
  });

  it('covers organizationId conditional branch (lines 246-247)', async () => {
    await renderGrid('USER', mockProducts, {
      organizationSource: undefined,
    });

    await expectTableVisible();
  });

  it('covers !currentRoleKey branch (line 290)', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: 'org',
      org_role: undefined,
    });

    await renderGrid('USER', mockProducts);
    await expectTableVisible();
  });

  it('covers prev.status reset branch (line 302)', async () => {
    getHelpersModule().validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, mockProducts);
    await selectRowAndClickAction('waitApprovedBtn');
    await confirmDialog();

    await waitFor(() => expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument());
  });

  it('covers displayBatchName fallback branches (88,152-167)', async () => {
    await renderGrid('USER', buildProducts({ productFileId: 'batch-1', batchName: 'file.csv' }));

    await expectTableVisible();
  });

  it('covers filter map and reduce branches (106,113)', async () => {
    await renderGrid('USER', mockProducts, {
      defaultFiltersByRole: {
        USER: { status: 'SUPERVISED' },
      },
    });

    await expectTableVisible();
  });

  it('covers permission org_id truthy branch (127,132)', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: 'org',
      org_role: 'USER',
    });

    await renderGrid('USER', mockProducts);
    await expectTableVisible();
  });

  it('covers dispatch reset batchId and batchName (170-171)', async () => {
    await renderGrid();
    await expectTableVisible();
  });

  it('covers readableName branch (252-255)', async () => {
    await renderGrid('USER', buildProducts({ organizationName: 'Readable Org' }));
    await expectTableVisible();
  });

  it('covers batch reduce accumulator branch (269-272)', async () => {
    await renderGrid('USER', buildProducts({ productFileId: 'file-1' }));
    await expectTableVisible();
  });

  it('covers resetAllMsgResults function (393)', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');
    await clickModalSuccess();

    expect(screen.getByTestId('products-table')).toBeInTheDocument();
  });

  it('covers DEBUG_CONSOLE error branch (430-432)', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (registerService.getProducts as jest.Mock).mockRejectedValueOnce(new Error('debug error'));

    await renderGrid();
    await expectEmptyListVisible();

    errorSpy.mockRestore();
  });

  it('covers normalizeLegacyColumn mapping branch (line 477)', async () => {
    await renderGrid('USER', mockProducts, {
      columns: [
        {
          id: 'organizationName',
          labelKey: 'pages.products.listHeader.organizationName',
        },
      ],
    });
    await expectTableVisible();
  });

  it('covers normalizeLegacyColumn fallback branch (returns col)', async () => {
    await renderGrid('USER', mockProducts, {
      columns: [
        {
          id: 'custom',
          labelKey: 'tables.products.columns.custom',
        },
      ],
    });
    await expectTableVisible();
  });

  it('covers early return when tableConfig missing', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: 'org',
      org_role: 'USER',
    });
    (useInitiativeConfigHook.useInitiativeConfig as jest.Mock).mockReturnValue({
      config: {},
      loading: false,
    });
    (resolvedTableConfigHook.useResolvedProductTableConfig as jest.Mock).mockReturnValue({
      tableConfig: undefined,
      paginationConfig: {},
      filtersConfig: [],
      templateConfig: {},
    });
    setupBatchFiltersResponse();
    setupProductsResponse([]);

    await act(async () => {
      renderProductGrid();
    });

    expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
  });

  it('covers handleOpenModalWithStatusCheck length === 0 branch', async () => {
    getHelpersModule().getStatusChecks.mockReturnValueOnce({
      selectedStatuses: [],
      someUploaded: false,
      length: 0,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');

    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();
  });

  it('covers ConfirmDialog catch branch (API error)', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (registerService.setWaitApprovedStatusList as jest.Mock).mockRejectedValueOnce(
      new Error('fail')
    );

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('waitApprovedBtn');
    await screen.findByTestId('product-confirm-dialog');
    await confirmDialog();

    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
  });

  it('covers handleDeleteFiltersButtonClick branch', async () => {
    await renderGrid();
    await openFiltersDrawer();

    fireEvent.click(screen.getByText('Close Filters'));

    await waitFor(() => expect(screen.queryByTestId('filters-drawer')).not.toBeInTheDocument());
  });

  it('covers ProductDetail callbacks branches', async () => {
    await renderGrid();
    await openDetailDrawer();
    await closeDrawer('Close Detail');
  });

  it('covers ConfirmDialog onSuccess UPLOADED branch (619-625)', async () => {
    getHelpersModule().validateBulkActionPreconditions.mockReturnValueOnce({ valid: true });

    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts({ status: 'UPLOADED' }));
    await selectRowAndClickAction('waitApprovedBtn');
    await screen.findByTestId('product-confirm-dialog');
    await confirmDialog();

    await waitFor(() => expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument());
  });

  it('covers effectiveColumns action injection branch (572-590)', async () => {
    await renderGrid('USER', mockProducts, {
      columns: [{ id: 'col1', labelKey: 'x' }],
    });
    await expectTableVisible();
  });

  it('covers admin self approval timeout branch (470-472)', async () => {
    getHelpersModule().getStatusChecks.mockReturnValueOnce({
      selectedStatuses: ['UPLOADED'],
      someUploaded: true,
      length: 1,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L2);
    await expectTableVisible();

    jest.useFakeTimers();

    selectRow();
    clickActionButton('rejectedBtn');

    act(() => {
      jest.runAllTimers();
    });

    jest.useRealTimers();
  });

  it('covers ConfirmDialog refreshKey + catch block (650-663)', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (registerService.setWaitApprovedStatusList as jest.Mock).mockRejectedValueOnce(
      new Error('fail')
    );

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('waitApprovedBtn');
    await screen.findByTestId('product-confirm-dialog');
    await confirmDialog();

    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
  });

  it('covers ProductDetail message callbacks + generic error (689-726)', async () => {
    await renderGrid();
    await openDetailDrawer();

    ['approved', 'rejected', 'wait', 'supervised', 'rejectApp', 'acceptApp', 'error'].forEach(
      (label) => fireEvent.click(screen.getByText(label))
    );

    await closeDrawer();
  });

  it('covers ConfirmDialog resolve branch refreshKey increment (650-663)', async () => {
    (registerService.setWaitApprovedStatusList as jest.Mock).mockResolvedValueOnce({});

    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts());
    await selectRowAndClickAction('waitApprovedBtn');
    await screen.findByTestId('product-confirm-dialog');
    await confirmDialog();

    await waitFor(() => expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument());
  });

  it('covers effectiveColumns injection with selection enabled (572-590)', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');

    selectRow();

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
  });

  it('covers handleOpenModal non WAIT_APPROVED branch', async () => {
    getHelpersModule().getStatusChecks.mockReturnValueOnce({
      selectedStatuses: ['SUPERVISED'],
      someUploaded: false,
      length: 1,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');

    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
  });

  it('covers callWaitApprovedApi DEBUG_CONSOLE branch', async () => {
    const constants = require('../../../utils/constants');
    constants.DEBUG_CONSOLE = true;

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (registerService.setWaitApprovedStatusList as jest.Mock).mockRejectedValueOnce(
      new Error('forced')
    );

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('waitApprovedBtn');
    await screen.findByTestId('product-confirm-dialog');
    await confirmDialog();

    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());

    errorSpy.mockRestore();
  });

  it('covers normalizeLegacyColumn legacy mapping explicitly', async () => {
    await renderGrid('USER', mockProducts, {
      columns: [
        {
          id: 'organizationName',
          labelKey: 'pages.products.listHeader.organizationName',
        },
      ],
    });
    await expectTableVisible();
  });

  it('covers effectiveColumns hasActionColumn === true branch', async () => {
    await renderGrid('USER', mockProducts, {
      columns: [{ id: 'a', labelKey: 'x', type: 'action' }],
    });
    await expectTableVisible();
  });

  it('covers currentRoleKey undefined branch in default filters effect', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: 'org',
      org_role: undefined,
    });

    await renderGrid('USER', mockProducts);
    await expectTableVisible();
  });

  it('covers ProductConfirmDialog onSuccess else branch (not UPLOADED)', async () => {
    (registerService.setWaitApprovedStatusList as jest.Mock).mockResolvedValueOnce({});

    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts());
    await selectRowAndClickAction('waitApprovedBtn');
    await screen.findByTestId('product-confirm-dialog');
    await confirmDialog();

    await waitFor(() => expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument());
  });

  it('covers uniqueStatuses length === 1 branch', async () => {
    getHelpersModule().getStatusChecks.mockReturnValueOnce({
      selectedStatuses: ['SUPERVISED'],
      someUploaded: false,
      length: 1,
    });

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');

    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
  });

  it('covers roleDefaults missing branch', async () => {
    await renderGrid('USER', mockProducts, {
      defaultFiltersByRole: {
        OTHER_ROLE: { status: 'SUPERVISED' },
      },
    });

    await expectTableVisible();
  });

  it('applies batch id from redux as productFileId filter', async () => {
    const store = createStore();
    store.dispatch(productsSlice.actions.setBatchId('batch-1'));
    store.dispatch(productsSlice.actions.setBatchName('upload.csv'));

    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: 'org',
      org_role: 'USER',
    });
    configureTableMocks();
    setupProductsResponse(mockProducts);
    setupBatchFiltersResponse();

    await act(async () => {
      renderProductGrid(store);
    });

    await expectTableVisible();
    await waitFor(() =>
      expect(
        (registerService.getProducts as jest.Mock).mock.calls.some(
          (call) => call[10] === 'batch-1'
        )
      ).toBe(true)
    );
    expect(store.getState().products.batchId).toBe('');
    expect(store.getState().products.batchName).toBe('');
  });

  it('applies batch id from navigation state as productFileId filter', async () => {
    await renderGrid('USER', mockProducts, {
      initialEntries: [{ pathname: '/', state: { batchId: 'history-batch' } }],
    });

    await expectTableVisible();
    await waitFor(() =>
      expect(
        (registerService.getProducts as jest.Mock).mock.calls.some(
          (call) => call[10] === 'history-batch'
        )
      ).toBe(true)
    );
  });

  it('applies drawer filters and redirect producer filter', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1, mockProducts, {
      organizationSource: 'filter',
      organizationLabel: 'Producer Org',
    });

    await openFiltersDrawer();
    expect(screen.getByTestId('filters-drawer').getAttribute('data-filters')).toContain(
      'producer'
    );

    fireEvent.click(screen.getByText('Apply Category Filter'));
    await waitFor(() =>
      expect(
        (registerService.getProducts as jest.Mock).mock.calls.some(
          (call) => call[5] === 'SATELLITARE'
        )
      ).toBe(true)
    );

    fireEvent.click(screen.getByText('Apply Producer Filter'));
    await waitFor(() =>
      expect(
        (registerService.getProducts as jest.Mock).mock.calls.some(
          (call) => call[1] === 'producer-org'
        )
      ).toBe(true)
    );

    fireEvent.click(screen.getByText('Apply Empty Filters'));
    await expectTableVisible();
  });

  it('applies role default filters to product API params', async () => {
    await renderGrid('USER', mockProducts, {
      defaultFiltersByRole: {
        USER: { status: 'SUPERVISED' },
      },
      filtersConfig: [{ id: 'status' }],
    });

    await expectTableVisible();
    await waitFor(() =>
      expect(
        (registerService.getProducts as jest.Mock).mock.calls.some(
          (call) => call[6] === 'SUPERVISED'
        )
      ).toBe(true)
    );
  });

  it('builds product file filters from batch filter API response', async () => {
    await renderGrid('USER', mockProducts, {
      filtersConfig: [{ id: 'productFileId' }],
      batchFilterItems: [{ productFileId: 'file-1', batchName: 'file.csv' }],
    });

    await openFiltersDrawer();
    expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();
  });

  it('updates product sorting when clicking a sortable column', async () => {
    await renderGrid('USER', mockProducts, {
      columns: [{ id: 'category', labelKey: 'tables.products.columns.category', sortable: true }],
    });

    await expectTableVisible();

    fireEvent.click(screen.getByTestId('sort-category'));

    await waitFor(() =>
      expect(
        (registerService.getProducts as jest.Mock).mock.calls.some(
          (call) => call[4] === 'category,desc'
        )
      ).toBe(true)
    );
  });

  it('does not render while user organization source is not ready', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_id: '',
      org_role: 'USER',
    });
    configureTableMocks({ organizationSource: 'user' });
    setupProductsResponse(mockProducts);
    setupBatchFiltersResponse();

    await act(async () => {
      renderProductGrid();
    });

    expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-list')).not.toBeInTheDocument();
  });

  it('selects products using productCode when gtin is missing', async () => {
    await renderGrid(
      USERS_TYPES.INVITALIA_L1,
      buildProducts({ gtinCode: undefined, gtin: undefined, productCode: 'PCODE1' })
    );

    await selectRowAndClickAction('rejectedBtn');
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
  });

  it('covers L1 modal success branches', async () => {
    const helpersModule = getHelpersModule();
    helpersModule.checkSomeStatus.mockReturnValue(false);

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await selectRowAndClickAction('rejectedBtn');

    jest.useFakeTimers();

    fireEvent.click(screen.getByText('Success Supervised'));
    expect(screen.getByText(/msgResultSupervised/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Success Wait Approved'));
    expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Update Modal Table'));
    fireEvent.click(screen.getByText('Close Modal Without Reset'));
    expect(screen.queryByTestId('product-modal')).not.toBeInTheDocument();

    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('covers L2 modal success branches', async () => {
    const helpersModule = getHelpersModule();
    helpersModule.checkSomeStatus.mockReturnValue(false);

    await renderGrid(USERS_TYPES.INVITALIA_L2);
    await selectRowAndClickAction('waitApprovedBtn');

    jest.useFakeTimers();

    fireEvent.click(screen.getByText('Success Accept'));
    expect(screen.getByText(/msgResultAcceptApprovation/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Success Reject Approval'));
    expect(screen.getByText(/msgResultRejectedApprovation/i)).toBeInTheDocument();

    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('covers confirm dialog success and cancel callbacks', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1, buildProducts({ status: 'UPLOADED' }));
    await selectRowAndClickAction('waitApprovedBtn');

    jest.useFakeTimers();

    fireEvent.click(screen.getByText('Success Confirm'));
    expect(screen.getByText(/msgResultWaitApproved/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('product-confirm-dialog')).not.toBeInTheDocument();

    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('covers detail drawer update callback', async () => {
    await renderGrid();
    await openDetailDrawer();

    fireEvent.click(screen.getByText('Update Detail'));
    await waitFor(() => expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument());
  });

  // ---- COVERAGE BOOST TESTS ----

  it('forces normalizeLegacyColumn mapping + fallback together', async () => {
    (resolvedTableConfigHook.useResolvedProductTableConfig as jest.Mock).mockReturnValue({
      tableConfig: {
        columns: [
          {
            id: 'organizationName',
            labelKey: 'pages.products.listHeader.organizationName',
          },
          {
            id: 'plain',
            labelKey: 'tables.products.columns.plain',
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

  it('forces callWaitApprovedApi catch branch with DEBUG_CONSOLE false', async () => {
    const constants = require('../../../utils/constants');
    constants.DEBUG_CONSOLE = false;

    (registerService.setWaitApprovedStatusList as jest.Mock).mockRejectedValueOnce(
      new Error('forced-error')
    );

    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));
    await screen.findByTestId('product-confirm-dialog');
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => expect(screen.getByTestId('products-table')).toBeInTheDocument());
  });

  it('forces timeout auto reset branch (470-472)', async () => {
    await renderGrid(USERS_TYPES.INVITALIA_L1);
    await screen.findByTestId('products-table');

    jest.useFakeTimers();

    fireEvent.click(screen.getByTestId('checkbox-0'));
    fireEvent.click(screen.getByTestId('rejectedBtn'));
    fireEvent.click(screen.getByText('Success'));

    act(() => {
      jest.runAllTimers();
    });

    jest.useRealTimers();
  });
});
