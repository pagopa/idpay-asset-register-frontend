import { renderWithContext } from '../../../utils/__tests__/test-utils';
import SideMenu from '../SideMenu';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ROUTES, { BASE_ROUTE } from '../../../routes';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for SideMenu component', () => {
  test('Render component', () => {
    renderWithContext(<SideMenu />);
  });

  test('User clicks the link to home page', async () => {
    const { history } = renderWithContext(<SideMenu />);
    const link = await screen.findByText('pages.overview.overviewTitle');
    const user = userEvent.setup();
    await user.click(link);
    await waitFor(() => expect(history.location.pathname === ROUTES.HOME).toBeTruthy());
  });

  test('User clicks to an accordion title to collapse it', async () => {
    const link = await screen.findByText('Iniziativa mock 1234');
    const user = userEvent.setup();
    await user.click(link);
    await waitFor(() => expect(link.ariaExpanded).toBeFalsy());
  });

  test('Appropriate item expanded based on parameter id value', () => {
    const mockedLocation = {
      assign: jest.fn(),
      pathname: `${BASE_ROUTE}/sconti-iniziativa/1234`,
      origin: 'MOCKED_ORIGIN',
      search: '',
      hash: '',
    };
    Object.defineProperty(window, 'location', { value: mockedLocation });
    renderWithContext(<SideMenu />);
  });
});
