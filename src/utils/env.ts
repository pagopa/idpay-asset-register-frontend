import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined =
  env.get('PUBLIC_URL').asString() || '/elenco-informatico-elettrodomestici';
export const ENV = {
  ENV: env.get('REACT_APP_ENV').required().asString(),
  PUBLIC_URL: PUBLIC_URL_INNER,

  ASSISTANCE: {
    EMAIL: env.get('REACT_APP_ASSISTANCE_EMAIL').required().asString(),
  },

  URL_FE: {
    PRE_LOGIN: env.get('REACT_APP_URL_FE_PRE_LOGIN').required().asString(),
    LOGIN: env.get('REACT_APP_URL_FE_LOGIN').required().asString(),
    LOGOUT: env.get('REACT_APP_URL_FE_LOGOUT').required().asString(),
    LANDING: env.get('REACT_APP_URL_FE_LANDING').required().asString(),
    EIE_MANUAL: env.get('REACT_APP_URL_FE_EIE_MANUAL').asString(),
    ASSISTANCE_ASSET_REGISTER: env
      .get('REACT_APP_URL_FE_ASSISTANCE_ASSET_REGISTER')
      .required()
      .asString(),
  },

  URL_API: {
    OPERATION: env.get('REACT_APP_URL_API_REGISTER').required().asString(),
  },

  API_TIMEOUT_MS: {
    ROLE_PERMISSION: env.get('REACT_APP_API_ROLE_PERMISSION_TIMEOUT_MS').required().asInt(),
    OPERATION: env.get('REACT_APP_API_OPERATION_TIMEOUT_MS').required().asInt()
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
      .get('REACT_APP_ONE_TRUST_PRIVACY_POLICY_ID_ASSET_REGISTER')
      .required()
      .asString(),
    PRIVACY_POLICY_JSON_URL: env
      .get('REACT_APP_ONE_TRUST_PRIVACY_POLICY_JSON_URL_ASSET_REGISTER')
      .required()
      .asString(),
    TOS_ID: env.get('REACT_APP_ONE_TRUST_TOS_ID_ASSET_REGISTER').required().asString(),
    TOS_JSON_URL: env.get('REACT_APP_ONE_TRUST_TOS_JSON_URL_ASSET_REGISTER').required().asString(),
  },
  FOOTER: {
    LINK: {
      PAGOPALINK: 'https://www.pagopa.it/',
      PRIVACYPOLICY: env.get('REACT_APP_URL_PRIVACY_DISCLAIMER').asString(),
      TERMSANDCONDITIONS: env.get('REACT_APP_URL_TERMS_AND_CONDITIONS').asString(),
      PROTECTIONOFPERSONALDATA:
          'https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8',
      ABOUTUS: 'https://www.pagopa.it/it/societa/chi-siamo/',
      MEDIA: 'https://www.pagopa.it/it/',
      WORKWITHUS: 'https://www.pagopa.it/it/lavora-con-noi/',
      CERTIFICATIONS: 'https://www.pagopa.it/it/certificazioni/',
      INFORMATIONSECURITY:
          'https://www.pagopa.it/it/politiche-per-la-sicurezza-delle-informazioni/',
      TRANSPARENTCOMPANY: 'https://pagopa.portaleamministrazionetrasparente.it/',
      DISCLOSUREPOLICY: 'https://www.pagopa.it/it/responsible-disclosure-policy/',
      MODEL231:
          'https://pagopa.portaleamministrazionetrasparente.it/pagina746_altri-contenuti.html',
      LINKEDIN: 'https://www.linkedin.com/company/pagopa/',
      TWITTER: 'https://twitter.com/pagopa',
      INSTAGRAM: 'https://www.instagram.com/pagopaspa/',
      MEDIUM: 'https://medium.com/pagopa-spa',
      ACCESSIBILITY: 'https://form.agid.gov.it/view/87f46790-9798-11f0-b583-8b5f76942354',
    },
  },
  HEADER: {
    LINK: {
      ROOTLINK: 'https://www.pagopa.it/',
      PRODUCTURL: '/dashboard',
    },
  },
};
