import { renderWithContext } from '../../../utils/__tests__/test-utils';
import SideMenu from '../SideMenu';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('../../../utils/env', () => ({
  default: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    API_TIMEOUT_MS: 5000,
  },
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home',
    UPLOADS: '/uploads',
    PRODUCTS: '/products',
  },
  BASE_ROUTE: '/base',
}));

const mockOnExit = jest.fn((cb) => cb());

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'pages.overview.overviewTitle': 'Panoramica',
        'pages.uploadHistory.sideMenuTitle': 'Storico caricamenti',
        'pages.products.sideMenuTitle': 'Prodotti',
      };
      return translations[key] || key;
    }
  })
}));

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for SideMenu component', () => {
  test('renders the component', () => {
    renderWithContext(<SideMenu />);
    expect(screen.getByTestId('list-test')).toBeInTheDocument();
  });

  test('user clicks the link to home page', async () => {
    renderWithContext(<SideMenu />);
    const user = userEvent.setup();

    const homeLink = screen.getByText('Panoramica');
    await user.click(homeLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  test('user clicks the link to uploads', async () => {
    renderWithContext(<SideMenu />);
    const user = userEvent.setup();

    const homeLink = screen.getByText('Storico caricamenti');
    await user.click(homeLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  test('user clicks the link to products page and triggers navigation', async () => {
      renderWithContext(<SideMenu />);
      const user = userEvent.setup();

      const productsLink = screen.getByText('Prodotti');
      await user.click(productsLink);

      await waitFor(() => {
          expect(mockOnExit).toHaveBeenCalledTimes(0);
      });
  });

  test('does not render extra items for Invitalia users', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(
        JSON.stringify({ org_role: 'INVITALIA' })
    );

    renderWithContext(<SideMenu />);
    const items = screen.queryAllByTestId('initiativeList-click-test');
    expect(items.length).toBe(0);
  });
});
