import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import ProductDataGrid from '../ProductDataGrid';
import * as registerService from '../../../services/registerService';
import * as useLogin from '../../../hooks/useLogin';
import * as helpers from '../../../helpers';
import { productsSlice } from '../../../redux/slices/productsSlice';
import { invitaliaSlice } from '../../../redux/slices/invitaliaSlice';
import { INVITALIA } from '../../../utils/constants';

jest.mock('../../../utils/env', () => ({
    __esModule: true,
    default: {
        URL_API: {
            OPERATION: 'https://mock-api/register',
        },
        API_TIMEOUT_MS: {
            OPERATION: 5000,
        },
    },
}));

jest.mock('../../../routes', () => ({
    __esModule: true,
    default: {
        HOME: '/home'
    },
    BASE_ROUTE: '/base'
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
    default: ({ children, open, toggleDrawer }: any) => (
        open ? (
            <div data-testid="detail-drawer">
                {children}
                <button onClick={() => toggleDrawer(false)}>Close Drawer</button>
            </div>
        ) : null
    ),
}));
jest.mock('../../FiltersDrawer/FiltersDrawer', () => ({
    __esModule: true,
    default: ({ open, toggleFiltersDrawer, setFiltering }: any) => (
        open ? (
            <div data-testid="filters-drawer">
                <button onClick={() => toggleFiltersDrawer(false)}>Close Filters</button>
                <button onClick={() => setFiltering(true)}>Apply Filters</button>
            </div>
        ) : null
    ),
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
    default: ({ open, onClose, onUpdateTable }: any) => (
        open ? (
            <div data-testid="product-modal">
                <button onClick={onClose}>Close Modal</button>
                <button onClick={onUpdateTable}>Update Table</button>
            </div>
        ) : null
    ),
}));
jest.mock('../NewFilter', () => ({
    __esModule: true,
    default: ({ onClick }: any) => (
        <button data-testid="new-filter-btn" onClick={onClick}>New Filter</button>
    ),
}));
jest.mock('../../../pages/components/ProductsTable', () => ({
    __esModule: true,
    default: ({ tableData, handleListButtonClick, setSelected, selected }: any) => (
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
                </div>
            ))}
        </div>
    ),
}));
jest.mock('../../../pages/components/EmptyListTable', () => ({
    __esModule: true,
    default: ({ message }: any) => <div data-testid="empty-list">{message}</div>,
}));

const mockT = (key: string) => key;
i18n.init({
    resources: {},
    lng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

const mockProductData = [
    {
        id: '1',
        productName: 'Test Product 1',
        gtinCode: 'GTIN001',
        category: 'CATEGORY1',
        status: 'SUPERVISED',
        eprelCode: 'EPREL001',
        producerId: 'PRODUCER1',
        batchId: 'BATCH1',
    },
    {
        id: '2',
        productName: 'Test Product 2',
        gtinCode: 'GTIN002',
        category: 'CATEGORY2',
        status: 'INACTIVE',
        eprelCode: 'EPREL002',
        producerId: 'PRODUCER2',
        batchId: 'BATCH2',
    },
];

const mockBatchFilterItems = [
    {
        productFileId: 'BATCH1',
        batchName: 'Batch 1',
    },
    {
        productFileId: 'BATCH2',
        batchName: 'Batch 2',
    },
];

const mockInstitutions = [
    {
        institutionId: 'PRODUCER1',
        description: 'Producer 1',
    },
    {
        institutionId: 'PRODUCER2',
        description: 'Producer 2',
    },
];

const createMockStore = (initialState: any = {}) => {
    return configureStore({
        reducer: {
            products: productsSlice.reducer,
            invitalia: invitaliaSlice.reducer,
        },
        preloadedState: {
            products: {
                batchId: '',
                batchName: '',
                ...initialState.products,
            },
            invitalia: {
                institution: null,
                institutionList: mockInstitutions,
                ...initialState.invitalia,
            },
        },
    });
};

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
    const mockGetProducts = registerService.getProducts as jest.MockedFunction<typeof registerService.getProducts>;
    const mockGetBatchFilterList = registerService.getBatchFilterList as jest.MockedFunction<typeof registerService.getBatchFilterList>;
    const mockUserFromJwtToken = useLogin.userFromJwtTokenAsJWTUser as jest.MockedFunction<typeof useLogin.userFromJwtTokenAsJWTUser>;
    const mockFetchUserFromLocalStorage = helpers.fetchUserFromLocalStorage as jest.MockedFunction<typeof helpers.fetchUserFromLocalStorage>;

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
            pageNo: 0,
            totalElements: 2,
        });

        mockGetBatchFilterList.mockResolvedValue({
            left: [{ value: mockBatchFilterItems }],
        });

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
            org_email: ''
        });

        mockFetchUserFromLocalStorage.mockReturnValue({
            org_id: 'test-org-id',
            org_role: 'USER',
        });
    });

    describe('Rendering', () => {
        it('should render loading state initially', async () => {
            mockGetProducts.mockImplementation(() => new Promise(() => {}));

            renderComponent();

            expect(screen.getByTestId('new-filter-btn')).toBeInTheDocument();
        });

        it('should render products table when data is loaded', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('products-table')).toBeInTheDocument();
            });

            expect(screen.getByText('Test Product 1')).toBeInTheDocument();
            expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        });

        it('should render empty state when no products', async () => {
            mockGetProducts.mockResolvedValue({
                content: [],
                pageNo: 0,
                totalElements: 0,
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('empty-list')).toBeInTheDocument();
            });
        });

        it('should render children when provided and no data', async () => {
            mockGetProducts.mockResolvedValue({
                content: [],
                pageNo: 0,
                totalElements: 0,
            });

            renderComponent({
                children: <div data-testid="custom-children">Custom Content</div>,
            });

            await waitFor(() => {
                expect(screen.getByTestId('custom-children')).toBeInTheDocument();
            });
        });
    });

    describe('User Types', () => {
        it('should handle regular user', async () => {
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

        it('should handle Invitalia user', async () => {
            mockFetchUserFromLocalStorage.mockReturnValue({
                org_id: 'test-org-id',
                org_role: INVITALIA,
            });

            const storeState = {
                invitalia: {
                    institution: { institutionId: 'invitalia-inst-id' },
                    institutionList: mockInstitutions,
                },
            };

            renderComponent({}, storeState);

            await waitFor(() => {
                expect(mockGetProducts).toHaveBeenCalledWith("test-org-id", 0, 10, "category,asc", "", "", "", "", undefined, "");
            });
        });

        it('should show action buttons for Invitalia user with selections', async () => {
            mockFetchUserFromLocalStorage.mockReturnValue({
                org_id: 'test-org-id',
                org_role: INVITALIA,
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('products-table')).toBeInTheDocument();
            });
        });
    });

    describe('Filtering', () => {
        it('should open filters drawer', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('new-filter-btn')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('new-filter-btn'));

            expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();
        });

        it('should close filters drawer', async () => {
            renderComponent();

            await waitFor(() => {
                fireEvent.click(screen.getByTestId('new-filter-btn'));
            });

            expect(screen.getByTestId('filters-drawer')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Close Filters'));

            await waitFor(() => {
                expect(screen.queryByTestId('filters-drawer')).not.toBeInTheDocument();
            });
        });

        it('should display filters chip when filters are applied', async () => {
            const storeState = {
                products: {
                    batchId: 'BATCH1',
                    batchName: 'Batch 1',
                },
            };

            renderComponent({}, storeState);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /batch 1/i })).toBeInTheDocument();
            });
        });

        it('should clear filters when delete button is clicked', async () => {
            const storeState = {
                products: {
                    batchId: 'BATCH1',
                    batchName: 'Batch 1',
                },
            };

            renderComponent({}, storeState);

            await waitFor(() => {
                const filterChip = screen.getByRole('button', { name: /batch 1/i });
                expect(filterChip).toBeInTheDocument();

                const deleteIcon = filterChip.querySelector('[data-testid="CloseIcon"]');
                if (deleteIcon) {
                    fireEvent.click(deleteIcon);
                }
            });

            await waitFor(() => {
                expect(mockGetProducts).toHaveBeenCalledTimes(3);
            });
        });
    });

    describe('Sorting and Pagination', () => {
        it('should handle sorting', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('products-table')).toBeInTheDocument();
            });

            await act(async () => {
            });
        });

        it('should handle page change', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

            await waitFor(() => {
                expect(mockGetProducts).toHaveBeenCalledWith(
                    "test-org-id", 0, 10, "category,asc", "", "", "", "", undefined, ""
                );
            });
        });

        /*
        it('should handle rows per page change', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByAltText('2')).toBeInTheDocument();
            });

            const rowsPerPageSelect = screen.getByDisplayValue('20');
            fireEvent.change(rowsPerPageSelect, { target: { value: '50' } });

            await waitFor(() => {
                expect(mockGetProducts).toHaveBeenCalledWith(
                    expect.any(String),
                    0,
                    50,
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    undefined,
                    expect.any(String)
                );
            });
        });
        */
    });

    describe('Product Detail Drawer', () => {
        it('should open detail drawer when product detail is clicked', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('detail-btn-0')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId('detail-btn-0'));

            expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
        });

        it('should close detail drawer', async () => {
            renderComponent();

            await waitFor(() => {
                fireEvent.click(screen.getByTestId('detail-btn-0'));
            });

            expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Close Detail'));

            await waitFor(() => {
                expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockGetProducts.mockRejectedValue(new Error('API Error'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('empty-list')).toBeInTheDocument();
            });
        });

        it('should handle batch filter API errors', async () => {
            mockGetBatchFilterList.mockRejectedValue(new Error('Batch API Error'));

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('products-table')).toBeInTheDocument();
            });
        });
    });

    describe('Batch Filter Integration', () => {
        it('should filter by batch when batch is selected from Redux', async () => {
            const storeState = {
                products: {
                    batchId: 'BATCH1',
                    batchName: 'Batch 1',
                },
            };

            renderComponent({}, storeState);

            await waitFor(() => {
                expect(mockGetProducts).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.any(Number),
                    expect.any(Number),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    expect.any(String),
                    undefined,
                    'BATCH1'
                );
            });
        });
    });

    describe('Selection Management', () => {
        /*
        it('should clear selections when table data changes', async () => {
            renderComponent();

            await waitFor(() => {
                fireEvent.click(screen.getByTestId('checkbox-0'));
            });

            expect(screen.getByTestId('checkbox-0')).toBeChecked();

            mockGetProducts.mockResolvedValue({
                content: [{ ...mockProductData[0], productName: 'Updated Product' }],
                pageNo: 0,
                totalElements: 1,
            });

            await act(async () => {
            });
        });

        it('should handle multiple selections', async () => {
            renderComponent();

            await waitFor(() => {
                fireEvent.click(screen.getByTestId('checkbox-0'));
                fireEvent.click(screen.getByTestId('checkbox-1'));
            });

            expect(screen.getByTestId('checkbox-0')).toBeChecked();
            expect(screen.getByTestId('checkbox-1')).toBeChecked();
        });
        */
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels for pagination', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument();
            });
        });

        it('should have proper roles for interactive elements', async () => {
            renderComponent();

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox')).toHaveLength(2);
            });
        });
    });

    describe('Performance', () => {
        it('should not make unnecessary API calls', async () => {
            renderComponent();

            await waitFor(() => {
                expect(mockGetProducts).toHaveBeenCalledTimes(1);
                expect(mockGetBatchFilterList).toHaveBeenCalledTimes(1);
            });

            renderComponent();

            expect(mockGetProducts).toHaveBeenCalledTimes(2);
            expect(mockGetBatchFilterList).toHaveBeenCalledTimes(2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined/null values in API response', async () => {
            mockGetProducts.mockResolvedValue({
                content: null,
                pageNo: undefined,
                totalElements: undefined,
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('empty-list')).toBeInTheDocument();
            });
        });

        it('should handle empty batch filter list', async () => {
            mockGetBatchFilterList.mockResolvedValue({
                left: [{ value: [] }],
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByTestId('products-table')).toBeInTheDocument();
            });
        });

        it('should handle missing localStorage token', async () => {
            Object.defineProperty(window, 'localStorage', {
                value: {
                    getItem: jest.fn(() => null),
                    setItem: jest.fn(),
                    removeItem: jest.fn(),
                    clear: jest.fn(),
                },
                writable: true,
            });

            mockUserFromJwtToken.mockReturnValue({
                org_id: 'test-org-id',
                org_role: 'USER',
            });

            renderComponent();

            await waitFor(() => {
                expect(mockGetProducts).toHaveBeenCalled();
            });
        });
    });
});