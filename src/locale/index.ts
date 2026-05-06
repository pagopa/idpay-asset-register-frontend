import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { initReactI18next } from 'react-i18next';
import common from './it/common.json';
import { loadItNamespace } from './multiInitiativeI18n';

const defaultLanguage = 'it';

/**
 * NOTE:
 * selfcare-common-frontend's `configureI18n` initializes i18next using a single namespace ("translation").
 * Since we need namespace support (common, default/*, <initiative>/*), we directly init the shared i18n instance.
 * This keeps legacy behavior (all keys are still requested without explicit namespace) while enabling lazy-loading.
 */
void (i18n as any)
  .use(initReactI18next)
  .init({
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    defaultNS: 'common',
    ns: ['common'],
    fallbackNS: ['default/copy', 'default/tos', 'default/privacyPolicy'],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: true
    },
    resources: {
      [defaultLanguage]: {
        common
      }
    }
  } as any);

// Preload fallback namespaces so `t()` resolves immediately on first render.
// (no backend connector: we just add bundles programmatically)
void Promise.all(
  ['default/copy', 'default/tos', 'default/privacyPolicy'].map(async (ns) => {
    const res = await loadItNamespace(ns);
    (i18n as any).addResourceBundle(defaultLanguage, ns, res, true, true);
  })
);

export default i18n;
