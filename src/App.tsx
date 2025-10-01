import { Route, Routes, Navigate } from 'react-router-dom';
import {
  ErrorBoundary,
} from '@pagopa/selfcare-common-frontend/lib';
import routes from './routes';
import UpcomingInitiative from "./pages/upcomingInitiative/upcomingInitiative";
import withLogin from "./decorators/withLogin";
import withSelectedPartyProducts from "./decorators/withSelectedPartyProducts";

const SecuredRoutes = withLogin(
    withSelectedPartyProducts(() => (
            <Routes>
                <Route path="*" element={<Navigate to={routes.UPCOMING} />} />
                <Route path={routes.UPCOMING} element={<UpcomingInitiative/>}/>
            </Routes>
    ))
);

const App = () => (
  <ErrorBoundary>
      <SecuredRoutes />
  </ErrorBoundary>
);

export default App;
