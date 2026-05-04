import React from 'react';
import { Navigate } from 'react-router-dom';
import ROUTES from '../routes';
import { useInitiativeGuardState } from '../hooks/useInitiativeGuardState';

export type WithInitiativeGuardProps = {
  children: React.ReactNode;
};

/**
 * WithInitiativeGuard
 *
 * Guard that enforces route → data synchronization.
 *
 * Responsibilities:
 * - Validate initiativeId from route
 * - Ensure initiatives list is loaded
 * - Redirect if invalid
 *
 * Architectural constraints:
 * - Route remains the single source of truth
 * - No navigation triggered by Redux
 * - No global "selectedInitiative" state
 */
const WithInitiativeGuard: React.FC<WithInitiativeGuardProps> = ({ children }) => {
  const { initiativeId, isValid, isListLoaded, initiatives } = useInitiativeGuardState();

  // 1️⃣ Loading state (never blank screen)
  if (!isListLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento iniziative...</div>;
  }

  // 2️⃣ Empty list
  if (Array.isArray(initiatives) && initiatives.length === 0) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // 3️⃣ initiativeId missing
  if (!initiativeId) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // 4️⃣ initiativeId invalid
  if (!isValid) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // 5️⃣ State OK
  return <>{children}</>;
};

export default WithInitiativeGuard;
