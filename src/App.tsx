import { Route, Routes, Navigate } from 'react-router-dom';
import {
  ErrorBoundary,
} from '@pagopa/selfcare-common-frontend/lib';
import routes from './routes';
import UpcomingInitiative from "./pages/upcomingInitiative/upcomingInitiative";

const App = () => (
  <ErrorBoundary>
      <Routes>
          <Route path={routes.UPCOMING} element={<UpcomingInitiative/>}/>
          <Route path="*" element={<Navigate to={routes.UPCOMING} />} />
      </Routes>
  </ErrorBoundary>
);

export default App;
