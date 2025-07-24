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
    HOME: '/home'
  },
  BASE_ROUTE: '/base'
}));
import ROUTES from '../../../routes';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import BreadcrumbsBox from '../BreadcrumbsBox';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for BreadcrumbsBox', () => {
  test('render BreadcrumbsBox', () => {
    renderWithContext(
      <BreadcrumbsBox
        backUrl={ROUTES.HOME}
        backLabel="Indietro"
        items={['Level1', 'Level2', 'Level3']}
      />
    );
  });
});
