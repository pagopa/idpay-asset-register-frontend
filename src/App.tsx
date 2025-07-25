import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {
  ErrorBoundary,
  LoadingOverlay,
  UnloadEventHandler,
  UserNotifyHandle,
} from '@pagopa/selfcare-common-frontend/lib';
import { useMemo } from 'react';
import withSelectedPartyProducts from './decorators/withSelectedPartyProducts';
import withLogin from './decorators/withLogin';
import Layout from './components/Layout/Layout';
import Auth from './pages/auth/Auth';
import TOSWall from './components/TOS/TOSWall';
import TOSLayout from './components/TOSLayout/TOSLayout';
import routes from './routes';
import useTCAgreement from './hooks/useTCAgreement';
import Overview from './pages/overview/overview';
import TOS from './pages/tos/TOS';
import PrivacyPolicy from './pages/privacyPolicy/PrivacyPolicy';
import AddProducts from './pages/addProducts/addProducts';
import UploadsHistory from './pages/uploadsHistory/uploadsHistory';
import Products from './pages/components/Products';
import ProductDataGrid from './components/Product/ProductDataGrid';
import InvitaliaOverview from './pages/InvitaliaOverview/invitaliaOverview';
import { fetchUserFromLocalStorage } from './helpers';
import { INVITALIA } from './utils/constants';
import InvitaliaProductsList from './pages/InvitaliaProductsList/invitaliaProductsList';

const StandardRoutes = () => (
  <Routes>
    <Route path={routes.HOME} element={<Overview />} />
    <Route path={routes.ADD_PRODUCTS} element={<AddProducts />} />
    <Route
      path={routes.PRODUCTS}
      element={
        <Products>
          <ProductDataGrid organizationId="" owner="produttore" />
        </Products>
      }
    />
    <Route path={routes.UPLOADS} element={<UploadsHistory />} />
    <Route path={routes.TOS} element={<TOS />} />
    <Route path={routes.PRIVACY_POLICY} element={<PrivacyPolicy />} />
    <Route path="*" element={<Navigate to={routes.HOME} />} />
  </Routes>
);

const InvitaliaRoutes = () => (
  <Routes>
    <Route path={routes.HOME} element={<InvitaliaOverview />} />
    <Route path={routes.INVITALIA_PRODUCTS_LIST} element={<InvitaliaProductsList />} />
    <Route path={routes.TOS} element={<TOS />} />
    <Route path={routes.PRIVACY_POLICY} element={<PrivacyPolicy />} />
    <Route path="*" element={<Navigate to={routes.HOME} />} />
  </Routes>
);

const SecuredRoutes = withLogin(
  withSelectedPartyProducts(() => {
    const location = useLocation();
    const { isTOSAccepted, acceptTOS, firstAcceptance } = useTCAgreement();
    const user = useMemo(() => fetchUserFromLocalStorage(), []);
    const isInvitaliaUser = user?.org_role === INVITALIA;

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

    return <Layout>{isInvitaliaUser ? <InvitaliaRoutes /> : <StandardRoutes />}</Layout>;
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
