import { Route, Routes, Navigate } from 'react-router-dom';
import {
  ErrorBoundary,
} from '@pagopa/selfcare-common-frontend/lib';
import routes from './routes';
import UpcomingInitiative from "./pages/upcomingInitiative/upcomingInitiative";
import withLogin from "./decorators/withLogin";
import withSelectedPartyProducts from "./decorators/withSelectedPartyProducts";

const SecuredRoutes = withLogin(
<<<<<<< HEAD
  withSelectedPartyProducts(() => {
    const location = useLocation();
    const { isTOSAccepted, acceptTOS, firstAcceptance } = useTCAgreement();
    const user = useMemo(() => fetchUserFromLocalStorage(), []);
    const isInvitaliaUser = [USERS_TYPES.INVITALIA_L1, USERS_TYPES.INVITALIA_L2].includes(
      user?.org_role as USERS_TYPES
    );
    const institution = useSelector(institutionSelector);
    const organizationId = institution?.institutionId || '';

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
        {isInvitaliaUser ? <InvitaliaRoutes /> : <StandardRoutes organizationId={organizationId} />}
      </Layout>
    );
  })
=======
    withSelectedPartyProducts(() => (
            <Routes>
                <Route path="*" element={<Navigate to={routes.UPCOMING} />} />
                <Route path={routes.UPCOMING} element={<UpcomingInitiative/>}/>
            </Routes>
    ))
>>>>>>> 4c12321044b288cf4f0285756856245dbd7cdb08
);

const App = () => (
  <ErrorBoundary>
      <SecuredRoutes />
  </ErrorBoundary>
);

export default App;
