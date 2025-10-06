import { Box } from '@mui/material';
import { Footer } from '@pagopa/selfcare-common-frontend/lib';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelectors } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';
import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router';
import {
  storageTokenOps,
  storageUserOps,
} from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import Header from '../Header/Header';
import ROUTES from '../../routes';

type Props = {
  children?: React.ReactNode;
};

import { ENV } from '../../utils/env';

const Layout = ({ children }: Props) => {
  const customExitAction = () => {
    storageTokenOps.delete();
    storageUserOps.delete();
    Object.keys(localStorage).forEach((key) => {
      if (
        key.toLowerCase().includes('filter') ||
        key === 'user' ||
        key === 'token' ||
        key.startsWith('persist:')
      ) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.toLowerCase().includes('filter') || key === 'user' || key === 'token') {
        sessionStorage.removeItem(key);
      }
    });

    window.location.assign(ENV.URL_FE.LOGOUT);
  };

  const onExit = useUnloadEventOnExit();
  const loggedUser = useSelector(userSelectors.selectLoggedUser);
  const location = useLocation();
  const [, setShowAssistanceInfo] = useState(true);

  const match =
    matchPath({ path: ROUTES.HOME, end: true }, location.pathname) ||
    matchPath({ path: ROUTES.PRODUCTS, end: true }, location.pathname) ||
    matchPath({ path: ROUTES.INVITALIA_PRODUCTS_LIST, end: true }, location.pathname) ||
    matchPath({ path: ROUTES.PRODUCERS, end: true }, location.pathname) ||
    matchPath({ path: ROUTES.UPLOADS, end: true }, location.pathname);

  useEffect(() => {
    setShowAssistanceInfo(location.pathname !== ROUTES.ASSISTANCE);
  }, [location.pathname]);

  return (
    <Box
      display="grid"
      gridTemplateColumns="1fr"
      gridTemplateRows="auto 1fr auto"
      gridTemplateAreas={`"header"
                          "body"
                          "footer"`}
      minHeight="100vh"
    >
      <Box gridArea="header">
        <Header
            onExit={() => onExit(customExitAction)}
            loggedUser={loggedUser}
            parties={[]}
            withSecondHeader={false}
        />
      </Box>
      {match !== null ? (
        <Box gridArea="body" display="grid" gridTemplateColumns="minmax(300px, 2fr) 10fr">
          <Box
            gridColumn="auto"
            sx={{ backgroundColor: '#F5F5F5' }}
            display="grid"
            justifyContent="center"
            pb={16}
            pt={2}
            px={2}
            gridTemplateColumns="1fr"
          >
            {children}
          </Box>
        </Box>
      ) : (
        <Box
          gridArea="body"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          justifyContent="center"
        >
          <Box
            display="grid"
            justifyContent="center"
            gridColumn="span 12"
            maxWidth={
              location.pathname !== ROUTES.PRIVACY_POLICY && location.pathname !== ROUTES.TOS
                ? 920
                : '100%'
            }
            justifySelf="center"
          >
            {children}
          </Box>
        </Box>
      )}
      <Box gridArea="footer">
        <Footer onExit={() => onExit(customExitAction)} loggedUser={true} />
      </Box>
    </Box>
  );
};
export default Layout;
