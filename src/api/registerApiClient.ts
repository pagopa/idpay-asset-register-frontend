import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import {
  buildFetchApi,
  extractResponse,
} from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { createClient, WithDefaultsT } from './generated/register/client';
import { UserPermissionDTO } from './generated/register/UserPermissionDTO';
import { PortalConsentDTO } from './generated/register/PortalConsentDTO';
import { UploadsListDTO } from './generated/register/UploadsListDTO';

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

const registerClient = createClient({
  baseUrl: ENV.URL_API.REGISTER,
  basePath: '',
  fetchApi: buildFetchApi(ENV.API_TIMEOUT_MS.REGISTER),
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
    const result = await rolePermissionClient.userPermission({}); // TODO modify
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

{
  /*
export const RegisterApi = {  
  getProductFiles: async (
    params: Parameters<typeof registerClient.getProductFilesList>[0] = {}
  ): Promise<UploadsListDTO> => {
    const result = await registerClient.getProductFilesList(params);
    return extractResponse(result, 200, onRedirectToLogin);
  }
};
*/
}
{
  /*
export const RegisterApi = {  
  getProductFiles: async (
    page?: number,
    size?: number,
    sort?: string
  ): Promise<UploadsListDTO> => {
    const result = await registerClient.getProductFilesList({
      page,size,sort
    });
    return extractResponse(result, 200, onRedirectToLogin);
  }
};

*/}


export const RegisterApi = {
  getProductFiles: async (page?: number, size?: number, sort?: string): Promise<UploadsListDTO> => {
    try {
      // Costruisci l'oggetto dei parametri senza undefined senza modificare oggetti esistenti
      const params = {
        ...(page !== undefined ? { page } : {}),
        ...(size !== undefined ? { size } : {}),
        ...(sort !== undefined ? { sort } : {}),
      };

      const result = await registerClient.getProductFilesList(params);
      console.log(
        '*********RegisterApi  Risultato della chiamata API:         ***************************',
        JSON.stringify(result)
      );
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      // Puoi loggare o gestire l’errore come preferisci
      console.error('Errore durante il recupero dei file prodotto:', error);
      throw error;
    }
  },
  getProducts: async (page?: number, size?: number, sort?: string): Promise<UploadsListDTO> => {
    try {
      // Costruisci l'oggetto dei parametri senza undefined senza modificare oggetti esistenti
      const params = {
        ...(page !== undefined ? { page } : {}),
        ...(size !== undefined ? { size } : {}),
        ...(sort !== undefined ? { sort } : {}),
      };

      const result = await registerClient.getProducts(params);
      console.log(
        '*********RegisterApi  Risultato della chiamata API:         ***************************',
        JSON.stringify(result)
      );
      return extractResponse(result, 200, onRedirectToLogin);
    } catch (error) {
      // Puoi loggare o gestire l’errore come preferisci
      console.error('Errore durante il recupero dei file prodotto:', error);
      throw error;
    }
  },
};
