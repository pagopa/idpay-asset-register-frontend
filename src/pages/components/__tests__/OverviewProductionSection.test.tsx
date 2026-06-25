import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverviewProductionSection from '../OverviewProductionSection';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@testing-library/jest-dom';

const mockTranslations = {
  'pages.overview.overviewTitleBoxProdTitle': 'Gestione Prodotti',
  'pages.overview.overviewTitleBoxProdDescription': 'Carica i tuoi prodotti per iniziare',
  'pages.overview.overviewTitleBoxProdBtn': 'Carica Prodotti',
  'pages.overview.allUploadsLink': 'Vedi i caricamenti',
  'pages.overview.tableHeader': 'stato caricamenti',
  'pages.overview.warning':
    'Stiamo effettuando i controlli. Quando saranno completati, ti avviseremo via email e potrai consultare i dettagli nelle sezioni dedicate.',
  'errors.uploadsList.errorDescription': 'Errore nel caricamento dei dati',
  tableHeader: 'stato caricamenti',
  warning:
    'Stiamo effettuando i controlli. Quando saranno completati, ti avviseremo via email e potrai consultare i dettagli nelle sezioni dedicate.',
  allUploadsLink: 'Vedi i caricamenti',
};

const mockT = (key: string) => mockTranslations[key as keyof typeof mockTranslations] ?? key;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({
    t: mockT,
    isLoading: false,
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

const mockUseCurrentInitiativeId = jest.fn();
jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => mockUseCurrentInitiativeId(),
}));

const mockGetProductFilesList = jest.fn();
jest.mock('../../../services/registerService', () => ({
  getProductFilesList: (...args: any) => mockGetProductFilesList(...args),
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    ADD_PRODUCTS: '/home/:initiativeId/aggiungi-prodotti',
    UPLOADS: '/home/:initiativeId/storico-caricamenti',
  },
}));

const theme = createTheme();
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </BrowserRouter>
);

type UploadRow = {
  productFileId?: string;
  batchName?: string;
  uploadStatus?: string;
  dateUpload?: string;
};

const mockUploadsResponse = (rows: Array<UploadRow> = []) => {
  mockGetProductFilesList.mockResolvedValue({ data: { content: rows } });
};

const singleUpload = (overrides: UploadRow = {}): UploadRow => ({
  productFileId: '1',
  batchName: 'Batch 1',
  uploadStatus: 'LOADED',
  dateUpload: '2023-07-15T10:30:45Z',
  ...overrides,
});

const renderSection = (props: { isOperativeEmailMissing?: boolean } = {}) =>
  render(
    <TestWrapper>
      <OverviewProductionSection {...props} />
    </TestWrapper>
  );

describe('OverviewProductionSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProductFilesList.mockReset();
    mockUseCurrentInitiativeId.mockReturnValue('initiative-1');
    mockOnExit.mockImplementation((cb) => cb());
  });

  it('renders loading state', () => {
    mockGetProductFilesList.mockImplementation(() => new Promise(() => {}));
    renderSection();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty data state', async () => {
    mockUploadsResponse([]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Carica i tuoi prodotti per iniziare')).toBeInTheDocument();
    });
  });

  it('renders completed uploads', async () => {
    mockUploadsResponse([singleUpload()]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Ultimo caricamento')).toBeInTheDocument();
    });
  });

  it('renders in-progress uploads with warning', async () => {
    mockUploadsResponse([singleUpload({ uploadStatus: 'UPLOADED', dateUpload: '2023-07-15T10:30:00Z' })]);
    renderSection();
    await waitFor(() => {
      expect(
        screen.getByText(
          'Stiamo effettuando i controlli. Quando saranno completati, ti avviseremo via email e potrai consultare i dettagli nelle sezioni dedicate.'
        )
      ).toBeInTheDocument();
    });
  });

  it('does not show upload button when status is IN_PROCESS', async () => {
    mockUploadsResponse([singleUpload({ uploadStatus: 'IN_PROCESS', dateUpload: '2023-07-15T10:30:00Z' })]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('stato caricamenti')).toBeInTheDocument();
    });
    expect(screen.queryByText(/ultimo caricamento/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /carica prodotti/i })).toBeInTheDocument();
  });

  it('navigates to add products with the current initiative id', async () => {
    mockUploadsResponse([]);
    const user = userEvent.setup();
    renderSection();

    await user.click(await screen.findByRole('button', { name: /carica prodotti/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/home/initiative-1/aggiungi-prodotti', {
      replace: true,
    });
  });

  it('keeps upload button enabled when operative email is missing', async () => {
    mockUploadsResponse([]);
    renderSection({ isOperativeEmailMissing: true });

    expect(await screen.findByRole('button', { name: /carica prodotti/i })).toBeEnabled();
  });

  it('renders PARTIAL status chip', async () => {
    mockUploadsResponse([singleUpload({ uploadStatus: 'PARTIAL' })]);
    renderSection();
    expect(await screen.findByText('Parziale')).toBeInTheDocument();
  });

  it('renders unknown status chip with raw status label (default branch)', async () => {
    mockUploadsResponse([singleUpload({ uploadStatus: 'SOMETHING_ELSE' })]);
    renderSection();
    expect(await screen.findByText('SOMETHING_ELSE')).toBeInTheDocument();
  });

  it('renders EMPTY_DATA chip when uploadStatus is missing (nullish coalescing)', async () => {
    mockUploadsResponse([singleUpload({ uploadStatus: undefined })]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('stato caricamenti')).toBeInTheDocument();
    });
  });

  it('renders EMPTY_DATA in the date cell when dateUpload is missing', async () => {
    mockUploadsResponse([singleUpload({ dateUpload: undefined })]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Ultimo caricamento')).toBeInTheDocument();
    });
  });

  it('falls back to EMPTY_DATA when dateUpload is an invalid date string', async () => {
    mockUploadsResponse([singleUpload({ dateUpload: 'not-a-date' })]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Ultimo caricamento')).toBeInTheDocument();
    });
  });

  it('renders IN_PROCESS variant with EMPTY_DATA when dateUpload is missing', async () => {
    mockUploadsResponse([singleUpload({ uploadStatus: 'IN_PROCESS', dateUpload: undefined })]);
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('Ultimo caricamento')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /carica prodotti/i })).toBeDisabled();
  });

  it('does not navigate from the upload button when initiativeId is missing', async () => {
    mockUseCurrentInitiativeId.mockReturnValue(undefined);
    mockUploadsResponse([]);
    const user = userEvent.setup();
    renderSection();

    await user.click(await screen.findByRole('button', { name: /carica prodotti/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockOnExit).not.toHaveBeenCalled();
  });

  it('does not navigate from the "all uploads" link when initiativeId is missing', async () => {
    mockUseCurrentInitiativeId.mockReturnValue(undefined);
    mockUploadsResponse([singleUpload()]);
    const user = userEvent.setup();
    renderSection();

    await user.click(await screen.findByRole('button', { name: /vedi i caricamenti/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders the error state when getProductFilesList rejects', async () => {
    mockGetProductFilesList.mockRejectedValue(new Error('boom'));
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Carica i tuoi prodotti per iniziare')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /carica prodotti/i })).toBeDisabled();
  });

  it('navigates to uploads history with the current initiative id', async () => {
    mockUploadsResponse([singleUpload()]);
    const user = userEvent.setup();
    renderSection();

    await user.click(await screen.findByRole('button', { name: /vedi i caricamenti/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/home/initiative-1/storico-caricamenti', {
      replace: true,
    });
  });
});
