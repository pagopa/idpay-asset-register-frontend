import { Box } from '@mui/material';
import { Footer } from '@pagopa/selfcare-common-frontend';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelectors } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router';
import Header from '../Header/Header';
import SideMenu from '../SideMenu/SideMenu';
import ROUTES from '../../routes';
import routes from '../../routes';

type Props = {
  children?: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const onExit = useUnloadEventOnExit();
  const loggedUser = useSelector(userSelectors.selectLoggedUser);
  const location = useLocation();
  const [showAssistanceInfo, setShowAssistanceInfo] = useState(true);

  const match = matchPath(location.pathname, {
    path: [ROUTES.HOME],
    exact: true,
    strict: false,
  });

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
          withSecondHeader={showAssistanceInfo}
          onExit={onExit}
          loggedUser={loggedUser}
          parties={[]}
        />
      </Box>
      {match !== null ? (
        <Box gridArea="body" display="grid" gridTemplateColumns="minmax(300px, 2fr) 10fr">
          <Box gridColumn="auto" sx={{ backgroundColor: 'background.paper' }}>
            <SideMenu />
          </Box>
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
            pb={16}
            pt={2}
            gridColumn="span 12"
            maxWidth={
              location.pathname !== routes.PRIVACY_POLICY && location.pathname !== routes.TOS
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
        <Footer onExit={onExit} loggedUser={true} />
      </Box>
    </Box>
  );
};
// export default withParties(Layout);
export default Layout;
