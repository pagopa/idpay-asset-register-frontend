import { render } from '@testing-library/react';
import PrivacyPolicy from '../PrivacyPolicy';
import OneTrustContentWrapper from '../../components/OneTrustContentWrapper';
import {ENV} from "../../../utils/env";

jest.mock('../../../utils/env', () => ({
    __esModule: true,
    ENV: {
        URL_API: {
            OPERATION: 'https://mock-api/register',
        },
        API_TIMEOUT_MS: {
            OPERATION: 5000,
        },
        ONE_TRUST: {
            PRIVACY_POLICY_ID: 'otnotice-5079ee0c-cfa9-42ec-acda-66799bed5039',
            PRIVACY_POLICY_JSON_URL: 'otnotice-5079ee0c-cfa9-42ec-acda-66799bed5039'
        },
    },
}));

jest.mock('../../../routes', () => ({
    __esModule: true,
    default: {
        HOME: '/home',
        PRIVACY_POLICY: '/privacy-policy',
    },
    BASE_ROUTE: '/base',
}));


jest.mock('../../../api/registerApiClient', () => ({
    RegisterApi: {
        getProducts: jest.fn(),
        getBatchFilterItems: jest.fn(),
    },
}));

jest.mock('../../../hooks/useOneTrustNotice', () => ({
    useOneTrustNotice: jest.fn(),
}));

jest.mock('../../components/OneTrustContentWrapper', () => jest.fn(() => <div data-testid="wrapper" />));

describe('PrivacyPolicy component', () => {
    it('calls useOneTrustNotice with correct parameters and renders wrapper', () => {
        const mockUseOneTrustNotice = require('../../../hooks/useOneTrustNotice').useOneTrustNotice;

        render(<PrivacyPolicy />);

        expect(mockUseOneTrustNotice).toHaveBeenCalledWith(
            ENV.ONE_TRUST.PRIVACY_POLICY_JSON_URL,
            false,
            expect.any(Function),
            '/privacy-policy'
        );


        expect(OneTrustContentWrapper).toHaveBeenCalledWith(
            { idSelector: ENV.ONE_TRUST.PRIVACY_POLICY_ID },
            {}
        );
    });
});
