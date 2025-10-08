import { renderWithContext } from '../../../utils/__tests__/test-utils';
import TOSLayout from '../TOSLayout';

jest.mock('../../../utils/env', () => ({
  __esModule: true,
  ENV: {
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

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for TOSLayout', () => {
  test('test render TosLayout', () => {
    renderWithContext(<TOSLayout />);
  });
});
