import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { buildScopedNamespaces } from '../locale/namespaces';
import { buildNamespaceKey } from '../utils/buildNamespaceKey';
import { useInitiativeContext } from '../context/initiative/InitiativeContext';
import i18n from '../locale';

export type UseScopedTranslationOptions = {
  initiativeName?: string;
  /**
   * If true, explicitly loads namespaces via i18next.loadNamespaces at runtime.
   * Default is true to keep existing pages working (multi-initiative ready).
   */
  enableNamespaceLoading?: boolean;
};

export type UseScopedTranslationResult = {
  t: TFunction;
  isLoading: boolean;
};

const resolveInitiativeNamespace = (
  initiativeNameProp: string | undefined,
  initiativeId: string,
  initiatives: Array<any>
): string | undefined => {
  if (initiativeNameProp) {
    return initiativeNameProp;
  }

  const currentInitiative = initiatives?.find(
    (i) => i.initiativeId === initiativeId
  );

  if (
    currentInitiative &&
    currentInitiative.initiativeName &&
    currentInitiative.startDate
  ) {
    return buildNamespaceKey(
      currentInitiative.initiativeName,
      currentInitiative.startDate
    );
  }

  return undefined;
};

export const useScopedTranslation = (
  options: UseScopedTranslationOptions = {}
): UseScopedTranslationResult => {
  const { initiativeName: initiativeNameProp, enableNamespaceLoading = true } = options;

  const { initiativeId, initiatives } = useInitiativeContext();

  const initiativeName = resolveInitiativeNamespace(
    initiativeNameProp,
    initiativeId,
    initiatives
  );

  const namespaces = useMemo(
    () => buildScopedNamespaces(initiativeName ?? undefined),
    [initiativeName]
  );

  const namespacesToLoad = useMemo(() => {
    const list = [
      ...namespaces.common,
      ...namespaces.initiative,
      ...namespaces.default
    ] as Array<string>;
    return Array.from(new Set(list));
  }, [namespaces]);

  const namespacesForHook = useMemo((): Array<string> => {
    if (initiativeName) {
      return ['common', `${initiativeName}/copy`, 'default/copy'];
    }

    return ['common', 'default/copy'];
  }, [initiativeName]);

  const { t } = (useTranslation as any)(namespacesForHook);

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
        // i18next typing doesn't always expose loadNamespaces depending on versions.
        // At runtime, i18next has this API (with react-i18next), so we cast to avoid TS error.
        // NOTE: importing the configured i18n instance from '../locale' breaks some unit tests
        // (it triggers configureI18n() with plugins not available under Jest).
        // Instead, we rely on the global i18next instance used by react-i18next.
        await (i18n as any).loadNamespaces(namespacesToLoad);
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
