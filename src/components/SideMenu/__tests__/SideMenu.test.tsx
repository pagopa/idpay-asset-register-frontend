import { renderWithContext } from '../../../utils/__tests__/test-utils';
import SideMenu from '../SideMenu';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ROUTES from '../../../routes';

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
    const user = userEvent.setup();
    const homeLink = await screen.findByTestId('initiativeList-click-test');
    await user.click(homeLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe(ROUTES.HOME);
    });
  });

  test('renders all menu items for non-Invitalia users', async () => {
    renderWithContext(<SideMenu />);
    const items = await screen.findAllByTestId('initiativeList-click-test');
    expect(items.length).toBe(3);
  });

  test('does not render extra items for Invitalia users', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(
        JSON.stringify({ org_role: 'INVITALIA' })
    );

    renderWithContext(<SideMenu />);
    const items = await screen.findAllByTestId('initiativeList-click-test');
    expect(items.length).toBe(1);
  });
});
