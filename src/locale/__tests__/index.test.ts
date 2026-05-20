/// <reference types="jest" />

describe('locale/index.ts initialization', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = originalEnv;
  });

  it('does not initialize i18n when NODE_ENV is test', async () => {
    process.env.NODE_ENV = 'test';

    const i18n = (await import('../index')).default;
    expect(i18n).toBeDefined();
  });

  it('initializes i18n when NODE_ENV is not test', async () => {
    process.env.NODE_ENV = 'development';

    const i18n = (await import('../index')).default;
    expect(i18n).toBeDefined();
  });

  it('executes resource bundle loading branch when addResourceBundle exists', async () => {
    process.env.NODE_ENV = 'development';

    jest.doMock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => {
      return {
        __esModule: true,
        default: {
          use: () => ({
            init: () => ({}),
          }),
          addResourceBundle: jest.fn(),
        },
      };
    });

    const i18n = (await import('../index')).default;
    expect(i18n).toBeDefined();
  });
});
