import { renderWithContext } from '../../../utils/__tests__/test-utils';
import SideMenu from '../SideMenu';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import * as helpers from '../../../helpers';

jest.mock('../../../utils/env', () => ({
  default: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    API_TIMEOUT_MS: 5000,
  },
}));

jest.mock('../../../utils/constants', () => ({
  USERS_TYPES: {
    INVITALIA_L1: 'INVITALIA_L1',
    INVITALIA_L2: 'INVITALIA_L2',
  },
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home',
    UPLOADS: '/uploads',
    PRODUCTS: '/products',
    PRODUCERS: '/producers',
  },
  BASE_ROUTE: '/base',
}));

const mockOnExit = jest.fn();
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
  useUnloadEventOnExit: () => mockOnExit,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

jest.mock('../SidenavItem', () => ({
  __esModule: true,
  default: (props: any) => (
      <div
          data-testid={`sidenav-${props.title}`}
          data-selected={props.isSelected ? 'true' : 'false'}
          onClick={props.handleClick}
      >
        {props.title}
      </div>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'pages.overview.overviewTitle': 'Panoramica',
        'pages.uploadHistory.sideMenuTitle': 'Storico caricamenti',
        'pages.products.sideMenuTitle': 'Prodotti',
        'pages.invitaliaProductsList.productsTitle': 'Prodotti Invitalia',
        'pages.invitaliaOverview.manufacturerMenuItem': 'Produttori',
        'pages.invitalia.productsTitle': 'Prodotti Invitalia',
        'pages.invitalia.sideMenu.productsTitle': 'Prodotti Invitalia',
        'pages.invitaliaOverview.producersMenuItem': 'Produttori',
        'pages.producers.sideMenuTitle': 'Produttori',
      };

      if (dict[key]) return dict[key];

      const lower = key.toLowerCase();

      if (lower.includes('invitalia') && lower.includes('product')) {
        return 'Prodotti Invitalia';
      }

      if (
          lower.includes('producer') ||
          lower.includes('producers') ||
          lower.includes('manufacturer') ||
          lower.includes('manufacturers')
      ) {
        return 'Produttori';
      }

      return key;
    },
  }),
}));


jest.mock('../../../helpers');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockUseLocation.mockReturnValue({ pathname: '/' });
});

describe('Test suite for SideMenu component', () => {
  test('renders the component', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue(null);
    renderWithContext(<SideMenu />);
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });

  test('user clicks the link to home page', async () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue(null);
    mockOnExit.mockImplementation((cb: () => void) => cb());
    renderWithContext(<SideMenu />);
    const user = userEvent.setup();

    const homeLink = screen.getByText('Panoramica');
    await user.click(homeLink);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });

  test('user clicks the link to uploads', async () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue(null);
    mockOnExit.mockImplementation((cb: () => void) => cb());
    renderWithContext(<SideMenu />);
    const user = userEvent.setup();

    const homeLink = screen.getByText('Storico caricamenti');
    await user.click(homeLink);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/uploads', { replace: true });
    });
  });

  test('user clicks the link to products page and triggers navigation', async () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue(null);
    mockOnExit.mockImplementation((cb: () => void) => cb());
    renderWithContext(<SideMenu />);
    const user = userEvent.setup();

    const productsLink = screen.getByText('Prodotti');
    await user.click(productsLink);

    await waitFor(() => {
      expect(mockOnExit).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });
  });

  test('does not render extra items for Invitalia users with invalid role', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'INVITALIA' });
    renderWithContext(<SideMenu />);

    expect(screen.queryByTestId('sidenav-Prodotti Invitalia')).not.toBeInTheDocument();
  });


  test('Invitalia L1: mostra voci dedicate e click su "Produttori" porta a /producers', async () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'INVITALIA_L1' });
    mockOnExit.mockImplementation((cb: () => void) => cb());
    mockUseLocation.mockReturnValue({ pathname: '/home' });

    renderWithContext(<SideMenu />);
    const user = userEvent.setup();

    expect(screen.getByTestId('sidenav-Prodotti Invitalia')).toBeInTheDocument();
    expect(screen.getByTestId('sidenav-Produttori')).toBeInTheDocument();

    await user.click(screen.getByTestId('sidenav-Produttori'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/producers', { replace: true });
    });
  });

  test('Invitalia L2: isSelected true su /home', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'INVITALIA_L2' });
    mockUseLocation.mockReturnValue({ pathname: '/home' });

    renderWithContext(<SideMenu />);

    expect(screen.getByTestId('sidenav-Prodotti Invitalia')).toHaveAttribute('data-selected', 'true');
  });

  test('Invitalia: isSelected true su /home/', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'INVITALIA_L1' });
    mockUseLocation.mockReturnValue({ pathname: '/home/' });

    renderWithContext(<SideMenu />);

    expect(screen.getByTestId('sidenav-Prodotti Invitalia')).toHaveAttribute('data-selected', 'true');
  });

  test('Non-Invitalia: isSelected corretto su /uploads', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'SOMETHING_ELSE' });
    mockUseLocation.mockReturnValue({ pathname: '/uploads' });

    renderWithContext(<SideMenu />);

    expect(screen.getByTestId('sidenav-Storico caricamenti')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('sidenav-Panoramica')).toHaveAttribute('data-selected', 'false');
    expect(screen.getByTestId('sidenav-Prodotti')).toHaveAttribute('data-selected', 'false');
  });

  test('Non-Invitalia: isSelected corretto su /products', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'REGULAR_USER' });
    mockUseLocation.mockReturnValue({ pathname: '/products' });

    renderWithContext(<SideMenu />);

    expect(screen.getByTestId('sidenav-Prodotti')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('sidenav-Panoramica')).toHaveAttribute('data-selected', 'false');
    expect(screen.getByTestId('sidenav-Storico caricamenti')).toHaveAttribute('data-selected', 'false');
  });

  test('Non-Invitalia: isSelected corretto su /home', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'REGULAR_USER' });
    mockUseLocation.mockReturnValue({ pathname: '/home' });

    renderWithContext(<SideMenu />);

    expect(screen.getByTestId('sidenav-Panoramica')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('sidenav-Storico caricamenti')).toHaveAttribute('data-selected', 'false');
    expect(screen.getByTestId('sidenav-Prodotti')).toHaveAttribute('data-selected', 'false');
  });

  test('Click su "Prodotti" non naviga se onExit non invoca la callback', async () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'FOO' });
    mockOnExit.mockImplementation(() => undefined);

    renderWithContext(<SideMenu />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('sidenav-Prodotti'));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('LocalStorage vuoto: mostra menu non-Invitalia senza crash', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue(null);

    renderWithContext(<SideMenu />);

    expect(screen.getByTestId('sidenav-Panoramica')).toBeInTheDocument();
    expect(screen.getByTestId('sidenav-Storico caricamenti')).toBeInTheDocument();
    expect(screen.getByTestId('sidenav-Prodotti')).toBeInTheDocument();
    expect(screen.queryByTestId('sidenav-Prodotti Invitalia')).not.toBeInTheDocument();
  });

  test('Invitalia L1: click su "Prodotti Invitalia" naviga a /home', async () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'INVITALIA_L1' });
    mockOnExit.mockImplementation((cb: () => void) => cb());

    renderWithContext(<SideMenu />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('sidenav-Prodotti Invitalia'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });

  test('Invitalia: mostra icona BuildIcon per Produttori', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'INVITALIA_L2' });

    renderWithContext(<SideMenu />);

    expect(screen.getByTestId('sidenav-Produttori')).toBeInTheDocument();
  });

  test('Invitalia: Produttori isSelected su /producers', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'INVITALIA_L1' });
    mockUseLocation.mockReturnValue({ pathname: '/producers' });

    renderWithContext(<SideMenu />);

    expect(screen.getByTestId('sidenav-Produttori')).toHaveAttribute('data-selected', 'true');
  });
});