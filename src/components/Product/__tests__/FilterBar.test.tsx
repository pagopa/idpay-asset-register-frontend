import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FilterBar from '../FilterBar';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';
import { BatchFilterItems } from '../helpers';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                'pages.products.filterLabels.category': 'Category',
                'pages.products.filterLabels.batch': 'Batch',
                'pages.products.filterLabels.eprelCode': 'EPREL Code',
                'pages.products.filterLabels.gtinCode': 'GTIN Code',
                'pages.products.filterLabels.filter': 'Filter',
                'pages.products.filterLabels.deleteFilters': 'Delete Filters',
                'pages.products.categories.APPLIANCES': 'Appliances',
                'pages.products.categories.ELECTRONICS': 'Electronics',
            };
            return translations[key] || key;
        },
    }),
}));

jest.mock('../../../utils/constants', () => ({
    PRODUCTS_CATEGORY: {
        APPLIANCES: 'APPLIANCES',
        ELECTRONICS: 'ELECTRONICS',
    },
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme();
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe('FilterBar', () => {
    const mockSetCategoryFilter = jest.fn();
    const mockSetFiltering = jest.fn();
    const mockSetBatchFilter = jest.fn();
    const mockSetEprelCodeFilter = jest.fn();
    const mockSetGtinCodeFilter = jest.fn();
    const mockHandleDeleteFiltersButtonClick = jest.fn();

    const mockBatchFilterItems: BatchFilterItems[] = [
        {
            productFileId: '1',
            batchName: 'Batch 1',
        },
        {
            productFileId: '2',
            batchName: 'Batch 2',
        },
    ];

    const mockTableData: ProductDTO[] = [
        {
            id: '1',
            name: 'Product 1',
            category: 'APPLIANCES',
        } as ProductDTO,
        {
            id: '2',
            name: 'Product 2',
            category: 'ELECTRONICS',
        } as ProductDTO,
    ];

    const defaultProps = {
        categoryFilter: '',
        setCategoryFilter: mockSetCategoryFilter,
        setFiltering: mockSetFiltering,
        batchFilter: '',
        setBatchFilter: mockSetBatchFilter,
        batchFilterItems: mockBatchFilterItems,
        eprelCodeFilter: '',
        setEprelCodeFilter: mockSetEprelCodeFilter,
        gtinCodeFilter: '',
        setGtinCodeFilter: mockSetGtinCodeFilter,
        tableData: mockTableData,
        handleDeleteFiltersButtonClick: mockHandleDeleteFiltersButtonClick,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (props = {}) => {
        return render(
            <TestWrapper>
                <FilterBar {...defaultProps} {...props} />
            </TestWrapper>
        );
    };

    describe('Rendering', () => {
        test('should render all filter components when tableData has items', () => {
            renderComponent();

            expect(screen.getByLabelText('Category')).toBeInTheDocument();
            expect(screen.getByLabelText('Batch')).toBeInTheDocument();
            expect(screen.getByLabelText('EPREL Code')).toBeInTheDocument();
            expect(screen.getByLabelText('GTIN Code')).toBeInTheDocument();
            expect(screen.getByText('Filter')).toBeInTheDocument();
            expect(screen.getByText('Delete Filters')).toBeInTheDocument();
        });

        test('should not render filter components when tableData is empty', () => {
            renderComponent({ tableData: [] });

            expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Batch')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('EPREL Code')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('GTIN Code')).not.toBeInTheDocument();
        });

        test('should not render filter components when tableData is undefined', () => {
            renderComponent({ tableData: undefined });

            expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();
        });
    });

    describe('Filter Buttons State', () => {
        test('should disable filter and delete buttons when no filters are set', () => {
            renderComponent();

            const filterButton = screen.getByRole('button', { name: 'Filter' });
            const deleteButton = screen.getByRole('button', { name: 'Delete Filters' });

            expect(filterButton).toBeDisabled();
            expect(deleteButton).toBeDisabled();
        });

        test('should enable filter and delete buttons when category filter is set', () => {
            renderComponent({ categoryFilter: 'APPLIANCES' });

            const filterButton = screen.getByRole('button', { name: 'Filter' });
            const deleteButton = screen.getByRole('button', { name: 'Delete Filters' });

            expect(filterButton).not.toBeDisabled();
            expect(deleteButton).not.toBeDisabled();
        });

        test('should enable filter and delete buttons when batch filter is set', () => {
            renderComponent({ batchFilter: '1' });

            const filterButton = screen.getByRole('button', { name: 'Filter' });
            const deleteButton = screen.getByRole('button', { name: 'Delete Filters' });

            expect(filterButton).not.toBeDisabled();
            expect(deleteButton).not.toBeDisabled();
        });

        test('should enable filter and delete buttons when EPREL code filter is set', () => {
            renderComponent({ eprelCodeFilter: 'EPREL123' });

            const filterButton = screen.getByRole('button', { name: 'Filter' });
            const deleteButton = screen.getByRole('button', { name: 'Delete Filters' });

            expect(filterButton).not.toBeDisabled();
            expect(deleteButton).not.toBeDisabled();
        });

        test('should enable filter and delete buttons when GTIN code filter is set', () => {
            renderComponent({ gtinCodeFilter: 'GTIN456' });

            const filterButton = screen.getByRole('button', { name: 'Filter' });
            const deleteButton = screen.getByRole('button', { name: 'Delete Filters' });

            expect(filterButton).not.toBeDisabled();
            expect(deleteButton).not.toBeDisabled();
        });
    });

    describe('User Interactions', () => {
        test('should call setCategoryFilter when category select changes', async () => {
            renderComponent();

            const categorySelect = screen.getByLabelText('Category');
            fireEvent.mouseDown(categorySelect);

            const appliancesOption = await screen.findByText('Appliances');
            fireEvent.click(appliancesOption);

            expect(mockSetCategoryFilter).toHaveBeenCalledWith('Appliances');
        });

        test('should call setBatchFilter when batch select changes', async () => {
            renderComponent();

            const batchSelect = screen.getByLabelText('Batch');
            fireEvent.mouseDown(batchSelect);

            const batch1Option = await screen.findByText('Batch 1');
            fireEvent.click(batch1Option);

            expect(mockSetBatchFilter).toHaveBeenCalledWith('1');
        });

        test('should call setEprelCodeFilter when EPREL code input changes', () => {
            renderComponent();

            const eprelInput = screen.getByLabelText('EPREL Code');
            fireEvent.change(eprelInput, { target: { value: 'EPREL123' } });

            expect(mockSetEprelCodeFilter).toHaveBeenCalledWith('EPREL123');
        });

        test('should call setGtinCodeFilter when GTIN code input changes', () => {
            renderComponent();

            const gtinInput = screen.getByLabelText('GTIN Code');
            fireEvent.change(gtinInput, { target: { value: 'GTIN456' } });

            expect(mockSetGtinCodeFilter).toHaveBeenCalledWith('GTIN456');
        });

        test('should call setFiltering when filter button is clicked', () => {
            renderComponent({ categoryFilter: 'APPLIANCES' });

            const filterButton = screen.getByRole('button', { name: 'Filter' });
            fireEvent.click(filterButton);

            expect(mockSetFiltering).toHaveBeenCalledWith(true);
        });

        test('should call handleDeleteFiltersButtonClick when delete filters button is clicked', () => {
            renderComponent({ categoryFilter: 'APPLIANCES' });

            const deleteButton = screen.getByRole('button', { name: 'Delete Filters' });
            fireEvent.click(deleteButton);

            expect(mockHandleDeleteFiltersButtonClick).toHaveBeenCalled();
        });
    });

    describe('Select Options', () => {
        test('should render category options from PRODUCTS_CATEGORY', async () => {
            renderComponent();

            const categorySelect = screen.getByLabelText('Category');
            fireEvent.mouseDown(categorySelect);

            expect(await screen.findByText('Appliances')).toBeInTheDocument();
            expect(await screen.findByText('Electronics')).toBeInTheDocument();
        });

        test('should render batch options from batchFilterItems', async () => {
            renderComponent();

            const batchSelect = screen.getByLabelText('Batch');
            fireEvent.mouseDown(batchSelect);

            expect(await screen.findByText('Batch 1')).toBeInTheDocument();
            expect(await screen.findByText('Batch 2')).toBeInTheDocument();
        });

        test('should handle empty batchFilterItems array', () => {
            renderComponent({ batchFilterItems: [] });

            expect(screen.getByLabelText('Batch')).toBeInTheDocument();
        });

        test('should handle undefined batchFilterItems', () => {
            renderComponent({ batchFilterItems: undefined });

            expect(screen.getByLabelText('Batch')).toBeInTheDocument();
        });
    });

    describe('Input Values', () => {
        test('should display current filter values', () => {
            renderComponent({
                categoryFilter: 'APPLIANCES',
                batchFilter: '1',
                eprelCodeFilter: 'EPREL123',
                gtinCodeFilter: 'GTIN456',
            });

            const eprelInput = screen.getByDisplayValue('EPREL123');
            const gtinInput = screen.getByDisplayValue('GTIN456');

            expect(eprelInput).toBeInTheDocument();
            expect(gtinInput).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        test('should handle null tableData', () => {
            renderComponent({ tableData: null });

            expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();
        });

        test('should handle missing translation keys gracefully', () => {
            // This test ensures the component doesn't crash if translation keys are missing
            renderComponent();

            expect(screen.getByLabelText('Category')).toBeInTheDocument();
        });
    });
});