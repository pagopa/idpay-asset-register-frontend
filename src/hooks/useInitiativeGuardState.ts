import { useMemo } from 'react';
import { InitiativeDTO } from '../api/generated/register';
import { useCurrentInitiativeId } from './useCurrentInitiativeId';
import { useInitiativesQuery } from './useInitiativesQuery';

export type UseInitiativeGuardStateResult = {
  initiativeId: string | undefined;
  initiatives: Array<InitiativeDTO>;
  isListLoaded: boolean;
  isValid: boolean;
  isError: boolean;
  refetch: () => unknown;
};

/**
 * useInitiativeGuardState
 *
 * Exposes the initiative guard derived state, without performing navigation.
 *
 * Architectural constraints:
 * - Route is the single source of truth for the current initiativeId
 * - No redirects/navigation triggered here (UI layer decides)
 * - No global "selectedInitiative" state
 */
export const useInitiativeGuardState = (): UseInitiativeGuardStateResult => {
  const initiativeId = useCurrentInitiativeId();
  const { initiatives, isLoading, isError, refetch } = useInitiativesQuery();

  const isValid = useMemo(() => {
    if (!initiativeId) {
      return false;
    }
    return initiatives.some((i) => i.initiativeId === initiativeId);
  }, [initiativeId, initiatives]);

  return {
    initiativeId,
    initiatives,
    isListLoaded: !isLoading,
    isValid,
    isError,
    refetch,
  };
};
