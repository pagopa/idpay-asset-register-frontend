import { RolePermissionApiMocked } from '../../api/__mocks__/rolePermissionApiClient';

export const mockedPermission = {
  role: 'admin',
  permissions: [
    {
      name: 'readIntitativeList',
      description: 'read initiatives list in homepage',
      mode: 'enabled',
    },
  ],
};

export const mockedPortalConsent = {};

export const savePortalConsent = () => RolePermissionApiMocked.savePortalConsent();
