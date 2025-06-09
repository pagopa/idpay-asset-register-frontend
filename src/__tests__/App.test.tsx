/* istanbul ignore file */

import App from '../App';
import '../locale';
import { renderWithContext } from '../utils/__tests__/test-utils';

jest.mock('@pagopa/mui-italia/dist/components/Footer/Footer', () => ({
  Footer: () => {},
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000/registro-dei-beni',
  }),
}));

const mockSignOutFn = jest.fn();

jest.mock('../services/rolePermissionService');
jest.mock('../decorators/withLogin');
jest.mock('../decorators/withSelectedPartyProducts');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('Test suite for App component', () => {
  test('Render App with TOS accepted', () => {
    renderWithContext(<App />);
  });

  test('Render App with TOS not accepted', () => {
    jest.mock('../hooks/useTCAgreement', () => () => ({
      isTOSAccepted: true,
      acceptTOS: mockSignOutFn,
      firstAcceptance: false,
    }));
    renderWithContext(<App />);
  });
});
