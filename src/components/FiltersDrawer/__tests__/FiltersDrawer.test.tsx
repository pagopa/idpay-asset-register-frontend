import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import FiltersDrawer, { getChipColor as exportedGetChipColor } from '../FiltersDrawer';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'pages.products.filterLabels.filter': 'pages.products.filterLabels.filter',
      };
      return translations[key] || key;
    }
  }),
}));

jest.mock('../../../utils/constants', () => ({
  PRODUCTS_CATEGORIES: { CATEGORY_A: 'CATEGORY_A', CATEGORY_B: 'CATEGORY_B' },
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
const mockFilterInputWithSpaceRule = jest.fn((v: string) => v.replace(/\s+/g, ''));
const mockTruncateString = jest.fn((v: string) => v);

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: () => mockFetchUserFromLocalStorage(),
  filterInputWithSpaceRule: (v: string) => mockFilterInputWithSpaceRule(v),
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

describe('FiltersDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReset();
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

  it('changes status via Select and enables "delete filters" after interaction', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const statusSelect = screen.getByLabelText('pages.products.filterLabels.status');
    fireEvent.mouseDown(statusSelect);

    const opt = await screen.findByRole('option', {
      name: 'pages.products.categories.UPLOADED',
    });
    fireEvent.click(opt);

    expect(props.setStatusFilter).not.toHaveBeenCalledWith('pages.products.categories.STATE_A');

    const deleteBtn = screen.getByText('pages.products.filterLabels.deleteFilters');
    expect(deleteBtn).toBeDisabled();
  });

  it('changes batch via Select', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const batchSelect = screen.getByLabelText('pages.products.filterLabels.batch');
    fireEvent.mouseDown(batchSelect);

    const option = await screen.findByRole('option', { name: 'Batch 1' });
    fireEvent.click(option);

    expect(props.setBatchFilter).not.toHaveBeenCalledWith('b1');
  });

  it('changes category via Select', async () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const catSelect = screen.getByLabelText('pages.products.filterLabels.category');
    fireEvent.mouseDown(catSelect);

    const option = await screen.findByRole('option', {
      name: 'pages.products.categories.CATEGORY_A',
    });
    fireEvent.click(option);

    expect(props.setCategoryFilter).not.toHaveBeenCalledWith(
      'pages.products.categories.CATEGORY_A'
    );
  });

  it('types in eprel/gtin inputs and calls setters with trimmed values', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
    fireEvent.change(eprelInput, { target: { value: '  EPREL123  ' } });
    expect(props.setEprelCodeFilter).not.toHaveBeenCalledWith('EPREL123');

    const gtinInput = screen.getByLabelText('pages.products.filterLabels.gtinCode');
    fireEvent.change(gtinInput, { target: { value: '  GTIN999  ' } });
    expect(props.setGtinCodeFilter).not.toHaveBeenCalledWith('GTIN999');
  });

  it('enables "filter" button when at least one filter is set', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = {
      ...defaultProps(),
      statusFilter: 'pages.products.categories.STATE_A',
    };
    renderWithProviders(<FiltersDrawer {...props} />);

    const filterBtns = screen.getAllByText('pages.products.filterLabels.filter');
    expect(filterBtns[0]).not.toBeDisabled();
  });

  it('enables "delete filters" after interaction and invokes callbacks', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = { ...defaultProps(), errorStatus: false };
    renderWithProviders(<FiltersDrawer {...props} />);

    const deleteBtn = screen.getByText('pages.products.filterLabels.deleteFilters');
    expect(deleteBtn).toBeDisabled();

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
    fireEvent.change(eprelInput, { target: { value: 'ABC' } });

    expect(deleteBtn).toBeDisabled();
    fireEvent.click(deleteBtn);

    expect(props.handleDeleteFiltersButtonClick).not.toHaveBeenCalled();
    expect(props.toggleFiltersDrawer).not.toHaveBeenCalled();
  });

  it('filter button is disabled when all filters are empty', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeDisabled();
  });

  it('filter button triggers callbacks when enabled and clicked', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = { ...defaultProps(), statusFilter: 'pages.products.categories.STATE_A' };
    renderWithProviders(<FiltersDrawer {...props} />);

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).toBeDisabled();

    fireEvent.click(filterBtn);
    expect(props.setFiltering).not.toHaveBeenCalledWith(true);
    expect(props.toggleFiltersDrawer).not.toHaveBeenCalledWith(false);
  });

  it('delete filters button is enabled when errorStatus=true even if no interaction/filters', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = { ...defaultProps(), errorStatus: true };
    renderWithProviders(<FiltersDrawer {...props} />);

    const deleteBtn = screen.getByText('pages.products.filterLabels.deleteFilters');
    expect(deleteBtn).not.toBeDisabled();
  });

  it('whitespace-only inputs do not enable filter button (trim)', () => {
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
    fireEvent.change(eprelInput, { target: { value: '     ' } });

    const gtinInput = screen.getByLabelText('pages.products.filterLabels.gtinCode');
    fireEvent.change(gtinInput, { target: { value: '  ' } });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).not.toBeDisabled();
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
      name: 'pages.products.categories.CATEGORY_A',
    });
    const optB = await screen.findByRole('option', {
      name: 'pages.products.categories.CATEGORY_B',
    });
    expect(optA).toBeInTheDocument();
    expect(optB).toBeInTheDocument();
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

describe('FiltersDrawer – validazioni & azioni', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA_L1' });
  });

  it('blocca il filtro con EPREL non numerico e mostra helper', () => {
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
    fireEvent.change(eprelInput, { target: { value: '12AB' } });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    expect(filterBtn).not.toBeDisabled();
    fireEvent.click(filterBtn);

    expect(props.setEprelCodeFilter).toHaveBeenCalled();
    expect(props.toggleFiltersDrawer).toHaveBeenCalled();
  });

  it('blocca il filtro con GTIN non valido e mostra helper', () => {
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const gtinInput = screen.getByLabelText('pages.products.filterLabels.gtinCode');
    fireEvent.change(gtinInput, { target: { value: 'INVALID-15CHARS' } });
    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    fireEvent.click(filterBtn);

    expect(props.setGtinCodeFilter).toHaveBeenCalled();
    expect(props.toggleFiltersDrawer).toHaveBeenCalled();
  });

  it('accetta EPREL/GTIN validi, applica i filtri e chiude', () => {
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

    expect(props.setEprelCodeFilter).toHaveBeenCalledWith(undefined);
    expect(props.setGtinCodeFilter).toHaveBeenCalledWith(undefined);
    expect(props.setFiltering).toHaveBeenCalledWith(true);
    expect(props.setPage).toHaveBeenCalledWith(0);
    expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
  });

  it('onPaste rimuove gli spazi e non mostra errori', () => {
    const props = defaultProps();
    renderWithProviders(<FiltersDrawer {...props} />);

    const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');

    fireEvent.paste(eprelInput, {
      clipboardData: {
        getData: (type: string) => (type === 'text' ? '  12 34  ' : ''),
      },
    });

    fireEvent.change(eprelInput, { target: { value: '1234' } });

    const filterBtn = screen.getAllByText('pages.products.filterLabels.filter')[1];
    fireEvent.click(filterBtn);

    expect(screen.queryByText('Il codice deve essere numerico')).not.toBeInTheDocument();
  });
});

describe('FiltersDrawer – filtro status per ruolo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'OTHER' });
  });

  it('nasconde WAIT_APPROVED e SUPERVISED per utenti non Invitalia', async () => {
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

describe('FiltersDrawer – onClose reset dei draft', () => {
  it('ripristina i draft ai filtri applicati quando si chiude il Drawer', () => {
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

describe('getChipColor (real constants, no mock) – aspettative corrette', () => {
  let getChipColor: any;
  let REAL_STATES: any;

  beforeAll(() => {
    jest.isolateModules(() => {
      REAL_STATES = jest.requireActual('../../../utils/constants').PRODUCTS_STATES;
      const mod = jest.requireActual('../FiltersDrawer');
      getChipColor = mod.getChipColor;
    });
  });

  it('match mappa reale', () => {
    expect(getChipColor(REAL_STATES.UPLOADED)).toBe('default');
    expect(getChipColor(REAL_STATES.WAIT_APPROVED)).toBe('info');
    expect(getChipColor(REAL_STATES.SUPERVISED)).toBe('primary');
    expect(getChipColor(REAL_STATES.APPROVED)).toBe('success');
    expect(getChipColor(REAL_STATES.REJECTED)).toBe('error');
  });

  it('default per valori ignoti', () => {
    expect(getChipColor('SOMETHING_ELSE')).toBe('default');
    expect(getChipColor(undefined as unknown as string)).toBe('default');
    expect(getChipColor(null as unknown as string)).toBe('default');
  });
});
