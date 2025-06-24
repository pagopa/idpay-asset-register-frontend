import { PortalConsentDTO } from '../api/generated/role-permission/PortalConsentDTO';
import { UserPermissionDTO } from '../api/generated/role-permission/UserPermissionDTO';
import { RolePermissionApi } from '../api/rolePermissionApiClient';

export const getUserPermission = (): Promise<UserPermissionDTO> => RolePermissionApi.userPermission().then((res) => res);

export const getPortalConsent = (): Promise<PortalConsentDTO> => RolePermissionApi.getPortalConsent().then((res) => res);
export const savePortalConsent = (versionId: string | undefined): Promise<void> => RolePermissionApi.savePortalConsent(versionId).then((res) => res);
