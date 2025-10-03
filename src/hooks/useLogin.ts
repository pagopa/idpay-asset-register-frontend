import isEmpty from 'lodash/isEmpty';
import { useDispatch } from 'react-redux';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { userActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';
import { storageTokenOps, storageUserOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { parseJwt } from '../utils/jwt-utils';
import { JWTUser } from '../model/JwtUser';
import { IDPayUser } from '../model/IDPayUser';
import {ENV} from "../utils/env";

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
  const jwtUser = parseJwt(token);
  return {
    uid: jwtUser.uid,
    taxCode: jwtUser?.org_fc || '',
    name: jwtUser.name,
    surname: jwtUser.family_name,
    email: jwtUser?.email || '',
    org_name: jwtUser?.org_name || jwtUser?.organization?.name,
    org_party_role: jwtUser?.org_party_role || jwtUser?.organization?.roles[0]?.role,
    org_role: jwtUser?.org_role || '',
    org_address: jwtUser?.org_address || '',
    org_pec: jwtUser?.org_pec || '',
    org_taxcode: jwtUser?.org_fc || '',
    org_vat: jwtUser?.org_vat || '',
    org_email: jwtUser?.org_email || '',
    org_id: jwtUser?.org_id || jwtUser?.organization?.id
  };
};

/** A custom hook used to obtain a function to check if there is a valid JWT token, loading into redux the logged user object */
export const useLogin = () => {
  const dispatch = useDispatch();
  const setUser = (user: User) => dispatch(userActions.setLoggedUser(user));

  const attemptSilentLogin = async () => {
    if (CONFIG.MOCKS.MOCK_USER) {
     //  setUser(mockedUser);
      if(!CONFIG.TEST.JWT){
        window.location.assign(ENV.URL_FE.LOGIN);
      } else {
        const mockedUserFromJWT = userFromJwtTokenAsJWTUser(CONFIG.TEST.JWT);
        setUser(mockedUserFromJWT);
        storageTokenOps.write(CONFIG.TEST.JWT);
        //  storageUserOps.write(mockedUser);
        storageUserOps.write(mockedUserFromJWT);

        return;
      }
    }

    const token = storageTokenOps.read();

    const sessionStorageUser = storageUserOps.read();

    if (!token) {
      window.location.assign(ENV.URL_FE.LOGIN);
    }
    if (isEmpty(sessionStorageUser)) {
      const user: User = userFromJwtToken(token);
      storageUserOps.write(user);
      setUser(user);

    } else {
      // Otherwise, set the user to the one stored in the storage
      setUser(sessionStorageUser);
    }
  };

  return { attemptSilentLogin };
};
