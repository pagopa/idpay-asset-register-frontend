import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OverviewProductionSection from '../OverviewProductionSection';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@testing-library/jest-dom';

const mockTranslations = {
    'pages.overview.overviewTitleBoxProdTitle': 'Gestione Prodotti',
    'pages.overview.overviewTitleBoxProdDescription': 'Carica i tuoi prodotti per iniziare',
    'pages.overview.overviewTitleBoxProdBtn': 'Carica Prodotti',
    'errors.uploadsList.errorDescription': 'Errore nel caricamento dei dati',
};

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => mockTranslations[key] || key,
    }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const mockOnExit = jest.fn((cb) => cb());
jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
    useUnloadEventOnExit: () => mockOnExit,
}));

const mockGetProductFilesList = jest.fn();
jest.mock('../../../services/registerService', () => ({
    getProductFilesList: (...args: any) => mockGetProductFilesList(...args),
}));

jest.mock('../../../routes', () => ({
    __esModule: true,
    default: {
        ADD_PRODUCTS: '/add-products',
        UPLOADS: '/uploads',
    },
}));

const theme = createTheme();
const TestWrapper = ({ children }) => (
    <BrowserRouter>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrowserRouter>
);

describe('OverviewProductionSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state', () => {
        mockGetProductFilesList.mockImplementation(() => new Promise(() => {}));
        render(<TestWrapper><OverviewProductionSection /></TestWrapper>);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders error state', async () => {
        mockGetProductFilesList.mockRejectedValue(new Error('API Error'));
        render(<TestWrapper><OverviewProductionSection /></TestWrapper>);
        await waitFor(() => {
            expect(screen.getByText('Carica i tuoi prodotti per iniziare')).toBeInTheDocument();
        });
    });

    it('renders empty data state', async () => {
        mockGetProductFilesList.mockResolvedValue({ content: [] });
        render(<TestWrapper><OverviewProductionSection /></TestWrapper>);
        await waitFor(() => {
            expect(screen.getByText('Carica i tuoi prodotti per iniziare')).toBeInTheDocument();
        });
    });

    it('renders completed uploads', async () => {
        mockGetProductFilesList.mockResolvedValue({
            content: [
                {
                    productFileId: '1',
                    batchName: 'Batch 1',
                    uploadStatus: 'LOADED',
                    dateUpload: '2023-07-15T10:30:00Z',
                },
            ],
        });
        render(<TestWrapper><OverviewProductionSection /></TestWrapper>);
        await waitFor(() => {
            expect(screen.getByText(/ultimo caricamento/i)).toBeInTheDocument();
        });
    });

    it('renders in-progress uploads with warning', async () => {
        mockGetProductFilesList.mockResolvedValue({
            content: [
                {
                    productFileId: '1',
                    batchName: 'Batch 1',
                    uploadStatus: 'UPLOADED',
                    dateUpload: '2023-07-15T10:30:00Z',
                },
            ],
        });
        render(<TestWrapper><OverviewProductionSection /></TestWrapper>);
        await waitFor(() => {
            expect(screen.getByText(/stiamo effettuando i controlli/i)).toBeInTheDocument();
        });
    });

    it('does not show upload button when status is IN_PROCESS', async () => {
        mockGetProductFilesList.mockResolvedValue({
            content: [
                {
                    productFileId: '1',
                    batchName: 'Batch 1',
                    uploadStatus: 'IN_PROCESS',
                    dateUpload: '2023-07-15T10:30:00Z',
                },
            ],
        });
        render(<TestWrapper><OverviewProductionSection /></TestWrapper>);
        await waitFor(() => {
            expect(screen.getByText('STATO CARICAMENTI')).toBeInTheDocument();
        });
        expect(screen.queryByText(/ultimo caricamento/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /carica prodotti/i })).not.toBeInTheDocument();
    });
});
