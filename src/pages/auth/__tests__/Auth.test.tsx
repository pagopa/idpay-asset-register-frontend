import { render, waitFor } from '@testing-library/react';
import Auth from '../Auth';
import * as analyticsService from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import * as storage from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import * as useLogin from '../../../hooks/useLogin';
import { ENV } from '../../../utils/env';
import ROUTES from '../../../routes';


jest.mock('../../../utils/env', () => ({
  ENV: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    URL_FE: {
      LOGIN: '/mock-login',
      PRE_LOGIN: '/mock-pre-login',
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

jest.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService');
jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage');
jest.mock('../../../hooks/useLogin');

describe('Auth component', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.resetAllMocks();
    delete (window as any).location;
    window.location = { assign: jest.fn(), hash: '#token=mock-token' } as any;
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  it('should handle successful login and redirect to home', async () => {
    const mockUser = { name: 'Test User' };
    const mockInnerToken = 'inner-token';

    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      text: () => Promise.resolve(mockInnerToken),
    });

    (useLogin.userFromJwtTokenAsJWTUser as jest.Mock).mockReturnValue(mockUser);

    const writeTokenMock = jest.spyOn(storage.storageTokenOps, 'write');
    const writeUserMock = jest.spyOn(storage.storageUserOps, 'write');
    const trackEventMock = jest.spyOn(analyticsService, 'trackEvent');

    render(<Auth />);

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledWith('AUTH_SUCCESS');
      expect(writeTokenMock).toHaveBeenCalledWith(mockInnerToken);
      expect(writeUserMock).toHaveBeenCalledWith(mockUser);
      expect(window.location.assign).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });

  it('should redirect to login if token is missing', async () => {
    window.location.hash = '#token=';

    const trackAppErrorMock = jest.spyOn(analyticsService, 'trackAppError');

    render(<Auth />);

    await waitFor(() => {
      expect(trackAppErrorMock).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'INVALIDAUTHREQUEST',
          })
      );
      expect(window.location.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGIN);
    });
  });

  it('should redirect to login on fetch error', async () => {
    window.location.hash = '#token=mock-token';

    (global.fetch as jest.Mock) = jest.fn().mockRejectedValue(new Error('fetch failed'));

    render(<Auth />);

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGIN);
    });
  });
});
