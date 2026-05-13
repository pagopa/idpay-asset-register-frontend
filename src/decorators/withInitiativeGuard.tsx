import React from 'react';
import { useInitiativeGuardState } from '../hooks/useInitiativeGuardState';
import RedirectHomeWithErrorAlert from '../pages/components/RedirectHomeWithErrorAlert';

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
  const { initiativeId, isValid, isListLoaded, initiatives, isError } = useInitiativeGuardState();

  // 1️⃣ Loading state (never blank screen)
  if (!isListLoaded) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento iniziative...</div>;
  }

  // 2️⃣ Error state
  if (isError) {
    return <RedirectHomeWithErrorAlert />;
  }

  // 3️⃣ Empty list
  if (Array.isArray(initiatives) && initiatives.length === 0) {
    return <RedirectHomeWithErrorAlert />;
  }

  // 4️⃣ initiativeId missing
  if (!initiativeId) {
    return <RedirectHomeWithErrorAlert />;
  }

  // 5️⃣ initiativeId invalid
  if (!isValid) {
    return <RedirectHomeWithErrorAlert />;
  }

  // 5️⃣ State OK
  return <>{children}</>;
};

export default WithInitiativeGuard;
