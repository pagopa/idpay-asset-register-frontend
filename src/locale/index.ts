import i18n, { configureI18n } from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import {I18N_MULTI_INIT_ENABLED} from "../utils/constants";
import it from './it.json';
import { loadItNamespace } from './multiInitiativeI18n';

/**
 * Legacy init (default): single bundled JSON `it.json`.
 * Multi-initiative init (feature-flagged): enables dynamic namespaces loading.
 */
if (!I18N_MULTI_INIT_ENABLED) {
  configureI18n({ i18n, it });
} else {
  configureI18n({
    i18n,
    it,
    i18nextOptions: {
      defaultNS: 'common',
      ns: ['common'],
      fallbackNS: ['default/copy', 'default/tos', 'default/privacyPolicy'],
      react: {
        useSuspense: true
      }
    },
    loadNamespace: loadItNamespace
  } as any);
}

export default i18n;
