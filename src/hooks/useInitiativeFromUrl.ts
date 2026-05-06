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

    // URL structure:
    // /elenco-informatico-elettrodomestici/:initiativeId/...
    // tokens[0] = base route
    // tokens[1] = real initiativeId
    const initiativeId = tokens[1] || DEFAULT_INITIATIVE_ID;

    // DEBUG LOG
    // eslint-disable-next-line no-console
    console.log('[useInitiativeFromUrl] pathname:', location.pathname);
    // eslint-disable-next-line no-console
    console.log('[useInitiativeFromUrl] tokens:', tokens);
    // eslint-disable-next-line no-console
    console.log('[useInitiativeFromUrl] resolved initiativeId:', initiativeId);

    return { initiativeId };
  }, [location.pathname]);
};

export default useInitiativeFromUrl;
