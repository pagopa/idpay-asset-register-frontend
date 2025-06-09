import { userSelectors } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { IDPayUser } from '../model/IDPayUser';

import { useAppSelector } from '../redux/hooks';

export const useIDPayUser = () => {
  const user = useAppSelector(userSelectors.selectLoggedUser);
  return user as IDPayUser;
};
