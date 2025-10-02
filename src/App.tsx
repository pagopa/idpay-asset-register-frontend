import { Route, Routes, Navigate } from 'react-router-dom';
import {
  ErrorBoundary,
} from '@pagopa/selfcare-common-frontend/lib';
import routes from './routes';
import UpcomingInitiative from "./pages/upcomingInitiative/upcomingInitiative";
import withLogin from "./decorators/withLogin";
import withSelectedPartyProducts from "./decorators/withSelectedPartyProducts";
import Auth from "./pages/auth/Auth";

const SecuredRoutes = withLogin(
    withSelectedPartyProducts(() => (
        <Routes>
            <Route path={routes.AUTH} element={<Auth />} />
            <Route path={routes.UPCOMING} element={<UpcomingInitiative/>}/>
            <Route path="*" element={<Navigate to={routes.UPCOMING} />} />
        </Routes>
    ))
);

const App = () => (
  <ErrorBoundary>
      <SecuredRoutes />
  </ErrorBoundary>
);

export default App;
