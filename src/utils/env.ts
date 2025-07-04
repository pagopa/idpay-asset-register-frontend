import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined =
  env.get('PUBLIC_URL').asString() || '/registro-dei-beni';
export const ENV = {
  ENV: env.get('REACT_APP_ENV').required().asString(),
  PUBLIC_URL: PUBLIC_URL_INNER,

  ASSISTANCE: {
    EMAIL: env.get('REACT_APP_PAGOPA_HELP_EMAIL').required().asString(),
  },

  URL_FE: {
    PRE_LOGIN: env.get('REACT_APP_URL_FE_PRE_LOGIN').required().asString(),
    LOGIN: env.get('REACT_APP_URL_FE_LOGIN').required().asString(),
    LOGOUT: env.get('REACT_APP_URL_FE_LOGOUT').required().asString(),
    LANDING: env.get('REACT_APP_URL_FE_LANDING').required().asString(),
    ASSISTANCE_ASSET_REGISTER: env.get('REACT_APP_URL_FE_ASSISTANCE_ASSET_REGISTER').required().asString(),
  },

  URL_API: {
    REGISTER: env.get('REACT_APP_URL_API_REGISTER').required().asString(),
  },

  API_TIMEOUT_MS: {
    REGISTER: env.get('REACT_APP_API_REGISTER_TIMEOUT_MS').required().asInt(),
  },

  URL_INSTITUTION_LOGO: {
    PREFIX: env.get('REACT_APP_URL_INSTITUTION_LOGO_PREFIX').required().asString(),
    SUFFIX: env.get('REACT_APP_URL_INSTITUTION_LOGO_SUFFIX').required().asString(),
  },

  ANALYTCS: {
    ENABLE: env.get('REACT_APP_ANALYTICS_ENABLE').default('false').asBool(),
    MOCK: env.get('REACT_APP_ANALYTICS_MOCK').default('false').asBool(),
    DEBUG: env.get('REACT_APP_ANALYTICS_DEBUG').default('false').asBool(),
    TOKEN: env.get('REACT_APP_MIXPANEL_TOKEN').required().asString(),
    API_HOST: env
      .get('REACT_APP_MIXPANEL_API_HOST')
      .default('https://api-eu.mixpanel.com')
      .asString(),
  },
  ONE_TRUST: {
    OT_NOTICE_CDN_URL: env.get('REACT_APP_ONE_TRUST_OTNOTICE_CDN_URL').required().asString(),
    OT_NOTICE_CDN_SETTINGS: env
      .get('REACT_APP_ONE_TRUST_OTNOTICE_CDN_SETTINGS')
      .required()
      .asString(),
    PRIVACY_POLICY_ID: env
      .get('REACT_APP_ONE_TRUST_PRIVACY_POLICY_ID_MERCHANTS')
      .required()
      .asString(),
    PRIVACY_POLICY_JSON_URL: env
      .get('REACT_APP_ONE_TRUST_PRIVACY_POLICY_JSON_URL_MERCHANTS')
      .required()
      .asString(),
    TOS_ID: env.get('REACT_APP_ONE_TRUST_TOS_ID_MERCHANTS').required().asString(),
    TOS_JSON_URL: env.get('REACT_APP_ONE_TRUST_TOS_JSON_URL_MERCHANTS').required().asString(),
  },
};
