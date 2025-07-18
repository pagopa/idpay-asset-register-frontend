import { RolePermissionApi } from '../../api/registerApiClient';
import { getUserPermission } from '../../services/rolePermissionService';

jest.mock('../../utils/env', () => ({
  default: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    URL_FE: {
      LOGOUT: 'https://mock-api/logout',
    },
    API_TIMEOUT_MS: 5000,
  },
}));

jest.mock('../../api/registerApiClient', () => ({
  RolePermissionApi: {
    userPermission: jest.fn().mockResolvedValue({ data: 'mockedData' }),
    getPortalConsent: jest.fn(),
    savePortalConsent: jest.fn()
  },
}));

beforeEach(() => {
  (RolePermissionApi.userPermission as jest.Mock).mockResolvedValue({ data: 'mockedData' });
});

test('test get user permission', async () => {
  await getUserPermission();
  expect(RolePermissionApi.userPermission).toBeCalled();
});
