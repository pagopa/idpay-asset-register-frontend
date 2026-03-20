module.exports = {
  jest: {
    configure: (jestConfig) => {
      jestConfig.transformIgnorePatterns = [
        '/node_modules/(?!(@pagopa/selfcare-common-frontend|@pagopa/ts-commons|@pagopa/mui-italia|@mui|@fontsource|node-fetch|mixpanel-browser)/)',
        '/node_modules/@pagopa/selfcare-common-frontend/lib/config/env\\.js$',
      ];

      jestConfig.moduleNameMapper = {
        ...(jestConfig.moduleNameMapper || {}),
        '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',

        // Force-mock selfcare env module even when it is imported internally via relative paths
        // (e.g. "../config/env", "../../config/env", "./config/env") which would otherwise resolve
        // to node_modules/@pagopa/selfcare-common-frontend/lib/config/env.js (ESM) and break Jest.
        '^@pagopa/selfcare-common-frontend/lib/config/env$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^@pagopa/selfcare-common-frontend/lib/config/env\\.js$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^@pagopa/selfcare-common-frontend/lib/config/env\\.(mjs|cjs)$': '<rootDir>/src/__mocks__/selfcare-env.js',

        // Match the actual specifiers used inside the library sources
        '^\\.\\./config/env$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^\\.\\./config/env\\.js$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^\\.\\./\\.\\./config/env$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^\\.\\./\\.\\./config/env\\.js$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^\\./config/env$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^\\./config/env\\.js$': '<rootDir>/src/__mocks__/selfcare-env.js',

        '^@pagopa/selfcare-common-frontend/lib/services/analyticsService$':
          '<rootDir>/src/__mocks__/selfcare-analyticsService.ts',
        '^@pagopa/selfcare-common-frontend/lib/services/analyticsService\\.js$':
          '<rootDir>/src/__mocks__/selfcare-analyticsService.ts',
      };

      jestConfig.transform = {
        ...(jestConfig.transform || {}),
        '^.+\\.[jt]sx?$': 'babel-jest',
      };

      return jestConfig;
    },
  },
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
};
