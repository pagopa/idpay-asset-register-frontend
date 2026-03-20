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
        '^@pagopa/selfcare-common-frontend/lib/config/env$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^@pagopa/selfcare-common-frontend/lib/config/env.js$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^@pagopa/selfcare-common-frontend/lib/config/env\\.js$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^@pagopa/selfcare-common-frontend/lib/config/env\\.mjs$': '<rootDir>/src/__mocks__/selfcare-env.js',
        '^@pagopa/selfcare-common-frontend/lib/config/env\\.cjs$': '<rootDir>/src/__mocks__/selfcare-env.js',
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
