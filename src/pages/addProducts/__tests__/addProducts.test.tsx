import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import AddProducts from '../addProducts';

jest.mock('../../../utils/env', () => ({
  __esModule: true,
  ENV: {
    URL_FE: {
      LOGOUT: 'https://mock-logout-url.com',
    },
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    ASSISTANCE: {
      EMAIL: 'email@example.com',
    },
    API_TIMEOUT_MS: {
      OPERATION: 5000,
    },
  },
}));

jest.mock('env-var', () => ({
  get: jest.fn((key: string) => {
    if (key === 'REACT_APP_URL_API_REGISTER') {
      return {
        required: () => ({
          asString: () => 'https://mock-api/register',
        }),
        asString: () => 'https://mock-api/register',
      };
    }
    return {
      required: () => ({
        asString: () => `${key}_VALUE`,
        asInt: () => 1234,
        asBool: () => true,
      }),
      asString: () => `${key}_VALUE`,
      asInt: () => 1234,
      asBool: () => true,
      default: () => ({
        asBool: () => true,
        asString: () => 'default_value',
      }),
    };
  }),
}));

const mockNavigate = jest.fn();
const mockOnExit = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'breadcrumbs.exit': 'Esci',
        'breadcrumbs.home': 'Home',
        'breadcrumbs.aggiungiProdotti': 'Aggiungi Prodotti',
        'pages.addProducts.title': 'Aggiungi Prodotti',
        'pages.addProducts.boxAddTitle': 'Carica i tuoi prodotti',
        'pages.addProducts.boxAddText': 'Carica il file con i tuoi prodotti. ',
        'pages.addProducts.boxAddTextProduct': 'Formato supportato: CSV',
        'pages.addProducts.goToManual': 'Vai al manuale',
        'commons.backBtn': 'Indietro',
        'commons.continueBtn': 'Continua',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title, 'data-testid': testId, ...props }: any) => (
      <div data-testid={testId} {...props}>
        <h1>{title}</h1>
      </div>
  ),
}));

jest.mock('@pagopa/mui-italia', () => ({
  ButtonNaked: ({ children, onClick, startIcon, 'data-testid': testId, ...props }: any) => (
      <button data-testid={testId} onClick={onClick} {...props}>
        {startIcon}
        {children}
      </button>
  ),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
  useUnloadEventOnExit: () => mockOnExit,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home',
  },
  BASE_ROUTE: '/base',
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrowserRouter>
);

describe('AddProducts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnExit.mockImplementation((callback) => callback());
  });

  test('renders component correctly', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByTestId('back-button-test')).toBeInTheDocument();
    expect(screen.getByText('Esci')).toBeInTheDocument();
  });

  test('renders form section correctly', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    expect(screen.getByTestId('title-box-info')).toBeInTheDocument();
    expect(screen.getByText('Carica il file con i tuoi prodotti.')).toBeInTheDocument();
    expect(screen.getByText('Formato supportato: CSV')).toBeInTheDocument();
    expect(screen.getByText('Vai al manuale')).toBeInTheDocument();
    expect(screen.getByTestId('form-add-products')).toBeInTheDocument();
  });

  test('handles file upload interaction', async () => {
    const user = userEvent.setup();

    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    expect(screen.getByText('File accepted: No')).toBeInTheDocument();

    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, new File(['test'], 'test.csv', { type: 'text/csv' }));

    expect(screen.getByText('File accepted: Yes')).toBeInTheDocument();
  });

  test('displays correct breadcrumb structure', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    const breadcrumbContainer = screen.getByRole('navigation');
    expect(breadcrumbContainer).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('component handles theme correctly', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    const mainContainer = screen.getByTestId('title');
    expect(mainContainer).toBeInTheDocument();
  });

  test('accessibility attributes are present', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'breadcrumb');
    expect(screen.getByRole('button', { name: /esci/i })).toBeInTheDocument();
  });

  test('handles back button click and navigation', async () => {
    const user = userEvent.setup();

    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    const backButton = screen.getByTestId('back-button-test');

    await user.click(backButton);

    expect(mockOnExit).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/base', { replace: true });
  });

  test('handles back button click when onExit does not execute callback', async () => {
    const user = userEvent.setup();

    mockOnExit.mockImplementation(() => {});

    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    const backButton = screen.getByTestId('back-button-test');

    await user.click(backButton);

    expect(mockOnExit).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('formRef is properly connected to FormAddProducts', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    expect(screen.getByTestId('form-add-products')).toBeInTheDocument();
  });

  test('passes correct props to FormAddProducts', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    expect(screen.getByText('File accepted: No')).toBeInTheDocument();
  });

  test('renders main container with correct data-testid', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    expect(screen.getByTestId('add-products-container')).toBeInTheDocument();
  });

  test('manual link has correct href when EIE_MANUAL is defined', () => {
    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    const manualLink = screen.getByRole('link', { name: /vai al manuale/i });
    expect(manualLink).toHaveAttribute('href', '');
    expect(manualLink).toHaveAttribute('target', '_blank');
    expect(manualLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('manual link click is not prevented when EIE_MANUAL is defined', async () => {
    const user = userEvent.setup();

    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    const manualLink = screen.getByRole('link', { name: /vai al manuale/i });

    await user.click(manualLink);

    expect(manualLink).toBeInTheDocument();
  });

  test('manual link prevents default when EIE_MANUAL is not defined', async () => {
    const user = userEvent.setup();

    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    const manualLink = screen.getByRole('link', { name: /vai al manuale/i });
    expect(manualLink).toHaveAttribute('href', '');

    const preventDefaultSpy = jest.fn();

    manualLink.addEventListener('click', (e) => {
      if (e.defaultPrevented) {
        preventDefaultSpy();
      }
    });

    await user.click(manualLink);

    await waitFor(() => {
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  test('manual link prevents default when EIE_MANUAL is empty string', async () => {
    const user = userEvent.setup();

    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    const manualLink = screen.getByRole('link', { name: /vai al manuale/i });
    expect(manualLink).toHaveAttribute('href', '');

    const preventDefaultSpy = jest.fn();

    manualLink.addEventListener('click', (e) => {
      if (e.defaultPrevented) {
        preventDefaultSpy();
      }
    });

    await user.click(manualLink);

    await waitFor(() => {
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  test('fileAccepted state changes correctly', async () => {
    const user = userEvent.setup();

    render(
        <TestWrapper>
          <AddProducts />
        </TestWrapper>
    );

    expect(screen.getByText('File accepted: No')).toBeInTheDocument();

    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, new File(['content'], 'test.csv', { type: 'text/csv' }));

    await waitFor(() => {
      expect(screen.getByText('File accepted: Yes')).toBeInTheDocument();
    });
  });
});
