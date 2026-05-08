import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { buildScopedNamespaces } from '../locale/namespaces';
import { buildNamespaceKey } from '../utils/buildNamespaceKey';
import { useInitiativeContext } from '../context/initiative/InitiativeContext';
import i18n from '../locale';

const failedNamespaceLoads = new Set<string>();

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
  initiativeName?: string;
};

const resolveInitiativeNamespace = (
  initiativeNameProp: string | undefined,
  initiativeId: string,
  initiatives: Array<any>
): string | undefined => {
  if (initiativeNameProp) {
    return initiativeNameProp;
  }

  const currentInitiative = initiatives?.find((i) => i.initiativeId === initiativeId);

  if (!currentInitiative) {
    return undefined;
  }

  const { initiativeName, startDate } = currentInitiative;

  if (!initiativeName || !startDate) {
    return undefined;
  }

  return buildNamespaceKey(initiativeName, startDate);
};

export const useScopedTranslation = (
  options: UseScopedTranslationOptions = {}
): UseScopedTranslationResult => {
  const { initiativeName: initiativeNameProp, enableNamespaceLoading = true } = options;

  const { initiativeId, initiatives } = useInitiativeContext();

  const initiativeName = resolveInitiativeNamespace(initiativeNameProp, initiativeId, initiatives);

  const namespaces = useMemo(
    () => buildScopedNamespaces(initiativeName ?? undefined),
    [initiativeName]
  );

  const namespacesToLoad = useMemo(() => {
    const list = initiativeName
      ? [...namespaces.common, ...namespaces.initiative]
      : [...namespaces.common, ...namespaces.default];

    return Array.from(new Set(list));
  }, [namespaces, initiativeName]);

  const namespacesForHook = useMemo((): Array<string> => {
    if (initiativeName) {
      return [
        'common',
        `${initiativeName}/copy`,
        `${initiativeName}/tos`,
      ];
    }

    return ['common', 'default/copy'];
  }, [initiativeName]);

  const translationHook = (useTranslation as any)(namespacesForHook);

  const { t: rawT } = translationHook;

  const t = useMemo(
    () =>
      ((key: any, options?: any) => {
        if (initiativeName) {
          const initiativeNs = `${initiativeName}/copy`;

          const initiativeValue = rawT(key, {
            ns: initiativeNs,
            ...options,
          });

          if (initiativeValue === key) {
            return rawT(key, {
              ns: 'default/copy',
              ...options,
            });
          }

          return initiativeValue;
        }

        return rawT(key, options);
      }) as TFunction,
    [rawT, initiativeName]
  );

  const [isLoading, setIsLoading] = useState(false);

  const loadNamespaceIfMissing = async (ns: string): Promise<void> => {
    if (failedNamespaceLoads.has(ns)) {
      return;
    }

    const currentLang = (i18n as any).language;

    if (typeof (i18n as any).getResourceBundle !== 'function') {
      return;
    }

    const existingBundle = (i18n as any).getResourceBundle(currentLang, ns);

    if (existingBundle && Object.keys(existingBundle).length > 0) {
      return;
    }

    try {
      const { loadItNamespace } = await import('../locale/multiInitiativeI18n');
      const res = await loadItNamespace(ns);

      (i18n as any).addResourceBundle(currentLang, ns, res, true, true);

      (i18n as any).reloadResources(currentLang, ns);
      (i18n as any).emit('loaded');
    } catch {
      failedNamespaceLoads.add(ns);

      try {
        if (ns.endsWith('/copy')) {
          const { loadItNamespace } = await import('../locale/multiInitiativeI18n');
          const fallback = await loadItNamespace('default/copy');

          const currentLang = (i18n as any).language;

          (i18n as any).addResourceBundle(currentLang, ns, fallback, true, true);

          (i18n as any).reloadResources(currentLang, ns);
          (i18n as any).emit('loaded');
        }
      } catch {
        /* empty */
      }
    }
  };

  const ensureNamespacesLoaded = async (nsList: Array<string>): Promise<void> => {
    await (i18n as any).loadNamespaces(nsList);

    await Promise.all(nsList.map((ns) => loadNamespaceIfMissing(ns)));
  };

  useEffect(() => {
    if (!enableNamespaceLoading) {
      return;
    }

    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        await ensureNamespacesLoaded(namespacesToLoad);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [enableNamespaceLoading, namespacesToLoad]);

  return { t, isLoading, initiativeName };
};

export default useScopedTranslation;
