import i18n from "@pagopa/selfcare-common-frontend/lib/locale/locale-utils";
import {buildFetchApi, extractResponse} from "@pagopa/selfcare-common-frontend/lib/utils/api-utils";
import {appStateActions} from "@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice";
import {storageTokenOps} from "@pagopa/selfcare-common-frontend/lib/utils/storage";
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { createClient, WithDefaultsT } from './generated/register/client';
import { UserPermissionDTO } from './generated/register/UserPermissionDTO';
import { PortalConsentDTO } from './generated/register/PortalConsentDTO';

const withBearerAndPartyId: WithDefaultsT<'Bearer'> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    Bearer: `Bearer ${token}`,
  });
};

const rolePermissionClient = createClient({
  baseUrl: ENV.URL_API.ROLE_PERMISSION,
  basePath: '',
  fetchApi: buildFetchApi(ENV.API_TIMEOUT_MS.ROLE_PERMISSION),
  withDefaults: withBearerAndPartyId,
});

const onRedirectToLogin = () =>
  store.dispatch(
    appStateActions.addError({
      id: 'tokenNotValid',
      error: new Error(),
      techDescription: 'token expired or not valid',
      toNotify: false,
      blocking: false,
      displayableTitle: i18n.t('session.expired.title'),
      displayableDescription: i18n.t('session.expired.message'),
    })
  );

export const RolePermissionApi = {
  userPermission: async (): Promise<UserPermissionDTO> => {
    const result = await rolePermissionClient.userPermission({});
    return extractResponse(result, 200, onRedirectToLogin);
  },

  getPortalConsent: async (): Promise<PortalConsentDTO> => {
    const result = await rolePermissionClient.getPortalConsent({});
    return extractResponse(result, 200, onRedirectToLogin);
  },

  savePortalConsent: async (versionId: string | undefined): Promise<void> => {
    const result = await rolePermissionClient.savePortalConsent({ body: { versionId } });
    return extractResponse(result, 200, onRedirectToLogin);
  },
};
