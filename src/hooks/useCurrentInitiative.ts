import { useMemo } from 'react';
import { InitiativeDTO } from '../api/generated/register';
import { useCurrentInitiativeId } from './useCurrentInitiativeId';
import { useInitiativesQuery } from './useInitiativesQuery';

/**
 * useCurrentInitiative
 *
 * Derives the current initiative at runtime.
 * No redirects.
 * No global state mutation.
 */

export const useCurrentInitiative = (): InitiativeDTO | undefined => {
  const initiativeId = useCurrentInitiativeId();
  const { initiatives } = useInitiativesQuery();

  return useMemo(() => {
    if (!initiativeId) {
      return undefined;
    }

    return initiatives.find((initiative) => initiative.initiativeId === initiativeId);
  }, [initiativeId, initiatives]);
};
