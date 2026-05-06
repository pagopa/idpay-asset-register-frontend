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
export const DEFAULT_INITIATIVE_ID = 'bonusElettrodomestici2025';

export const useInitiativeFromUrl = (): { initiativeId: string } => {
  const location = useLocation();

  return useMemo(() => {
    // remove leading/trailing slashes and split
    const tokens = location.pathname.split('/').filter(Boolean);
    const initiativeId = tokens[0] || DEFAULT_INITIATIVE_ID;

    return { initiativeId };
  }, [location.pathname]);
};

export default useInitiativeFromUrl;
