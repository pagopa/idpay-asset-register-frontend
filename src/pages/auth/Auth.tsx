import {
  trackEvent,
} from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useEffect } from 'react';
import { userFromJwtTokenAsJWTUser } from '../../hooks/useLogin';
import { IDPayUser } from '../../model/IDPayUser';
import ROUTES from '../../routes';

export const readUserFromToken = (token: string) => {
  const user: IDPayUser = userFromJwtTokenAsJWTUser(token);
  if (user) {
    storageUserOps.write(user);
  }
  return user;
};

/** success login operations */
const Auth = () => {
  useEffect(() => {
    const { hash = '' } = window.location;
    const urlToken = hash.replace('#token=', '');

    if (urlToken !== '' && urlToken !== undefined) {
      trackEvent('AUTH_SUCCESS');

      storageTokenOps.write(urlToken);
      const user = readUserFromToken(urlToken);
      if (user) {
        window.location.assign(ROUTES.HOME);
      }
    }
  }, []);

  return <div />;
};

export default Auth;
