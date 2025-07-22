import { renderWithContext } from '../../../utils/__tests__/test-utils';
import EmptyList from '../EmptyListTable';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for EmptyList', () => {
  test('render EmptyList', () => {
    renderWithContext(<EmptyList message="message" />);
  });
});
