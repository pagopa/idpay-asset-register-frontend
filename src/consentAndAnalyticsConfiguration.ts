import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import '@pagopa/selfcare-common-frontend/lib/consentManagementConfigure';
import { ENV } from './utils/env';

// eslint-disable-next-line functional/immutable-data
CONFIG.ANALYTCS.ENABLE = ENV.ANALYTCS.ENABLE;
// eslint-disable-next-line functional/immutable-data
CONFIG.ANALYTCS.MOCK = ENV.ANALYTCS.MOCK;
// eslint-disable-next-line functional/immutable-data
CONFIG.ANALYTCS.DEBUG = ENV.ANALYTCS.DEBUG;
// eslint-disable-next-line functional/immutable-data
CONFIG.ANALYTCS.API_HOST = ENV.ANALYTCS.API_HOST;
// eslint-disable-next-line functional/immutable-data
CONFIG.ANALYTCS.ADDITIONAL_PROPERTIES_IMPORTANT = { env: ENV.ENV };

