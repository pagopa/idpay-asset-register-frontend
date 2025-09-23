import * as envVar from 'env-var';

jest.mock('env-var', () => ({
    get: jest.fn((key: string) => {
        const mockValues: Record<string, any> = {
            PUBLIC_URL: { asString: () => undefined },
            REACT_APP_ENV: { required: () => ({ asString: () => 'test' }) },
            REACT_APP_PAGOPA_HELP_EMAIL: { required: () => ({ asString: () => 'help@example.com' }) },
            REACT_APP_URL_FE_PRE_LOGIN: { required: () => ({ asString: () => '/pre-login' }) },
            REACT_APP_URL_FE_LOGIN: { required: () => ({ asString: () => '/login' }) },
            REACT_APP_URL_FE_LOGOUT: { required: () => ({ asString: () => '/logout' }) },
            REACT_APP_URL_FE_LANDING: { required: () => ({ asString: () => '/landing' }) },
            REACT_APP_URL_FE_ASSISTANCE_ASSET_REGISTER: { required: () => ({ asString: () => '/assistance' }) },
            REACT_APP_URL_FE_EIE_MANUAL: { asString: () => '/manual' },
            REACT_APP_URL_API_REGISTER: { required: () => ({ asString: () => 'https://mock-api/register' }) },
            REACT_APP_API_ROLE_PERMISSION_TIMEOUT_MS: { required: () => ({ asInt: () => 5000 }) },
            REACT_APP_API_OPERATION_TIMEOUT_MS: { required: () => ({ asInt: () => 5000 }) },
            REACT_APP_URL_INSTITUTION_LOGO_PREFIX: { required: () => ({ asString: () => 'prefix' }) },
            REACT_APP_URL_INSTITUTION_LOGO_SUFFIX: { required: () => ({ asString: () => 'suffix' }) },
            REACT_APP_ANALYTICS_ENABLE: { default: () => ({ asBool: () => true }) },
            REACT_APP_ANALYTICS_MOCK: { default: () => ({ asBool: () => false }) },
            REACT_APP_ANALYTICS_DEBUG: { default: () => ({ asBool: () => false }) },
            REACT_APP_MIXPANEL_TOKEN: { required: () => ({ asString: () => 'token' }) },
            REACT_APP_MIXPANEL_API_HOST: { default: () => ({ asString: () => 'https://api-eu.mixpanel.com' }) },
            REACT_APP_ONE_TRUST_OTNOTICE_CDN_URL: { required: () => ({ asString: () => 'cdn-url' }) },
            REACT_APP_ONE_TRUST_OTNOTICE_CDN_SETTINGS: { required: () => ({ asString: () => 'cdn-settings' }) },
            REACT_APP_ONE_TRUST_PRIVACY_POLICY_ID_ASSET_REGISTER: { required: () => ({ asString: () => 'privacy-id' }) },
            REACT_APP_ONE_TRUST_PRIVACY_POLICY_JSON_URL_ASSET_REGISTER: { required: () => ({ asString: () => 'privacy-json' }) },
            REACT_APP_ONE_TRUST_TOS_ID_ASSET_REGISTER: { required: () => ({ asString: () => 'tos-id' }) },
            REACT_APP_ONE_TRUST_TOS_JSON_URL_ASSET_REGISTER: { required: () => ({ asString: () => 'tos-json' }) },
        };

        return mockValues[key];
    }),
}));

describe('ENV config', () => {
    const getMock = jest.fn();

    beforeEach(() => {
        jest.resetModules();
        (envVar.get as jest.Mock).mockImplementation(getMock);
    });

    it('should fallback PUBLIC_URL to default if undefined', () => {
        getMock.mockImplementation((key: string) => {
            if (key === 'PUBLIC_URL') {
                return {
                    asString: () => undefined,
                    required: () => ({
                        asString: () => undefined,
                        asInt: () => 1234,
                        asBool: () => true,
                    }),
                    default: () => ({
                        asBool: () => true,
                        asString: () => 'default_value',
                    }),
                };
            }
            if (key === 'REACT_APP_URL_API_REGISTER') {
                return {
                    asString: () => 'https://mock-api/register',
                    required: () => ({
                        asString: () => 'https://mock-api/register',
                        asInt: () => 1234,
                        asBool: () => true,
                    }),
                    default: () => ({
                        asBool: () => true,
                        asString: () => 'default_value',
                    }),
                };
            }
            if (key === 'REACT_APP_API_OPERATION_TIMEOUT_MS') {
                return {
                    asInt: () => 5000,
                    required: () => ({
                        asInt: () => 5000,
                        asString: () => '5000',
                        asBool: () => true,
                    }),
                    default: () => ({
                        asBool: () => true,
                        asString: () => 'default_value',
                    }),
                };
            }
            if (key === 'REACT_APP_ANALYTICS_ENABLE') {
                return {
                    asBool: () => true,
                    default: () => ({
                        asBool: () => true,
                        asString: () => 'default_value',
                    }),
                };
            }
            return {
                asString: () => `${key}_VALUE`,
                required: () => ({
                    asString: () => `${key}_VALUE`,
                    asInt: () => 1234,
                    asBool: () => true,
                }),
                default: () => ({
                    asBool: () => true,
                    asString: () => 'default_value',
                }),
            };
        });

        const { ENV } = require('../env');

        expect(ENV.PUBLIC_URL).toBe('/elenco-informatico-elettrodomestici');
        expect(ENV.URL_API.OPERATION).toBe('https://mock-api/register');
        expect(ENV.API_TIMEOUT_MS.OPERATION).toBe(5000);
        expect(ENV.ANALYTCS.ENABLE).toBe(true);
    });

    it('should use PUBLIC_URL from env if defined', () => {
        getMock.mockImplementation((key: string) => {
            return {
                asString: () => {
                    if (key === 'PUBLIC_URL') return '/custom-url';
                    return `${key}_VALUE`;
                },
                required: () => ({
                    asString: () => `${key}_VALUE`,
                    asInt: () => 1234,
                    asBool: () => true,
                }),
                default: () => ({
                    asBool: () => true,
                    asString: () => 'default_value',
                }),
            };
        });

        const { ENV } = require('../env');

        expect(ENV.PUBLIC_URL).toBe('/elenco-informatico-elettrodomestici');
    });
});
