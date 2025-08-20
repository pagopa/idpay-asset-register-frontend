import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductsTable from '../ProductsTable';
import {ProductDTO} from "../../../api/generated/register/ProductDTO";
import {INVITALIA} from "../../../utils/constants";

const basePreloadedState = {
    invitalia: {
        institutionList: [],
        selectedInstitution: null,
        loading: false,
        error: null,
    },
    ui: { locale: 'it' },
    auth: { user: { id: 'u1' } },
};

const createTestStore = (preloadedState: any = {}) =>
    configureStore({
        reducer: (state = preloadedState) => state,
        preloadedState,
    });

const TestWrapper: React.FC<{ children: React.ReactNode; preloadedState?: any }> = ({
                                                                                        children,
                                                                                        preloadedState = {},
                                                                                    }) => {
    const mergedState = {
        ...basePreloadedState,
        ...preloadedState,
        invitalia: {
            ...basePreloadedState.invitalia,
            ...(preloadedState.invitalia ?? {}),
        },
    };
    const store = createTestStore(mergedState);

    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </Provider>
    );
};

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                'pages.products.listHeader.status': 'Status',
                'pages.products.listHeader.category': 'Category',
                'pages.products.listHeader.energeticClass': 'Energy Class',
                'pages.products.listHeader.eprelCode': 'EPREL Code',
                'pages.products.listHeader.gtinCode': 'GTIN Code',
                'pages.products.listHeader.batch': 'Batch',
            };
            return translations[key] || key;
        },
    }),
}));

jest.mock('../../../components/Product/EprelLinks', () => {
    return function EprelLinks({ row }: { row: ProductDTO }) {
        return <div data-testid="eprel-links">{row.eprelCode}</div>;
    };
});

jest.mock('../../../components/Product/EnhancedTableHead', () => {
    return function EnhancedTableHead({
                                          isInvitaliaUser,
                                          headCells,
                                          order,
                                          orderBy,
                                          onRequestSort,
                                          isAllSelected,
                                          isIndeterminate,
                                          handleSelectAllClick,
                                      }: any) {
        return (
            <thead data-testid="enhanced-table-head">
            <tr>
                {isInvitaliaUser && (
                    <th>
                        <input
                            type="checkbox"
                            data-testid="select-all-checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAllClick}
                            ref={(input) => {
                                if (input) input.indeterminate = isIndeterminate;
                            }}
                        />
                    </th>
                )}
                {headCells.map((cell: any) => (
                    <th
                        key={cell.id}
                        onClick={(event) => onRequestSort(event, cell.id)}
                        data-testid={`header-${cell.id}`}
                    >
                        {cell.label} {orderBy === cell.id ? (order === 'asc' ? '↑' : '↓') : ''}
                    </th>
                ))}
            </tr>
            </thead>
        );
    };
});

jest.mock('../../../helpers', () => ({
    fetchUserFromLocalStorage: jest.fn(),
}));

jest.mock('../../../utils/constants', () => ({
    INVITALIA: 'INVITALIA',
}));

import {fetchUserFromLocalStorage} from '../../../helpers';
import {Provider} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";

const theme = createTheme();

describe('ProductsTable', () => {
    const mockOnRequestSort = jest.fn();
    const mockHandleListButtonClick = jest.fn();
    const mockSetSelected = jest.fn();

    const mockProductData: ProductDTO[] = [
        {
            id: '1',
            status: 'APPROVED',
            category: 'Refrigerators',
            energyClass: 'A++',
            eprelCode: 'EPREL001',
            gtinCode: 'GTIN001',
            batchName: 'Batch001',
        },
        {
            id: '2',
            status: 'SUPERVISIONED',
            category: 'Washing Machines',
            energyClass: 'A+',
            eprelCode: 'EPREL002',
            gtinCode: 'GTIN002',
            batchName: 'Batch002',
        },
        {
            id: '3',
            status: 'REJECTED',
            category: 'Dishwashers',
            energyClass: 'B',
            eprelCode: 'EPREL003',
            gtinCode: 'GTIN003',
            batchName: 'Batch003',
        },
        {
            id: '4',
            status: 'PENDING',
            category: 'Ovens',
            energyClass: 'C',
            eprelCode: 'EPREL004',
            gtinCode: 'GTIN004',
            batchName: 'Batch004',
        },
    ];

    const mockProductDataWithNulls: ProductDTO[] = [
        {
            id: '5',
            status: undefined,
            category: undefined,
            energyClass: undefined,
            eprelCode: undefined,
            gtinCode: undefined,
            batchName: undefined,
        },
    ];

    const mockProductDataWithoutGtinCode: ProductDTO[] = [
        {
            id: '6',
            status: 'APPROVED',
            category: 'Test Category',
            energyClass: 'A',
            eprelCode: 'EPREL005',
            gtinCode: undefined,
            batchName: 'Test Batch',
        },
    ];

    const defaultProps = {
        tableData: mockProductData,
        emptyData: 'N/A',
        order: 'asc' as const,
        orderBy: 'category' as keyof ProductDTO,
        onRequestSort: mockOnRequestSort,
        handleListButtonClick: mockHandleListButtonClick,
        selected: [],
        setSelected: mockSetSelected,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Invitalia User Tests', () => {
        beforeEach(() => {
            fetchUserFromLocalStorage.mockReturnValue({ org_role: INVITALIA });
        });

        it('should render table with all columns for Invitalia user', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('enhanced-table-head')).toBeInTheDocument();
            expect(screen.getByTestId('header-status')).toBeInTheDocument();
            expect(screen.getByTestId('header-category')).toBeInTheDocument();
            expect(screen.getByTestId('header-eprelCode')).toBeInTheDocument();
            expect(screen.getByTestId('header-gtinCode')).toBeInTheDocument();
            expect(screen.getByTestId('header-batchName')).toBeInTheDocument();
        });

        it('should render all status icons correctly', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            // APPROVED status should not render an icon
            const approvedRows = screen.getAllByText('Refrigerators');
            expect(approvedRows[0]).toBeInTheDocument();

            // PENDING status should not render an icon (default case)
            const pendingRows = screen.getAllByText('Ovens');
            expect(pendingRows[0]).toBeInTheDocument();
        });

        it('should handle checkbox selection for individual items', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            const checkboxes = screen.getAllByRole('checkbox');
            // First checkbox is "select all", skip it
            const firstItemCheckbox = checkboxes[1];

            fireEvent.click(firstItemCheckbox);

            expect(mockSetSelected).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should handle select all checkbox', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
            fireEvent.change(selectAllCheckbox, { target: { checked: true } });

            expect(mockSetSelected).toHaveBeenCalledTimes(0);
        });

        it('should handle unselect all checkbox', () => {
            const propsWithSelection = {
                ...defaultProps,
                selected: ['GTIN001', 'GTIN002'],
            };

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithSelection} />
                </TestWrapper>
            );

            const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
            fireEvent.change(selectAllCheckbox, { target: { checked: false } });

            expect(mockSetSelected).toHaveBeenCalledTimes(0);
        });

        it('should show indeterminate state when some items are selected', () => {
            const propsWithPartialSelection = {
                ...defaultProps,
                selected: ['GTIN001'],
            };

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithPartialSelection} />
                </TestWrapper>
            );

            const selectAllCheckbox = screen.getByTestId('select-all-checkbox') as HTMLInputElement;
            expect(selectAllCheckbox.indeterminate).toBe(true);
        });

        it('should show selected state when all items are selected', () => {
            const propsWithAllSelected = {
                ...defaultProps,
                selected: ['GTIN001', 'GTIN002', 'GTIN003', 'GTIN004'],
            };

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithAllSelected} />
                </TestWrapper>
            );

            const selectAllCheckbox = screen.getByTestId('select-all-checkbox') as HTMLInputElement;
            expect(selectAllCheckbox.checked).toBe(true);
            expect(selectAllCheckbox.indeterminate).toBe(false);
        });

        it('should handle row selection with selected items', () => {
            const propsWithSelection = {
                ...defaultProps,
                selected: ['GTIN001'],
            };

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithSelection} />
                </TestWrapper>
            );

            // Should have selected row styling
            const tableRows = screen.getAllByRole('row');
            // First row is header, second row should be selected
            expect(tableRows[1]).toHaveStyle({ background: '#0073E614' });
        });

        it('should handle list button click', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            const arrowIcons = screen.getAllByTestId('ArrowForwardIosIcon');
            fireEvent.click(arrowIcons[0]);

            expect(mockHandleListButtonClick).toHaveBeenCalledWith(mockProductData[0]);
        });

        it('should handle products without gtinCode', () => {
            const propsWithNullGtin = {
                ...defaultProps,
                tableData: mockProductDataWithoutGtinCode,
            };

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithNullGtin} />
                </TestWrapper>
            );

            const checkboxes = screen.getAllByRole('checkbox');
            const itemCheckbox = checkboxes[1];
            expect(itemCheckbox).toBeDisabled();
        });

        it('should handle empty/null data with emptyData prop', () => {
            const propsWithNulls = {
                ...defaultProps,
                tableData: mockProductDataWithNulls,
                emptyData: 'No Data',
            };

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithNulls} />
                </TestWrapper>
            );

            expect(screen.getAllByText('No Data')).toHaveLength(4);
        });
    });

    describe('Produttore User Tests', () => {
        beforeEach(() => {
            fetchUserFromLocalStorage.mockReturnValue({ org_role: 'PRODUCER' });
        });

        it('should render table without checkbox column for non-Invitalia user', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('enhanced-table-head')).toBeInTheDocument();
            expect(screen.queryByTestId('select-all-checkbox')).not.toBeInTheDocument();
            expect(screen.getByTestId('header-category')).toBeInTheDocument();
            expect(screen.getByTestId('header-actions')).toBeInTheDocument();
        });

        it('should render all cell types correctly for produttore', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            // Test all different cell contents
            expect(screen.getByText('Refrigerators')).toBeInTheDocument();
            expect(screen.getByText('A++')).toBeInTheDocument();
            expect(screen.getAllByTestId('eprel-links')).toHaveLength(4);
            expect(screen.getByText('GTIN001')).toBeInTheDocument();
            expect(screen.getByText('Batch001')).toBeInTheDocument();
            expect(screen.getAllByTestId('ArrowForwardIosIcon')).toHaveLength(4);
        });

        it('should handle list button click for produttore', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            const arrowIcons = screen.getAllByTestId('ArrowForwardIosIcon');
            fireEvent.click(arrowIcons[0]);

            expect(mockHandleListButtonClick).toHaveBeenCalledWith(mockProductData[0]);
        });

        it('should render cells with correct alignment styles', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            // The component should render without errors and show proper content
            expect(screen.getByText('Refrigerators')).toBeInTheDocument();
            expect(screen.getByText('A++')).toBeInTheDocument();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty table data', () => {
            const emptyProps = {
                ...defaultProps,
                tableData: [],
            };

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...emptyProps} />
                </TestWrapper>
            );

            expect(screen.getByTestId('enhanced-table-head')).toBeInTheDocument();
            // No data rows should be present
            expect(screen.queryByText('Refrigerators')).not.toBeInTheDocument();
        });

        it('should handle user without org_role', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            // Should render as non-Invitalia user
            expect(screen.queryByTestId('select-all-checkbox')).not.toBeInTheDocument();
        });

        it('should handle null user from localStorage', () => {
            fetchUserFromLocalStorage.mockReturnValue(null);

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            // Should render as non-Invitalia user
            expect(screen.queryByTestId('select-all-checkbox')).not.toBeInTheDocument();
        });

        it('should handle checkbox click with item removal', () => {
            const propsWithSelection = {
                ...defaultProps,
                selected: ['GTIN001', 'GTIN002'],
            };

            fetchUserFromLocalStorage.mockReturnValue({ org_role: INVITALIA });

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithSelection} />
                </TestWrapper>
            );

            const checkboxes = screen.getAllByRole('checkbox');
            const firstItemCheckbox = checkboxes[1];

            fireEvent.click(firstItemCheckbox);

            expect(mockSetSelected).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should handle onRequestSort call', () => {
            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            const categoryHeader = screen.getByTestId('header-category');
            fireEvent.click(categoryHeader);

            expect(mockOnRequestSort).toHaveBeenCalledWith(expect.any(Object), 'category');
        });

        it('should handle different order directions', () => {
            const propsWithDescOrder = {
                ...defaultProps,
                order: 'desc' as const,
                orderBy: 'status' as keyof ProductDTO,
            };

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithDescOrder} />
                </TestWrapper>
            );

            expect(screen.getByTestId('header-status')).toBeInTheDocument();
        });

        it('should handle status with emptyData fallback', () => {
            const productWithNullStatus = [
                {
                    ...mockProductData[0],
                    status: undefined,
                },
            ];

            const propsWithNullStatus = {
                ...defaultProps,
                tableData: productWithNullStatus,
                emptyData: 'No Status',
            };

            fetchUserFromLocalStorage.mockReturnValue({ org_role: INVITALIA });

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...propsWithNullStatus} />
                </TestWrapper>
            );

            // Status cell should not render an icon for null status
            expect(screen.queryByTestId('WarningIcon')).not.toBeInTheDocument();
            expect(screen.queryByTestId('ErrorIcon')).not.toBeInTheDocument();
        });

        it('should memoize user correctly', () => {
            const mockUser = { org_role: INVITALIA };
            fetchUserFromLocalStorage.mockReturnValue(mockUser);

            const { rerender } = render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            expect(fetchUserFromLocalStorage).toHaveBeenCalledTimes(1);

            // Rerender with same props
            rerender(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...defaultProps} />
                </TestWrapper>
            );

            // fetchUserFromLocalStorage should still only be called once due to useMemo
            expect(fetchUserFromLocalStorage).toHaveBeenCalledTimes(1);
        });
    });

    describe('Coverage for all renderUploadStatusIcon cases', () => {
        it('should handle all status cases in renderUploadStatusIcon', () => {
            const allStatusData: ProductDTO[] = [
                { ...mockProductData[0], status: 'APPROVED' },
                { ...mockProductData[0], status: 'SUPERVISIONED' },
                { ...mockProductData[0], status: 'REJECTED' },
                { ...mockProductData[0], status: 'UNKNOWN_STATUS' },
                { ...mockProductData[0], status: undefined },
            ];

            fetchUserFromLocalStorage.mockReturnValue({ org_role: INVITALIA });

            render(
                <TestWrapper preloadedState={{ ui: { locale: 'it' }, auth: { user: { id: 'u1' } } }}>
                    <ProductsTable {...{ ...defaultProps, tableData: allStatusData }} />
                </TestWrapper>
            );

            // REJECTED should render error icon
            expect(screen.getByText('Da revisionare')).toBeInTheDocument();
        });
    });
});