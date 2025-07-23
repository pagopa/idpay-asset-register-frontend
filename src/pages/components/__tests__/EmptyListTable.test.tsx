import { renderWithContext } from '../../../utils/__tests__/test-utils';
import EmptyListTable from '../EmptyListTable';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for EmptyList', () => {
  test('render EmptyList', () => {
    renderWithContext(<EmptyListTable message="message" />);
  });
});
