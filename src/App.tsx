import {Redirect, Route, Switch, useLocation} from "react-router-dom";
import {
    ErrorBoundary,
    LoadingOverlay,
    UnloadEventHandler,
    UserNotifyHandle
} from "@pagopa/selfcare-common-frontend/lib";
import withSelectedPartyProducts from './decorators/withSelectedPartyProducts';
import withLogin from './decorators/withLogin';
import Layout from './components/Layout/Layout';
import Auth from './pages/auth/Auth';
import TOSWall from './components/TOS/TOSWall';
import TOSLayout from './components/TOSLayout/TOSLayout';
import routes from './routes';
import useTCAgreement from './hooks/useTCAgreement';
import GestioneBeni from './pages/gestioneBeni/gestioneBeni';

const SecuredRoutes = withLogin(
  withSelectedPartyProducts(() => {
    const location = useLocation();
    const { isTOSAccepted, acceptTOS, firstAcceptance } = useTCAgreement();

    if (
      isTOSAccepted === false &&
      location.pathname !== routes.PRIVACY_POLICY &&
      location.pathname !== routes.TOS
    ) {
      return (
        <TOSLayout>
          <TOSWall
            acceptTOS={acceptTOS}
            privacyRoute={routes.PRIVACY_POLICY}
            tosRoute={routes.TOS}
            firstAcceptance={firstAcceptance}
          />
        </TOSLayout>
      );
    } else if (
      typeof isTOSAccepted === 'undefined' &&
      location.pathname !== routes.PRIVACY_POLICY &&
      location.pathname !== routes.TOS
    ) {
      return <></>;
    }

    return (
      <Layout>
        <Switch>
          <Route path={routes.HOME} exact={true}>
            <GestioneBeni />
          </Route>
          {/* <Route path={routes.TOS} exact={true}>
            <TOS />
          </Route>
          <Route path={routes.PRIVACY_POLICY} exact={true}>
            <PrivacyPolicy />
          </Route> */}
          <Route path="*">
            <Redirect to={routes.HOME} />
          </Route>
        </Switch>
      </Layout>
    );
  })
);

const App = () => (
  <ErrorBoundary>
    <LoadingOverlay />
    <UserNotifyHandle />
    <UnloadEventHandler />
    <Switch>
      <Route path={routes.AUTH}>
        <Auth />
      </Route>
      <Route path="*">
        <SecuredRoutes />
      </Route>
    </Switch>
  </ErrorBoundary>
);

export default App;
