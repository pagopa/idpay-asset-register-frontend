import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import i18n from '../locale';
import { buildScopedNamespaces } from '../locale/namespaces';

export type UseScopedTranslationOptions = {
  initiativeName?: string;
  enableNamespaceLoading?: boolean;
};

export type UseScopedTranslationResult = {
  t: TFunction;
  isLoading: boolean;
};

export const useScopedTranslation = (
  options: UseScopedTranslationOptions = {}
): UseScopedTranslationResult => {
  const { initiativeName, enableNamespaceLoading = false } = options;

  const { t } = useTranslation();

  const namespaces = useMemo(() => buildScopedNamespaces(initiativeName), [initiativeName]);

  const namespacesToLoad = useMemo(() => {
    const list = [
      ...namespaces.common,
      ...namespaces.default,
      ...namespaces.initiative
    ] as Array<string>;
    return Array.from(new Set(list));
  }, [namespaces]);

  const [isLoading, setIsLoading] = useState(false);

  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!enableNamespaceLoading) {
      return;
    }

    void (async () => {
      try {
        if (!cancelledRef.current) {
          setIsLoading(true);
        }
        await i18n.loadNamespaces(namespacesToLoad);
      } finally {
        if (!cancelledRef.current) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      // eslint-disable-next-line functional/immutable-data
      cancelledRef.current = true;
    };
  }, [enableNamespaceLoading, namespacesToLoad]);

  return { t, isLoading };
};

export default useScopedTranslation;
