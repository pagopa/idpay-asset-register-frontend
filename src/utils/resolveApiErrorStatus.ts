import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { store } from '../redux/store';
import { ApiError } from '../api/ApiError';
import { DEBUG_CONSOLE } from './constants';

/**
 * Centralized API error resolver.
 * Handles HTTP status codes and OpenAPI-defined error codes
 * in a single place.
 */
export const resolveApiErrorStatus = (error: ApiError): void => {
  const { status } = error;

  switch (status) {
    case 401:
      store.dispatch(
        appStateActions.addError({
          id: 'tokenNotValid',
          error: new Error(),
          techDescription: 'Unauthorized - token invalid or expired',
          toNotify: false,
          blocking: false,
          displayableTitle: 'Session expired',
          displayableDescription: 'Please login again',
        })
      );

      storageUserOps.delete();
      window.location.assign(CONFIG.URL_FE.LOGIN);
      break;

    case 403:
      if (DEBUG_CONSOLE) {
        console.warn('Forbidden access', error);
      }
      break;

    case 404:
      if (DEBUG_CONSOLE) {
        console.warn('Resource not found', error);
      }
      break;

    case 429:
      if (DEBUG_CONSOLE) {
        console.warn('Too many requests', error);
      }
      break;

    case 500:
      if (DEBUG_CONSOLE) {
        console.error('Server error', error);
      }
      break;

    default:
      break;
  }
};
