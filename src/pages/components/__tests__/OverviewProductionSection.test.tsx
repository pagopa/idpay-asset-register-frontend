import { render, screen, waitFor } from '@testing-library/react';
import OverviewProductionSection from '../OverviewProductionSection';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@testing-library/jest-dom';

const mockTranslations = {
  'pages.overview.overviewTitleBoxProdTitle': 'Gestione Prodotti',
  'pages.overview.overviewTitleBoxProdDescription': 'Carica i tuoi prodotti per iniziare',
  'pages.overview.overviewTitleBoxProdBtn': 'Carica Prodotti',
  'errors.uploadsList.errorDescription': 'Errore nel caricamento dei dati',
  tableHeader: 'stato caricamenti',
  warning:
    'Stiamo effettuando i controlli. Quando saranno completati, ti avviseremo via email e potrai consultare i dettagli nelle sezioni dedicate.',
  allUploadsLink: 'Vedi i caricamenti',
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => mockTranslations[key as keyof typeof mockTranslations] ?? key,
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
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
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
    render(
      <TestWrapper>
        <OverviewProductionSection />
      </TestWrapper>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty data state', async () => {
    mockGetProductFilesList.mockResolvedValue({ content: [] });
    render(
      <TestWrapper>
        <OverviewProductionSection />
      </TestWrapper>
    );
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
          dateUpload: '2023-07-15T10:30:45Z',
        },
      ],
    });
    render(
      <TestWrapper>
        <OverviewProductionSection />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByText('Ultimo caricamento')).toBeInTheDocument();
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
    render(
      <TestWrapper>
        <OverviewProductionSection />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByText('pages.overview.warning')).toBeInTheDocument();
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
    render(
      <TestWrapper>
        <OverviewProductionSection />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByText('pages.overview.tableHeader')).toBeInTheDocument();
    });
    expect(screen.queryByText(/ultimo caricamento/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /carica prodotti/i })).toBeInTheDocument();
  });
});
