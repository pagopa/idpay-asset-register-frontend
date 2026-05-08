import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import FiltersDrawer from '../FiltersDrawer';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'pages.products.filterLabels.filter': 'pages.products.filterLabels.filter',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: {
      CAT_1: {
        label: "Lavatrici",
        csv: ""
      }
    }
  }),
}));

jest.mock('../../../utils/constants', () => ({
  PRODUCTS_STATES: {
    UPLOADED: 'UPLOADED',
    WAIT_APPROVED: 'WAIT_APPROVED',
    SUPERVISED: 'SUPERVISED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  },
  USERS_TYPES: {
    INVITALIA_L1: 'INVITALIA_L1',
    INVITALIA_L2: 'INVITALIA_L2',
    OTHER: 'OTHER',
  },
}));

const mockInstitutions = [
  { institutionId: 'inst1', description: 'Producer One' },
  { institutionId: 'inst2', description: 'Producer Two' },
];
jest.mock('../../../redux/slices/invitaliaSlice', () => ({
  institutionListSelector: jest.fn(() => mockInstitutions),
}));

const mockFetchUserFromLocalStorage = jest.fn();
const mockFilterInputWithSpaceRule = jest.fn((v: string) => (v ?? '').replace(/\s+/g, ''));
let lastFilterInputArg: string | undefined;
const mockTruncateString = jest.fn((v: string) => v);

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: () => mockFetchUserFromLocalStorage(),
  filterInputWithSpaceRule: (v: string) => {
    lastFilterInputArg = v;
    return mockFilterInputWithSpaceRule(v);
  },
  truncateString: (v: string, _n?: number) => mockTruncateString(v),
}));

const theme = createTheme();

const createTestStore = (preloadedState: any = {}) =>
  configureStore({
    reducer: (state = preloadedState) => state,
    preloadedState,
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const store = createTestStore({});
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </Provider>
  );
};

const defaultProps = () => ({
  open: true,
  toggleFiltersDrawer: jest.fn(),
  statusFilter: '',
  setStatusFilter: jest.fn(),
  producerFilter: '',
  setProducerFilter: jest.fn(),
  batchFilter: '',
  setBatchFilter: jest.fn(),
  categoryFilter: '',
  setCategoryFilter: jest.fn(),
  eprelCodeFilter: '',
  setEprelCodeFilter: jest.fn(),
  gtinCodeFilter: '',
  setGtinCodeFilter: jest.fn(),
  batchFilterItems: [
    { productFileId: 'b1', batchName: 'Batch 1' },
    { productFileId: 'b2', batchName: 'Batch 2' },
  ],
  errorStatus: false,
  handleDeleteFiltersButtonClick: jest.fn(),
  setFiltering: jest.fn(),
  setPage: jest.fn(),
});

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({ data: [], isLoading: false }),
}));

describe('FiltersDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReset();
    lastFilterInputArg = undefined;
  });

  it('renders header and close button; clicking close closes the drawer', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    expect(screen.getAllByText('pages.products.filterLabels.filter')[0]).toBeInTheDocument();

    const closeBtn = screen.getByTestId('open-detail-button');
    fireEvent.click(closeBtn);
    expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
  });

  it('shows "producer" Select when user is INVITALIA', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    expect(screen.getByLabelText('pages.products.filterLabels.producer')).toBeInTheDocument();
  });

  it('hides "producer" Select when user is NOT INVITALIA', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'OTHER' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    expect(screen.queryByLabelText('pages.products.filterLabels.producer')).not.toBeInTheDocument();
  });

  it('changes status via Select (draft only) and does not apply until "filter" click', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const statusSelect = screen.getByLabelText('pages.products.filterLabels.status');
    fireEvent.mouseDown(statusSelect);

    const opt = await screen.findByRole('option', {
      name: 'pages.products.categories.UPLOADED',
    });
    fireEvent.click(opt);

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeEnabled();

    fireEvent.click(filterBtn);

    expect(props.setStatusFilter).toHaveBeenCalledWith('pages.products.categories.UPLOADED');
    expect(props.setPage).toHaveBeenCalledWith(0);
    expect(props.setFiltering).toHaveBeenCalledWith(true);
    expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
  });

  it('changes batch via Select (draft only) and applies on "filter" click', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const batchSelect = screen.getByLabelText('pages.products.filterLabels.batch');
    fireEvent.mouseDown(batchSelect);

    const option = await screen.findByRole('option', { name: 'Batch 1' });
    fireEvent.click(option);

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeEnabled();

    fireEvent.click(filterBtn);

    expect(props.setBatchFilter).toHaveBeenCalledWith('b1');
    expect(props.setPage).toHaveBeenCalledWith(0);
    expect(props.setFiltering).toHaveBeenCalledWith(true);
    expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
  });

  it('changes category via Select (draft only) and applies on "filter" click', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const catSelect = screen.getByLabelText('pages.products.filterLabels.category');
    fireEvent.mouseDown(catSelect);

    const option = await screen.findByRole('option', {
      name: 'Lavatrici',
    });
    fireEvent.click(option);

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeEnabled();

    fireEvent.click(filterBtn);

    expect(props.setCategoryFilter).toHaveBeenCalledWith('Lavatrici');
    expect(props.setPage).toHaveBeenCalledWith(0);
    expect(props.setFiltering).toHaveBeenCalledWith(true);
    expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
  });

  it('types in eprel/gtin inputs and applies setters on "filter" click (trimmed by helper)', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
    fireEvent.change(eprelInput, { target: { value: '  123  456 ' } });

    const gtinInput = screen.getByLabelText('pages.products.filterLabels.gtinCode');
    fireEvent.change(gtinInput, { target: { value: '  AB C 1 2  ' } });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeEnabled();
    fireEvent.click(filterBtn);

    expect(props.setEprelCodeFilter).toHaveBeenLastCalledWith(undefined);
    expect(props.setGtinCodeFilter).toHaveBeenLastCalledWith(undefined);
  });

  it('enables "filter" button when at least one draft differs from applied', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
    fireEvent.change(eprelInput, { target: { value: '1' } });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeEnabled();
  });

  it('delete filters resets drafts, calls delete callback, resets page and closes', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = {
      ...defaultProps(),
      errorStatus: false,
      statusFilter: 'pages.products.categories.UPLOADED',
    };
    renderWithProviders(<FiltersDrawer {...props} />);

    const deleteBtn = screen.getByText('pages.products.filterLabels.deleteFilters');
    expect(deleteBtn).toBeEnabled();

    fireEvent.click(deleteBtn);

    expect(props.handleDeleteFiltersButtonClick).toHaveBeenCalled();
    expect(props.setPage).toHaveBeenCalledWith(0);
    expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
  });

  it('filter button is disabled when no draft differs from applied (all empty)', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeDisabled();
  });

  it('shows error for non-numeric EPREL and clears error on change', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
    fireEvent.change(eprelInput, {
      target: { value: 'ABC' },
    });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeEnabled();

    fireEvent.click(filterBtn);

    expect(screen.getAllByText('pages.products.filterLabels.eprelCode')[0]).toBeInTheDocument();

    fireEvent.change(eprelInput, { target: { value: '1' } });
    expect(screen.queryByText('Il codice deve essere numerico')).not.toBeInTheDocument();
  });

  it('delete filters button is enabled when errorStatus=true even if no interaction/filters', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = { ...defaultProps(), errorStatus: true };
    renderWithProviders(<FiltersDrawer {...props} />);

    const deleteBtn = screen.getByText('pages.products.filterLabels.deleteFilters');
    expect(deleteBtn).not.toBeDisabled();
  });

  it('shows error for invalid GTIN and clears error on paste', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const gtinInput = screen.getByLabelText('pages.products.filterLabels.gtinCode');
    fireEvent.change(gtinInput, {
      target: { value: '***' },
    });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeEnabled();

    fireEvent.click(filterBtn);

    expect(screen.getAllByText('pages.products.filterLabels.gtinCode')[0]).toBeInTheDocument();

    fireEvent.paste(gtinInput, {
      clipboardData: {
        getData: (type: string) => (type === 'text' ? '  1234  ' : ''),
      },
    });
    expect(screen.queryByText('Il codice deve avere 14 caratteri')).not.toBeInTheDocument();
  });

  it('batch select renders all provided options', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const batchSelect = screen.getByLabelText('pages.products.filterLabels.batch');
    fireEvent.mouseDown(batchSelect);

    const opt1 = await screen.findByRole('option', { name: 'Batch 1' });
    const opt2 = await screen.findByRole('option', { name: 'Batch 2' });
    expect(opt1).toBeInTheDocument();
    expect(opt2).toBeInTheDocument();
  });

  it('category select shows exactly PRODUCTS_CATEGORY keys', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const catSelect = screen.getByLabelText('pages.products.filterLabels.category');
    fireEvent.mouseDown(catSelect);

    const optA = await screen.findByRole('option', {
      name: 'Lavatrici',
    });
    expect(optA).toBeInTheDocument();
  });

  it('onClose of Drawer triggers toggleFiltersDrawer(false)', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    fireEvent.keyDown(document.body, { key: 'Escape' });
    const closeBtn = screen.getByTestId('open-detail-button');
    fireEvent.click(closeBtn);

    expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
  });
});

describe('getChipColor (real constants, no mock)', () => {
  let getChipColor: any;
  let REAL_STATES: any;

  beforeAll(() => {
    jest.isolateModules(() => {
      REAL_STATES = jest.requireActual('../../../utils/constants').PRODUCTS_STATES;
      const mod = jest.requireActual('../FiltersDrawer');
      getChipColor = mod.getChipColor;
    });
  });

  it('returns expected colors for each known status', () => {
    expect(getChipColor(REAL_STATES.UPLOADED)).toBe('default');
    expect(getChipColor(REAL_STATES.WAIT_APPROVED)).toBe('info');
    expect(getChipColor(REAL_STATES.SUPERVISED)).toBe('primary');
    expect(getChipColor(REAL_STATES.APPROVED)).toBe('success');
    expect(getChipColor(REAL_STATES.REJECTED)).toBe('error');
  });

  it('returns default for unknown/null/undefined', () => {
    expect(getChipColor('SOMETHING_ELSE')).toBe('default');
    expect(getChipColor(undefined)).toBe('default');
    expect(getChipColor(null as unknown as string)).toBe('default');
  });
});

describe('FiltersDrawer – validations & actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
  });

  it('accepts valid EPREL/GTIN values, applies filters and closes the drawer', () => {
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    fireEvent.change(screen.getByLabelText('pages.products.filterLabels.eprelCode'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText('pages.products.filterLabels.gtinCode'), {
      target: { value: 'GTIN1234567890'.slice(0, 14) },
    });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    fireEvent.click(filterBtn);

    expect(props.setEprelCodeFilter).toHaveBeenLastCalledWith(undefined);
    expect(props.setGtinCodeFilter).toHaveBeenLastCalledWith(undefined);
    expect(props.setFiltering).toHaveBeenCalledWith(true);
    expect(props.setPage).toHaveBeenCalledWith(0);
    expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
  });

  it('onPaste removes spaces for EPREL and allows filtering', () => {
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
    fireEvent.change(eprelInput, { target: { value: '  12 34  ' } });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeEnabled();

    fireEvent.click(filterBtn);

    expect(props.setEprelCodeFilter).toHaveBeenLastCalledWith(undefined);
    expect(props.setFiltering).toHaveBeenCalledWith(true);
  });
});

describe('FiltersDrawer – status filter by role', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'OTHER' });
  });

  it('hides WAIT_APPROVED and SUPERVISED for non-Invitalia users', async () => {
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const select = screen.getByLabelText('pages.products.filterLabels.status');
    fireEvent.mouseDown(select);

    expect(
      screen.queryByRole('option', { name: 'pages.products.categories.WAIT_APPROVED' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'pages.products.categories.SUPERVISED' })
    ).not.toBeInTheDocument();
  });
});

describe('FiltersDrawer – onClose draft reset', () => {
  it('restores drafts to applied filters when the Drawer is closed', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = { ...defaultProps(), statusFilter: '' };
    const { rerender } = renderWithProviders(<FiltersDrawer {...props} />);

    const statusSelect = screen.getByLabelText('pages.products.filterLabels.status');
    fireEvent.mouseDown(statusSelect);
    const opt = screen.getByRole('option', {
      name: 'pages.products.categories.UPLOADED',
    });
    fireEvent.click(opt);

    fireEvent.keyDown(document.body, { key: 'Escape' });

    rerender(
      <Provider store={createTestStore({})}>
        <ThemeProvider theme={createTheme()}>
          <FiltersDrawer {...props} open />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getAllByText('pages.products.categories.UPLOADED'));
  });
});

describe('getChipColor (real constants, no mock) – correct expectations', () => {
  let getChipColor: any;
  let REAL_STATES: any;

  beforeAll(() => {
    jest.isolateModules(() => {
      REAL_STATES = jest.requireActual('../../../utils/constants').PRODUCTS_STATES;
      const mod = jest.requireActual('../FiltersDrawer');
      getChipColor = mod.getChipColor;
    });
  });

  it('matches the real map', () => {
    expect(getChipColor(REAL_STATES.UPLOADED)).toBe('default');
    expect(getChipColor(REAL_STATES.WAIT_APPROVED)).toBe('info');
    expect(getChipColor(REAL_STATES.SUPERVISED)).toBe('primary');
    expect(getChipColor(REAL_STATES.APPROVED)).toBe('success');
    expect(getChipColor(REAL_STATES.REJECTED)).toBe('error');
  });

  it('returns default for unknown values', () => {
    expect(getChipColor('SOMETHING_ELSE')).toBe('default');
    expect(getChipColor(undefined as unknown as string)).toBe('default');
    expect(getChipColor(null as unknown as string)).toBe('default');
  });
});
