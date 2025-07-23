import {
    getUserPermission,
    getPortalConsent,
    savePortalConsent,
} from '../rolePermissionService';
import { RolePermissionApi } from '../../api/registerApiClient';

jest.mock('../../api/registerApiClient', () => ({
    RolePermissionApi: {
        userPermission: jest.fn(),
        getPortalConsent: jest.fn(),
        savePortalConsent: jest.fn(),
    },
}));

describe('RolePermissionService', () => {
    it('getUserPermission calls API and returns data', async () => {
        const mockData = { role: 'admin' };
        (RolePermissionApi.userPermission as jest.Mock).mockResolvedValue(mockData);

        const result = await getUserPermission();
        expect(RolePermissionApi.userPermission).toHaveBeenCalled();
        expect(result).toEqual(mockData);
    });

    it('getPortalConsent calls API and returns data', async () => {
        const mockData = { version: '1.0', accepted: true };
        (RolePermissionApi.getPortalConsent as jest.Mock).mockResolvedValue(mockData);

        const result = await getPortalConsent();
        expect(RolePermissionApi.getPortalConsent).toHaveBeenCalled();
        expect(result).toEqual(mockData);
    });

    it('savePortalConsent calls API with versionId', async () => {
        (RolePermissionApi.savePortalConsent as jest.Mock).mockResolvedValue(undefined);

        await savePortalConsent('v1');
        expect(RolePermissionApi.savePortalConsent).toHaveBeenCalledWith('v1');
    });
});
