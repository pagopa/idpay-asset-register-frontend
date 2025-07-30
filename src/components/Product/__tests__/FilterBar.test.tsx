import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FilterBar from '../FilterBar';
import { BatchFilterItems } from '../helpers';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('../../../utils/constants', () => ({
    PRODUCTS_CATEGORY: {
        CATEGORY_1: 'category1',
        CATEGORY_2: 'category2',
    },
    PRODUCTS_STATES: {
        STATE_1: 'state1',
        STATE_2: 'state2',
    },
}));

const renderWithTheme = (component: React.ReactElement) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

describe('FilterBar', () => {
    const mockBatchFilterItems: Array<BatchFilterItems> = [
        { productFileId: '1', batchName: 'Batch 1' },
        { productFileId: '2', batchName: 'Batch 2' },
    ];

    const defaultProps = {
        categoryFilter: '',
        setCategoryFilter: jest.fn(),
        statusFilter: '',
        setStatusFilter: jest.fn(),
        setFiltering: jest.fn(),
        batchFilter: '',
        setBatchFilter: jest.fn(),
        batchFilterItems: mockBatchFilterItems,
        eprelCodeFilter: '',
        setEprelCodeFilter: jest.fn(),
        gtinCodeFilter: '',
        setGtinCodeFilter: jest.fn(),
        errorStatus: false,
        tableData: [],
        handleDeleteFiltersButtonClick: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all filter elements', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        expect(screen.getByLabelText('pages.products.filterLabels.category')).toBeInTheDocument();
        expect(screen.getByLabelText('pages.products.filterLabels.status')).toBeInTheDocument();
        expect(screen.getByLabelText('pages.products.filterLabels.batch')).toBeInTheDocument();
        expect(screen.getByLabelText('pages.products.filterLabels.eprelCode')).toBeInTheDocument();
        expect(screen.getByLabelText('pages.products.filterLabels.gtinCode')).toBeInTheDocument();
        expect(screen.getByText('pages.products.filterLabels.filter')).toBeInTheDocument();
        expect(screen.getByText('pages.products.filterLabels.deleteFilters')).toBeInTheDocument();
    });

    it('should have filter and delete buttons disabled when no filters are set', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const filterButton = screen.getByText('pages.products.filterLabels.filter');
        const deleteButton = screen.getByText('pages.products.filterLabels.deleteFilters');

        expect(filterButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
    });

    it('should enable filter button when category filter is set', () => {
        const props = { ...defaultProps, categoryFilter: 'pages.products.categories.CATEGORY_1' };
        renderWithTheme(<FilterBar {...props} />);

        const filterButton = screen.getByText('pages.products.filterLabels.filter');
        const deleteButton = screen.getByText('pages.products.filterLabels.deleteFilters');

        expect(filterButton).not.toBeDisabled();
        expect(deleteButton).not.toBeDisabled();
    });

    it('should enable filter button when status filter is set', () => {
        const props = { ...defaultProps, statusFilter: 'pages.products.categories.STATE_1' };
        renderWithTheme(<FilterBar {...props} />);

        const filterButton = screen.getByText('pages.products.filterLabels.filter');
        expect(filterButton).not.toBeDisabled();
    });

    it('should enable filter button when batch filter is set', () => {
        const props = { ...defaultProps, batchFilter: '1' };
        renderWithTheme(<FilterBar {...props} />);

        const filterButton = screen.getByText('pages.products.filterLabels.filter');
        expect(filterButton).not.toBeDisabled();
    });

    it('should enable filter button when eprel code filter is set', () => {
        const props = { ...defaultProps, eprelCodeFilter: 'EPREL123' };
        renderWithTheme(<FilterBar {...props} />);

        const filterButton = screen.getByText('pages.products.filterLabels.filter');
        expect(filterButton).not.toBeDisabled();
    });

    it('should enable filter button when gtin code filter is set', () => {
        const props = { ...defaultProps, gtinCodeFilter: 'GTIN123' };
        renderWithTheme(<FilterBar {...props} />);

        const filterButton = screen.getByText('pages.products.filterLabels.filter');
        expect(filterButton).not.toBeDisabled();
    });

    it('should enable delete button when errorStatus is true even with no filters', () => {
        const props = { ...defaultProps, errorStatus: true };
        renderWithTheme(<FilterBar {...props} />);

        const deleteButton = screen.getByText('pages.products.filterLabels.deleteFilters');
        expect(deleteButton).not.toBeDisabled();
    });

    it('should call setCategoryFilter when category select changes', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const categorySelect = screen.getByLabelText('pages.products.filterLabels.category');
        fireEvent.mouseDown(categorySelect);

        const categoryOption = screen.getByText('pages.products.categories.CATEGORY_1');
        fireEvent.click(categoryOption);

        expect(defaultProps.setCategoryFilter).toHaveBeenCalledWith('pages.products.categories.CATEGORY_1');
    });

    it('should call setStatusFilter when status select changes', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const statusSelect = screen.getByLabelText('pages.products.filterLabels.status');
        fireEvent.mouseDown(statusSelect);

        const statusOption = screen.getByText('pages.products.categories.STATE_1');
        fireEvent.click(statusOption);

        expect(defaultProps.setStatusFilter).toHaveBeenCalledWith('pages.products.categories.STATE_1');
    });

    it('should call setBatchFilter when batch select changes', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const batchSelect = screen.getByLabelText('pages.products.filterLabels.batch');
        fireEvent.mouseDown(batchSelect);

        const batchOption = screen.getByText('Batch 1');
        fireEvent.click(batchOption);

        expect(defaultProps.setBatchFilter).toHaveBeenCalledWith('1');
    });

    it('should call setEprelCodeFilter when eprel code input changes', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const eprelInput = screen.getByLabelText('pages.products.filterLabels.eprelCode');
        fireEvent.change(eprelInput, { target: { value: 'EPREL123' } });

        expect(defaultProps.setEprelCodeFilter).toHaveBeenCalledWith('EPREL123');
    });

    it('should call setGtinCodeFilter when gtin code input changes', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const gtinInput = screen.getByLabelText('pages.products.filterLabels.gtinCode');
        fireEvent.change(gtinInput, { target: { value: 'GTIN123' } });

        expect(defaultProps.setGtinCodeFilter).toHaveBeenCalledWith('GTIN123');
    });

    it('should call setFiltering when filter button is clicked', () => {
        const props = { ...defaultProps, categoryFilter: 'pages.products.categories.CATEGORY_1' };
        renderWithTheme(<FilterBar {...props} />);

        const filterButton = screen.getByText('pages.products.filterLabels.filter');
        fireEvent.click(filterButton);

        expect(defaultProps.setFiltering).toHaveBeenCalledWith(true);
    });

    it('should call handleDeleteFiltersButtonClick when delete filters button is clicked', () => {
        const props = { ...defaultProps, categoryFilter: 'pages.products.categories.CATEGORY_1' };
        renderWithTheme(<FilterBar {...props} />);

        const deleteButton = screen.getByText('pages.products.filterLabels.deleteFilters');
        fireEvent.click(deleteButton);

        expect(defaultProps.handleDeleteFiltersButtonClick).toHaveBeenCalled();
    });

    it('should render all category options in select', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const categorySelect = screen.getByLabelText('pages.products.filterLabels.category');
        fireEvent.mouseDown(categorySelect);

        expect(screen.getByText('pages.products.categories.CATEGORY_1')).toBeInTheDocument();
        expect(screen.getByText('pages.products.categories.CATEGORY_2')).toBeInTheDocument();
    });

    it('should render all status options in select', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const statusSelect = screen.getByLabelText('pages.products.filterLabels.status');
        fireEvent.mouseDown(statusSelect);

        expect(screen.getByText('pages.products.categories.STATE_1')).toBeInTheDocument();
        expect(screen.getByText('pages.products.categories.STATE_2')).toBeInTheDocument();
    });

    it('should render all batch options in select', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const batchSelect = screen.getByLabelText('pages.products.filterLabels.batch');
        fireEvent.mouseDown(batchSelect);

        expect(screen.getByText('Batch 1')).toBeInTheDocument();
        expect(screen.getByText('Batch 2')).toBeInTheDocument();
    });

    it('should handle empty batchFilterItems array', () => {
        const props = { ...defaultProps, batchFilterItems: [] };
        renderWithTheme(<FilterBar {...props} />);

        const batchSelect = screen.getByLabelText('pages.products.filterLabels.batch');
        fireEvent.mouseDown(batchSelect);

        // Non dovrebbero esserci opzioni nel menu
        expect(screen.queryByText('Batch 1')).not.toBeInTheDocument();
    });

    it('should handle null/undefined batchFilterItems', () => {
        const props = { ...defaultProps, batchFilterItems: null as any };
        renderWithTheme(<FilterBar {...props} />);

        // Il componente dovrebbe renderizzarsi senza errori
        expect(screen.getByLabelText('pages.products.filterLabels.batch')).toBeInTheDocument();
    });

    it('should display current filter values', () => {
        const props = {
            ...defaultProps,
            categoryFilter: 'pages.products.categories.CATEGORY_1',
            statusFilter: 'pages.products.categories.STATE_1',
            batchFilter: '1',
            eprelCodeFilter: 'EPREL123',
            gtinCodeFilter: 'GTIN123',
        };

        renderWithTheme(<FilterBar {...props} />);

        expect(screen.getByDisplayValue('pages.products.categories.CATEGORY_1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('pages.products.categories.STATE_1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('EPREL123')).toBeInTheDocument();
        expect(screen.getByDisplayValue('GTIN123')).toBeInTheDocument();
    });

    it('should apply correct styling and layout', () => {
        renderWithTheme(<FilterBar {...defaultProps} />);

        const container = screen.getByLabelText('pages.products.filterLabels.category').closest('.MuiBox-root');
        expect(container).toHaveStyle({
            display: 'flex',
            'flex-direction': 'row',
        });
    });

    it('should have correct button heights and min widths', () => {
        const props = { ...defaultProps, categoryFilter: 'test' };
        renderWithTheme(<FilterBar {...props} />);

        const filterButton = screen.getByText('pages.products.filterLabels.filter');
        const deleteButton = screen.getByText('pages.products.filterLabels.deleteFilters');

        expect(filterButton).toHaveStyle({ height: '44px', 'min-width': '100px' });
        expect(deleteButton).toHaveStyle({ height: '44px', 'min-width': '100px' });
    });
});