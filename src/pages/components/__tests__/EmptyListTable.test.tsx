import { renderWithContext } from '../../../utils/__tests__/test-utils';
import EmptyListTable from '../EmptyListTable';
import {jest} from "@jest/globals";

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({ data: [], isLoading: false }),
}));

describe('test suite for EmptyList', () => {
  test('render EmptyList', () => {
    renderWithContext(<EmptyListTable message="message" />);
  });
});
