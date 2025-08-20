import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import FiltersDrawer from '../FiltersDrawer';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (k: string) => k,
    }),
}));

jest.mock('../../../utils/constants', () => ({
    INVITALIA: 'INVITALIA',
    PRODUCTS_CATEGORY: { CATEGORY_A: 'category_a', CATEGORY_B: 'category_b' },
    PRODUCTS_STATES: { STATE_A: 'state_a', STATE_B: 'state_b' },
}));

const mockInstitutions = [
    { institutionId: 'inst1', description: 'Producer One' },
    { institutionId: 'inst2', description: 'Producer Two' },
];
jest.mock('../../../redux/slices/invitaliaSlice', () => ({
    institutionListSelector: jest.fn(() => mockInstitutions),
}));

const mockFetchUserFromLocalStorage = jest.fn();
jest.mock('../../../helpers', () => ({
    fetchUserFromLocalStorage: () => mockFetchUserFromLocalStorage(),
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
});

describe('FiltersDrawer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetchUserFromLocalStorage.mockReset();
    });

    it('renders header and close button; clicking close closes the drawer', () => {
        mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA' });
        const props = defaultProps();
        renderWithProviders(<FiltersDrawer {...props} />);

        expect(screen.getAllByText('pages.products.filterLabels.filter')[0]).toBeInTheDocument();

        const closeBtn = screen.getByTestId('open-detail-button');
        fireEvent.click(closeBtn);
        expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
    });

    it('shows "producer" Select when user is INVITALIA', () => {
        mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA' });
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
        mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA' });
        const props = defaultProps();
        renderWithProviders(<FiltersDrawer {...props} />);

        const statusSelect = screen.getByLabelText('pages.products.filterLabels.status');
        fireEvent.mouseDown(statusSelect);

        const opt = await screen.findByRole('option', {
            name: 'pages.products.categories.STATE_A',
        });
        fireEvent.click(opt);

        expect(props.setStatusFilter).toHaveBeenCalledWith('pages.products.categories.STATE_A');

        const deleteBtn = screen.getByText('pages.products.filterLabels.deleteFilters');
        expect(deleteBtn).not.toBeDisabled();
    });

    it('changes batch via Select', async () => {
        mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA' });
        const props = defaultProps();
        renderWithProviders(<FiltersDrawer {...props} />);

        const batchSelect = screen.getByLabelText('pages.products.filterLabels.batch');
        fireEvent.mouseDown(batchSelect);

        const option = await screen.findByRole('option', { name: 'Batch 1' });
        fireEvent.click(option);

        expect(props.setBatchFilter).toHaveBeenCalledWith('b1');
    });

    it('changes category via Select', async () => {
        mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA' });
        const props = defaultProps();
        renderWithProviders(<FiltersDrawer {...props} />);

        const catSelect = screen.getByLabelText('pages.products.filterLabels.category');
        fireEvent.mouseDown(catSelect);

        const option = await screen.findByRole('option', {
            name: 'pages.products.categories.CATEGORY_A',
        });
        fireEvent.click(option);

        expect(props.setCategoryFilter).toHaveBeenCalledWith('pages.products.categories.CATEGORY_A');
    });

    it('types in eprel/gtin inputs and calls setters with trimmed values', () => {
        mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA' });
        const props = defaultProps();
        renderWithProviders(<FiltersDrawer {...props} />);

        const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
        fireEvent.change(eprelInput, { target: { value: '  EPREL123  ' } });
        expect(props.setEprelCodeFilter).toHaveBeenCalledWith('EPREL123');

        const gtinInput = screen.getByLabelText('pages.products.filterLabels.gtinCode');
        fireEvent.change(gtinInput, { target: { value: '  GTIN999  ' } });
        expect(props.setGtinCodeFilter).toHaveBeenCalledWith('GTIN999');
    });

    it('enables "filter" button when at least one filter is set', () => {
        mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA' });
        const props = {
            ...defaultProps(),
            statusFilter: 'pages.products.categories.STATE_A',
        };
        renderWithProviders(<FiltersDrawer {...props} />);

        const filterBtns = screen.getAllByText('pages.products.filterLabels.filter');
        expect(filterBtns[0]).not.toBeDisabled();
    });

    it('enables "delete filters" after interaction and invokes callbacks', () => {
        mockFetchUserFromLocalStorage.mockReturnValue({ org_role: 'INVITALIA' });
        const props = { ...defaultProps(), errorStatus: false };
        renderWithProviders(<FiltersDrawer {...props} />);

        const deleteBtn = screen.getByText('pages.products.filterLabels.deleteFilters');
        expect(deleteBtn).toBeDisabled();

        const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
        fireEvent.change(eprelInput, { target: { value: 'ABC' } });

        expect(deleteBtn).not.toBeDisabled();
        fireEvent.click(deleteBtn);

        expect(props.handleDeleteFiltersButtonClick).toHaveBeenCalled();
        expect(props.toggleFiltersDrawer).toHaveBeenCalledWith(false);
    });
});
