import { AxiosResponse } from 'axios';
import { PortalConsentDTO } from '../api/generated/register';
import { UserPermissionDTO } from '../api/generated/register';
import { RolePermissionApi } from '../api/registerApiClient';

export const getUserPermission = (): Promise<AxiosResponse<UserPermissionDTO>> =>
  RolePermissionApi.userPermission().then((res) => res);

export const getPortalConsent = (): Promise<AxiosResponse<PortalConsentDTO>> =>
  RolePermissionApi.getPortalConsent().then((res) => res);
export const savePortalConsent = (
  versionId: string | undefined
): Promise<AxiosResponse<void> | undefined> =>
  RolePermissionApi.savePortalConsent(versionId).then((res) => res);
