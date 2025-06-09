import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import { useSelector } from 'react-redux';
import { userSelectors } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { useLocation } from 'react-router-dom';
import { Footer } from '@pagopa/selfcare-common-frontend';
import Header from '../Header/Header';
import ROUTES from '../../routes';

type Props = {
  children?: React.ReactNode;
};

const TOSLayout = ({ children }: Props) => {
  const onExit = useUnloadEventOnExit();
  const loggedUser = useSelector(userSelectors.selectLoggedUser);
  const location = useLocation();
  const [showAssistanceInfo, setShowAssistanceInfo] = useState(true);
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

      <Box gridArea="body">{children}</Box>

      <Box gridArea="footer">
        <Footer onExit={onExit} loggedUser={true} />
      </Box>
    </Box>
  );
};

export default TOSLayout;
