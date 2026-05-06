import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Temporary resolver for initiative id/name from URL.
 *
 * Expected URL format (future): /:initiativeId/...
 *
 * For now, when initiativeId is not present (current routing),
 * it falls back to a default initiative.
 */
export const DEFAULT_INITIATIVE_ID = '000';

export const useInitiativeFromUrl = (): { initiativeId: string } => {
  const location = useLocation();

  return useMemo(() => {
    const tokens = location.pathname.split('/').filter(Boolean);
    const initiativeId = tokens[1] || DEFAULT_INITIATIVE_ID;

    return { initiativeId };
  }, [location.pathname]);
};

export default useInitiativeFromUrl;
