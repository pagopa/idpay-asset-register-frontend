import { renderWithContext } from '../../utils/__tests__/test-utils';
import useTCAgreement from '../useTCAgreement';

jest.mock('../../services/rolePermissionService');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const returnVal = {};
const HookWrapper = () => {
  Object.assign(returnVal, useTCAgreement());
  // result = useTCAgreement();
  return null;
};

describe('test suite for usTCAgreement hook', () => {
  test('call of useTCAgreement hook', () => {
    renderWithContext(<HookWrapper />);
  });
});
