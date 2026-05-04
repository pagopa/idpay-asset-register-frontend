import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import {
  ErrorBoundary,
  LoadingOverlay,
  UnloadEventHandler,
  UserNotifyHandle,
} from '@pagopa/selfcare-common-frontend/lib';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import withSelectedPartyProducts from './decorators/withSelectedPartyProducts';
import withLogin from './decorators/withLogin';
import WithInitiativeGuard from './decorators/withInitiativeGuard';
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
import InvitaliaOverview from './pages/InvitaliaOverview/invitaliaOverview';
import { fetchUserFromLocalStorage } from './helpers';
import { USERS_TYPES } from './utils/constants';
import InvitaliaProductsList from './pages/InvitaliaProductsList/invitaliaProductsList';
import { useGetInitiativesQuery } from './redux/api/initiativesApi';
import { institutionSelector } from './redux/slices/invitaliaSlice';

type StandardRoutesProps = {
  organizationId: string | undefined;
};

const StandardRoutes = ({ organizationId }: StandardRoutesProps) => (
  <Routes>
    <Route path={routes.HOME} element={<Overview />} />
    <Route
      path={routes.ADD_PRODUCTS}
      element={
        <WithInitiativeGuard>
          <AddProducts />
        </WithInitiativeGuard>
      }
    />
    <Route
      path={routes.PRODUCTS}
      element={
        <WithInitiativeGuard>
          <Products organizationId={organizationId || ''} />
        </WithInitiativeGuard>
      }
    />
    <Route
      path={routes.UPLOADS}
      element={
        <WithInitiativeGuard>
          <UploadsHistory />
        </WithInitiativeGuard>
      }
    />
    <Route path={routes.TOS} element={<TOS />} />
    <Route path={routes.PRIVACY_POLICY} element={<PrivacyPolicy />} />
    <Route path="*" element={<Navigate to={routes.HOME} />} />
  </Routes>
);

const InvitaliaRoutes = () => (
  <Routes>
    <Route path={routes.HOME} element={<InvitaliaProductsList />} />
    <Route
      path={routes.PRODUCERS}
      element={
        <WithInitiativeGuard>
          <InvitaliaOverview />
        </WithInitiativeGuard>
      }
    />
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
    const isInvitaliaUser = [USERS_TYPES.INVITALIA_L1, USERS_TYPES.INVITALIA_L2].includes(
      user?.org_role as USERS_TYPES
    );
    const institution = useSelector(institutionSelector);
    const organizationId = institution?.institutionId || '';

    useGetInitiativesQuery();

    /*
    if (UPCOMING_INITIATIVE_DAY) {
      return (
        <Layout>
          <Routes>
            <Route path={routes.UPCOMING} element={<UpcomingInitiative/>}/>
          </Routes>
        </Layout>
      );
    }
    */

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
          <Route
            path={`${routes.INITIATIVE_BASE}/*`}
            element={
              isInvitaliaUser ? (
                <InvitaliaRoutes />
              ) : (
                <StandardRoutes organizationId={organizationId} />
              )
            }
          />
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
