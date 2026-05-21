import { ApiError } from '../../api/ApiError';

const mockDispatch = jest.fn();
const mockAddError = jest.fn((payload) => payload);
const mockDeleteUser = jest.fn();
const mockAssign = jest.fn();

jest.mock('../../redux/store', () => ({
  store: { dispatch: mockDispatch },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: mockAddError },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageUserOps: { delete: mockDeleteUser },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/config/env', () => ({
  CONFIG: { URL_FE: { LOGIN: 'http://login' } },
}));

const loadResolver = (debugConsole: boolean) => {
  jest.resetModules();
  jest.doMock('../constants', () => ({ DEBUG_CONSOLE: debugConsole }));
  return require('../resolveApiErrorStatus') as typeof import('../resolveApiErrorStatus');
};

describe('resolveApiErrorStatus', () => {
  const originalLocation = window.location;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    delete (window as any).location;
    (window as any).location = { assign: mockAssign };
  });

  afterAll(() => {
    (window as any).location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddError.mockImplementation((payload) => payload);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('handles 401 by dispatching an error, deleting user storage, and redirecting to login', () => {
    const { resolveApiErrorStatus } = loadResolver(false);

    resolveApiErrorStatus(new ApiError(401, 'Unauthorized'));

    expect(mockAddError).toHaveBeenCalledWith({
      id: 'tokenNotValid',
      error: new Error(),
      techDescription: 'Unauthorized - token invalid or expired',
      toNotify: false,
      blocking: false,
      displayableTitle: 'Session expired',
      displayableDescription: 'Please login again',
    });
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ id: 'tokenNotValid' }));
    expect(mockDeleteUser).toHaveBeenCalledTimes(1);
    expect(mockAssign).toHaveBeenCalledWith('http://login');
  });

  it.each([
    [403, 'Forbidden access'],
    [404, 'Resource not found'],
    [429, 'Too many requests'],
  ])('logs a warning for status %s when debug console is enabled', (status, message) => {
    const { resolveApiErrorStatus } = loadResolver(true);
    const error = new ApiError(status, 'Request failed');

    resolveApiErrorStatus(error);

    expect(warnSpy).toHaveBeenCalledWith(message, error);
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockAssign).not.toHaveBeenCalled();
  });

  it('logs an error for 500 when debug console is enabled', () => {
    const { resolveApiErrorStatus } = loadResolver(true);
    const error = new ApiError(500, 'Server failed');

    resolveApiErrorStatus(error);

    expect(errorSpy).toHaveBeenCalledWith('Server error', error);
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockAssign).not.toHaveBeenCalled();
  });

  it.each([403, 404, 429, 500])(
    'does not log for status %s when debug console is disabled',
    (status) => {
      const { resolveApiErrorStatus } = loadResolver(false);

      resolveApiErrorStatus(new ApiError(status, 'Request failed'));

      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockAssign).not.toHaveBeenCalled();
    }
  );

  it('ignores unhandled statuses', () => {
    const { resolveApiErrorStatus } = loadResolver(true);

    resolveApiErrorStatus(new ApiError(418, 'Unhandled'));

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockAssign).not.toHaveBeenCalled();
  });
});
