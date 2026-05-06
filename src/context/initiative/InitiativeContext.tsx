import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useInitiativeFromUrl, { DEFAULT_INITIATIVE_ID } from '../../hooks/useInitiativeFromUrl';
import type { InitiativeDTO } from '../../api/generated/register';
import { fetchInitiatives } from '../../services/initiativeService';

export type InitiativeContextValue = {
  /**
   * Initiative identifier as read from the current URL.
   * In the future it will always be present; for now it can fallback to DEFAULT_INITIATIVE_ID.
   */
  initiativeId: string;
  initiatives: Array<InitiativeDTO>;
  isLoadingInitiatives: boolean;
};

const InitiativeContext = createContext<InitiativeContextValue>({
  initiativeId: DEFAULT_INITIATIVE_ID,
  initiatives: [],
  isLoadingInitiatives: false,
});

export type InitiativeProviderProps = {
  children: React.ReactNode;
};

/**
 * Provides initiative-related info (currently initiativeId) to the component tree.
 * Goal: avoid repeating `useInitiativeFromUrl()` across components.
 */
export const InitiativeProvider = ({ children }: InitiativeProviderProps) => {
  const { initiativeId } = useInitiativeFromUrl();

  const [initiatives, setInitiatives] = useState<Array<InitiativeDTO>>([]);
  const [isLoadingInitiatives, setIsLoadingInitiatives] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        setIsLoadingInitiatives(true);
        const list = await fetchInitiatives();
        if (!controller.signal.aborted) {
          setInitiatives(list);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingInitiatives(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  const value = useMemo<InitiativeContextValue>(
    () => ({ initiativeId, initiatives, isLoadingInitiatives }),
    [initiativeId, initiatives, isLoadingInitiatives]
  );

  return <InitiativeContext.Provider value={value}>{children}</InitiativeContext.Provider>;
};

export const useInitiativeContext = (): InitiativeContextValue => useContext(InitiativeContext);
