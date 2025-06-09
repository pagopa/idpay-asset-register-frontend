import { RolePermissionApiMocked } from '../../api/__mocks__/rolePermissionApiClient';

import { getUserPermission } from '../__mocks__/rolePermissionService';

jest.mock('../../api/rolePermissionApiClient');

beforeEach(() => {
  jest.spyOn(RolePermissionApiMocked, 'userPermission');
});

test('test get user permission', async () => {
  await getUserPermission();
  expect(RolePermissionApiMocked.userPermission).toBeCalled();
});
