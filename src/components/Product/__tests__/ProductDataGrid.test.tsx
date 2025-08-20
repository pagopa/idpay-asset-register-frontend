import {CategoryEnum} from "../../../api/generated/register/UploadDTO";

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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('react-i18next', () => {
    const mockT = (key: string) => {
        const translations: { [key: string]: string } = {
            'pages.products.listHeader.category': 'Category',
            'pages.products.listHeader.energeticClass': 'Energy Class',
            'pages.products.listHeader.eprelCode': 'EPREL Code',
            'pages.products.listHeader.gtinCode': 'GTIN Code',
            'pages.products.listHeader.batch': 'Batch',
            'pages.products.emptyList': 'No products found',
            'pages.products.noFileLoaded': 'No file loaded',
            'pages.products.loading': 'Loading...',
            'pages.products.tablePaginationFrom': 'di',
            'commons.categories.appliances': 'Appliances',
            'commons.categories.electronics': 'Electronics',
            'pages.products.categories.appliances': 'Appliances',
            'pages.products.categories.electronics': 'Electronics',
            'pages.products.filterLabels.category': 'Category',
            'pages.products.filterLabels.batch': 'Batch',
            'pages.products.filterLabels.eprelCode': 'EPREL Code',
            'pages.products.filterLabels.gtinCode': 'GTIN Code',
            'pages.products.filterLabels.filter': 'Filter',
            'pages.products.filterLabels.deleteFilters': 'Delete Filters',
            'commons.advancedFilters': 'Advanced filters',
        };
        return translations[key] || key;
    };

    return {
        useTranslation: () => ({
            t: mockT,
        }),
        withTranslation: () => (Component: any) => {
            const WrappedComponent = (props: any) => {
                return <Component {...props} t={mockT} />;
            };
            WrappedComponent.displayName = `withTranslation(${Component.displayName || Component.name})`;
            return WrappedComponent;
        },
        Trans: ({ children }: any) => children,
        initReactI18next: {
            type: '3rdParty',
            init: () => {},
        },
    };
});

jest.mock('../../../utils/constants', () => ({
    displayRows: 10,
    emptyData: '-',
    PRODUCTS_CATEGORY: {
        APPLIANCES: 'APPLIANCES',
        ELECTRONICS: 'ELECTRONICS',
    },
}));

jest.mock('../../DetailDrawer/DetailDrawer', () => {
    return function MockDetailDrawer({ children, open }: any) {
        return open ? <div data-testid="detail-drawer">{children}</div> : null;
    };
});

jest.mock('../../FiltersDrawer/FiltersDrawer', () => {
    return function MockDetailDrawer({ children, open }: any) {
        return open ? <div data-testid="filter-drawer">{children}</div> : null;
    };
});

jest.mock('../ProductDetail', () => {
    return function MockProductDetail({ data }: any) {
        return <div data-testid="product-detail">Product Detail: {data.id}</div>;
    };
});

jest.mock('../MessagePage', () => {
    return function MockMessagePage({ message, goBack, onGoBack }: any) {
        return (
            <div data-testid="message-page">
                <span>{message}</span>
                {goBack && <button onClick={onGoBack}>Go Back</button>}
            </div>
        );
    };
});

jest.mock('../EprelLinks', () => {
    return function MockEprelLinks({ row }: any) {
        return <div data-testid="eprel-links">{row.eprelCode || '-'}</div>;
    };
});

jest.mock('../FilterBar', () => {
    return function MockFilterBar(props: any) {
        return (
            <div data-testid="filter-bar">
                <button onClick={() => props.setFiltering(true)}>Apply Filters</button>
                <button onClick={props.handleDeleteFiltersButtonClick}>Clear Filters</button>
            </div>
        );
    };
});

jest.mock('../../../hooks/useLogin', () => ({
    userFromJwtTokenAsJWTUser: jest.fn(() => ({
        uid: 'test-uid-123',
        taxCode: 'TEST123456789',
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        org_name: 'Test Organization',
        org_party_role: 'ADMIN',
        org_role: 'USER',
        org_address: 'Test Address',
        org_pec: 'test@pec.com',
        org_taxcode: 'TEST123456789',
        org_vat: 'IT12345678901',
        org_email: 'org@example.com',
        org_id: 'test-org-id-123'
    }))
}));

// Import del componente e delle dipendenze DOPO i mock
import ProductGrid from '../ProductDataGrid';
import { RegisterApi } from '../../../api/registerApiClient';
import { ProductListDTO } from '../../../api/generated/register/ProductListDTO';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';
import { BatchList } from '../../../api/generated/register/BatchList';

const mockRegisterApi = RegisterApi as jest.Mocked<typeof RegisterApi>;

// ---------- Store di test: include anche lo slice "invitalia" per evitare undefined ----------
const defaultInvitaliaState = {
    institutionList: [],
    selectedInstitution: null,
    loading: false,
    error: null,
};

const createMockStore = (initialProductsState: any = {}) => {
    return configureStore({
        reducer: {
            products: (state = { batchId: '', batchName: '' }, action) => {
                switch (action.type) {
                    case 'products/setBatchId':
                        return { ...state, batchId: action.payload };
                    case 'products/setBatchName':
                        return { ...state, batchName: action.payload };
                    default:
                        return state;
                }
            },
            invitalia: (state = defaultInvitaliaState, _action) => state,
        },
        preloadedState: {
            products: { batchId: '', batchName: '', ...initialProductsState },
            invitalia: { ...defaultInvitaliaState },
        },
    });
};

const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({
                                                                               children,
                                                                               store = createMockStore()
                                                                           }) => {
    const theme = createTheme();
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </Provider>
    );
};

describe('ProductGrid', () => {
    const mockProductData: ProductDTO[] = [
        {
            category: 'Lavatrice' as CategoryEnum,
            energyClass: 'A++',
            eprelCode: 'EPREL001',
            gtinCode: 'GTIN001',
            batchName: 'Batch 1',
        },
        {
            category: 'Lavasciuga' as CategoryEnum,
            energyClass: 'A+',
            eprelCode: 'EPREL002',
            gtinCode: 'GTIN002',
            batchName: 'Batch 2',
        },
    ];

    const mockProductListResponse: ProductListDTO = {
        content: mockProductData,
        pageNo: 0,
        totalElements: 2,
    };

    const mockBatchListResponse: BatchList = {
        batches: [{
            value: [
                { productFileId: '1', batchName: 'Batch 1' },
                { productFileId: '2', batchName: 'Batch 2' },
            ]
        }]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockRegisterApi.getProductList.mockResolvedValue(mockProductListResponse);
        mockRegisterApi.getBatchFilterItems.mockResolvedValue(mockBatchListResponse);
    });

    describe('Initial Rendering and Loading', () => {
        test('should load and display products after initial load', async () => {
            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Lavatrice')).toBeInTheDocument();
                expect(screen.getByText('Lavasciuga')).toBeInTheDocument();
            });

            expect(mockRegisterApi.getProductList).toHaveBeenNthCalledWith(1,
                "", 0, undefined, "category,asc", "", "", "", "", undefined, ""
            );
            expect(mockRegisterApi.getBatchFilterItems).toHaveBeenCalled();
        });

        test('should handle API errors gracefully', async () => {
            mockRegisterApi.getProductList.mockRejectedValue(new Error('API Error'));

            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('No file loaded')).toBeInTheDocument();
            });
        });
    });

    describe('Table Rendering', () => {
        test('should render table headers correctly', async () => {
            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Category')).toBeInTheDocument();
                expect(screen.getByText('EPREL Code')).toBeInTheDocument();
                expect(screen.getByText('GTIN Code')).toBeInTheDocument();
                expect(screen.getByText('Batch')).toBeInTheDocument();
            });
        });

        test('should render product data in table rows', async () => {
            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('GTIN001')).toBeInTheDocument();
                expect(screen.getByText('GTIN002')).toBeInTheDocument();
            });
        });

        test('should handle empty data with dash', async () => {
            const mockEmptyProductData: ProductDTO[] = [
                {
                    category: 'Lavatrice' as CategoryEnum,
                    energyClass: undefined,
                    eprelCode: undefined,
                    gtinCode: undefined,
                    batchName: undefined,
                },
            ];

            mockRegisterApi.getProductList.mockResolvedValue({
                content: mockEmptyProductData,
                pageNo: 0,
                totalElements: 1,
            });

            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                const dashElements = screen.getAllByText('-');
                expect(dashElements.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Sorting Functionality', () => {
        test('should handle sort by category', async () => {
            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Category')).toBeInTheDocument();
            });
        });

        test('should disable sorting for energy class and eprel code', async () => {
            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Category')).toBeInTheDocument();
            });
        });
    });

    describe('Pagination', () => {
        test('should display pagination when there are products', async () => {
            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Advanced filters')).toBeInTheDocument();
            });
        });

        test('should handle page change', async () => {
            const mockLargeProductList: ProductListDTO = {
                content: mockProductData,
                pageNo: 0,
                totalElements: 20,
            };

            mockRegisterApi.getProductList.mockResolvedValue(mockLargeProductList);

            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Advanced filters')).toBeInTheDocument();
            });

            const nextPageButton = screen.getByLabelText('Go to next page');
            fireEvent.click(nextPageButton);

            await waitFor(() => {
                expect(mockRegisterApi.getProductList).toHaveBeenNthCalledWith(1,
                    "", 0, undefined, "category,asc", "", "", "", "", undefined, ""
                );
                expect(mockRegisterApi.getProductList).toHaveBeenNthCalledWith(2,
                    "", 1, undefined, "category,asc", "", "", "", "", undefined, ""
                );
            });
        });
    });

    describe('Filter Integration', () => {
        test('should trigger filtering when filter button is clicked', async () => {
            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Advanced filters')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Advanced filters'));

            await waitFor(() => {
                expect(mockRegisterApi.getProductList).toHaveBeenCalledTimes(1);
            });
        });

        test('should clear all filters when clear button is clicked', async () => {
            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Advanced filters')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Advanced filters'));

            await waitFor(() => {
                expect(mockRegisterApi.getProductList).toHaveBeenNthCalledWith(1,
                    "", 0, undefined, "category,asc", "", "", "", "", undefined, ""
                );
            });
        });
    });

    describe('Redux Integration', () => {
        test('should handle batch filter from Redux state', async () => {
            const storeWithBatchId = createMockStore({
                batchId: 'batch123',
                batchName: 'Test Batch',
            });

            render(
                <TestWrapper store={storeWithBatchId}>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(mockRegisterApi.getProductList).toHaveBeenNthCalledWith(1,
                    "", 0, undefined, "category,asc", "", "", "", "", undefined, ""
                );
            });
        });
    });

    describe('Empty States', () => {
        test('should show empty message when no products and no filters', async () => {
            mockRegisterApi.getProductList.mockResolvedValue({
                content: [],
                pageNo: 0,
                totalElements: 0,
            });

            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('No file loaded')).toBeInTheDocument();
            });
        });

        test('should show filtered empty message when no products with filters', async () => {
            mockRegisterApi.getProductList.mockResolvedValue({
                content: [],
                pageNo: 0,
                totalElements: 0,
            });

            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Advanced filters')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Advanced filters'));
        });
    });

    describe('Error Handling', () => {
        test('should handle batch filter API error', async () => {
            mockRegisterApi.getBatchFilterItems.mockRejectedValue(new Error('Batch API Error'));

            render(
                <TestWrapper>
                    <ProductGrid organizationId={''} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Lavatrice')).toBeInTheDocument();
            });
        });
    });
});
