import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OverviewProductionSection from '../OverviewProductionSection';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@testing-library/jest-dom';

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
        HOME: '/home',
        PRODUCTS: '/prodotti',
        ADD_PRODUCTS: '/aggiungi-prodotti',
    },
    BASE_ROUTE: '/base',
}));

const mockGetProductFilesList = jest.fn();
jest.mock('../../../api/registerApiClient', () => ({
    __esModule: true,
    getProductFilesList: (...args: any) => mockGetProductFilesList(...args),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: any) => key,
    }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
    useUnloadEventOnExit: () => (cb: () => any) => cb(),
}));

const mockData = {
    content: [
        {
            productFileId: 'file123',
            batchName: 'Batch A',
            dateUpload: '2025-07-21T10:00:00Z',
            findedProductsNumber: 5,
            addedProductNumber: 3,
            uploadStatus: 'LOADED',
        },
    ],
};

const store = configureStore({ reducer: () => ({}) });
const theme = createTheme();

const renderComponent = () =>
    render(
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <MemoryRouter>
                    <OverviewProductionSection />
                </MemoryRouter>
            </ThemeProvider>
        </Provider>
    );

describe('OverviewProductionSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        mockGetProductFilesList.mockImplementation(() => new Promise(() => {}));
        renderComponent();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders data correctly after fetch', async () => {
        mockGetProductFilesList.mockResolvedValue(mockData);
        renderComponent();
        await waitFor(() => {
            expect(screen.getByTestId('title-box-prod')).toBeInTheDocument();
            expect(screen.getByText('Batch A')).toBeInTheDocument();
            expect(screen.getByText('Vedi i caricamenti')).toBeInTheDocument();
        });
    });

    it('renders error state if API fails', async () => {
        mockGetProductFilesList.mockRejectedValue(new Error('API Error'));
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('errors.uploadsList.errorDescription')).toBeInTheDocument();
        });
    });

    it('navigates to add products on button click', async () => {
        mockGetProductFilesList.mockResolvedValue(mockData);
        renderComponent();
        await waitFor(() => {
            const button = screen.getByText('pages.overview.overviewTitleBoxProdBtn');
            fireEvent.click(button);
        });
        expect(mockNavigate).toHaveBeenCalledWith('/aggiungi-prodotti', { replace: true });
    });
});
