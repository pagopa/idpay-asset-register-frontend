module.exports = {
  // This mock must follow the real shape exported by
  // @pagopa/selfcare-common-frontend/lib/config/env.js
  CONFIG: {
    URL_FE: {
      LOGIN_GOOGLE: '',
      LOGIN: '',
      LOGOUT: '',
      LOGOUT_GOOGLE: '',
      LOGIN_ADMIN_GOOGLE: '',
      ASSISTANCE: '',
    },
    MOCKS: {
      MOCK_USER: false,
    },
    ANALYTCS: {
      ENABLE: false,
      MOCK: true,
      DEBUG: false,
      TOKEN: '',
      API_HOST: '',
      PERSISTENCE: 'localStorage',
      LOG_IP: false,
      PROPERTY_BLACKLIST: [],
      ADDITIONAL_PROPERTIES: {},
      ADDITIONAL_PROPERTIES_IMPORTANT: {},
    },
    CONSENT: {
      COOKIE_GROUP_ANALYTICS: '',
    },
    TEST: {
      JWT: '',
    },
    FOOTER: {
      LINK: {
        PAGOPALINK: '',
        PRIVACYPOLICY: '',
        TERMSANDCONDITIONS: '',
        PROTECTIONOFPERSONALDATA: '',
        ABOUTUS: '',
        MEDIA: '',
        WORKWITHUS: '',
        CERTIFICATIONS: '',
        INFORMATIONSECURITY: '',
        TRANSPARENTCOMPANY: '',
        DISCLOSUREPOLICY: '',
        MODEL231: '',
        LINKEDIN: '',
        TWITTER: '',
        INSTAGRAM: '',
        MEDIUM: '',
        ACCESSIBILITY: '',
      },
    },
    HEADER: {
      LINK: {
        ROOTLINK: '',
        PRODUCTURL: '',
      },
    },
  },

  // Some imports may use default import; keep it aligned with CONFIG as well.
  default: {
    URL_FE: {
      LOGIN_GOOGLE: '',
      LOGIN: '',
      LOGOUT: '',
      LOGOUT_GOOGLE: '',
      LOGIN_ADMIN_GOOGLE: '',
      ASSISTANCE: '',
    },
    MOCKS: {
      MOCK_USER: false,
    },
    ANALYTCS: {
      ENABLE: false,
      MOCK: true,
      DEBUG: false,
      TOKEN: '',
      API_HOST: '',
      PERSISTENCE: 'localStorage',
      LOG_IP: false,
      PROPERTY_BLACKLIST: [],
      ADDITIONAL_PROPERTIES: {},
      ADDITIONAL_PROPERTIES_IMPORTANT: {},
    },
    CONSENT: {
      COOKIE_GROUP_ANALYTICS: '',
    },
    TEST: {
      JWT: '',
    },
    FOOTER: {
      LINK: {
        PAGOPALINK: '',
        PRIVACYPOLICY: '',
        TERMSANDCONDITIONS: '',
        PROTECTIONOFPERSONALDATA: '',
        ABOUTUS: '',
        MEDIA: '',
        WORKWITHUS: '',
        CERTIFICATIONS: '',
        INFORMATIONSECURITY: '',
        TRANSPARENTCOMPANY: '',
        DISCLOSUREPOLICY: '',
        MODEL231: '',
        LINKEDIN: '',
        TWITTER: '',
        INSTAGRAM: '',
        MEDIUM: '',
        ACCESSIBILITY: '',
      },
    },
    HEADER: {
      LINK: {
        ROOTLINK: '',
        PRODUCTURL: '',
      },
    },
  },
};
