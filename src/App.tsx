import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {
  ErrorBoundary,
  LoadingOverlay,
  UnloadEventHandler,
  UserNotifyHandle,
} from '@pagopa/selfcare-common-frontend/lib';
import withSelectedPartyProducts from './decorators/withSelectedPartyProducts';
import withLogin from './decorators/withLogin';
import Layout from './components/Layout/Layout';
import Auth from './pages/auth/Auth';
import TOSWall from './components/TOS/TOSWall';
import TOSLayout from './components/TOSLayout/TOSLayout';
import routes from './routes';
import useTCAgreement from './hooks/useTCAgreement';
import Overview from './pages/overview/overview';
import TOS from "./pages/tos/TOS";
import PrivacyPolicy from "./pages/privacyPolicy/PrivacyPolicy";
import AddProducts from "./pages/addProducts/addProducts";
import UploadsHistory from "./pages/uploadsHistory/uploadsHistory";
import ProductDataGrid from './pages/products/ProductDataGrid';
import Products from './pages/components/Products';

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
        <Routes>
          <Route path={routes.HOME} element={<Overview />} />
          <Route path={routes.ADD_PRODUCTS} element={ <AddProducts /> } />
          <Route path={routes.PRODUCTS} element={<Products><ProductDataGrid/></Products>} />
          <Route path={routes.UPLOADS} element={<UploadsHistory />} />
          <Route path={routes.TOS} element={<TOS />} />
          <Route path={routes.PRIVACY_POLICY} element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to={routes.HOME} />} />
        </Routes>
      </Layout>
    );
  })
);

const App = () => (
  <ErrorBoundary>
    <LoadingOverlay />
    <UserNotifyHandle />
    <UnloadEventHandler />
    <Routes>
      <Route path={routes.AUTH} element={<Auth />} />
      <Route path="*" element={<SecuredRoutes />} />
    </Routes>
  </ErrorBoundary>
);

export default App;
