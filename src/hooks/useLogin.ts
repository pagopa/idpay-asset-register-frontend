import { useDispatch } from 'react-redux';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { userActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { parseJwt } from '../utils/jwt-utils';
import { JWTUser } from '../model/JwtUser';
import { IDPayUser } from '../model/IDPayUser';

export const userFromJwtToken: (token: string) => User = function (token: string) {
  const jwtUser: JWTUser = parseJwt(token);
  return {
    uid: jwtUser.uid,
    taxCode: jwtUser.org_fc,
    name: jwtUser.name,
    surname: jwtUser.family_name,
    email: jwtUser.email,
    org_name:jwtUser.org_name,
    org_party_role: jwtUser.org_party_role,
    org_role: jwtUser.org_role,
    org_address: jwtUser.org_address,
    org_pec: jwtUser.org_pec,
    org_taxcode: jwtUser.org_fc,
    org_vat: jwtUser.org_vat,
    org_email: jwtUser.org_email
  };
};

// eslint-disable-next-line sonarjs/no-identical-functions
export const userFromJwtTokenAsJWTUser: (token: string) => IDPayUser = function (token: string) {
  const jwtUser: JWTUser = parseJwt(token);
  return {
    uid: jwtUser.uid,
    taxCode: jwtUser.org_fc,
    name: jwtUser.name,
    surname: jwtUser.family_name,
    email: jwtUser.email,
    org_name: jwtUser.org_name,
    org_party_role: jwtUser.org_party_role,
    org_role: jwtUser.org_role,
    org_address: jwtUser.org_address,
    org_pec: jwtUser.org_pec,
    org_taxcode: jwtUser.org_fc,
    org_vat: jwtUser.org_vat,
    org_email: jwtUser.org_email,
    org_id: jwtUser.org_id
  };
};

/** A custom hook used to obtain a function to check if there is a valid JWT token, loading into redux the logged user object */
export const useLogin = () => {
  const dispatch = useDispatch();
  const setUser = (user: User) => dispatch(userActions.setLoggedUser(user));

  const attemptSilentLogin = async () => {
    if (CONFIG.MOCKS.MOCK_USER) {
     //  setUser(mockedUser);
       const mockedUserFromJWT = userFromJwtTokenAsJWTUser(CONFIG.TEST.JWT);
       setUser(mockedUserFromJWT);
      storageTokenOps.write(CONFIG.TEST.JWT);
    //  storageUserOps.write(mockedUser);
      storageUserOps.write(mockedUserFromJWT);

      return;
    }

    const token = storageTokenOps.read();

    // If there are no credentials, it is impossible to get the user, so
    if (!token) {
      // Remove any partial data that might have remained, just for safety
      storageUserOps.delete();
      // Go to the login view
      window.location.assign(CONFIG.URL_FE.LOGIN);
      // This return is necessary
    }
  };

  return { attemptSilentLogin };
};
