import { render } from '@testing-library/react';
import TOS from '../TOS';
import '@testing-library/jest-dom';

jest.mock('../../../utils/env', () => ({
    ENV: {
        ONE_TRUST: {
            TOS_JSON_URL: 'https://mock-url.com/tos.json',
            TOS_ID: 'mock-tos-id',
        },
    },
}));

jest.mock('../../../routes', () => ({
    __esModule: true,
    default: {
        TOS: '/tos',
    },
}));

const mockUseOneTrustNotice = jest.fn();
jest.mock('../../../hooks/useOneTrustNotice', () => ({
    useOneTrustNotice: (...args: any[]) => mockUseOneTrustNotice(...args),
}));

jest.mock('../../components/OneTrustContentWrapper', () => ({ idSelector }: { idSelector: string }) => (
    <div data-testid="one-trust-wrapper">ID: {idSelector}</div>
));

describe('TOS component', () => {
    it('renders OneTrustContentWrapper with correct ID and calls useOneTrustNotice', () => {
        const { getByTestId } = render(<TOS />);

        const wrapper = getByTestId('one-trust-wrapper');
        expect(wrapper).toBeInTheDocument();
        expect(wrapper).toHaveTextContent('ID: mock-tos-id');

        expect(mockUseOneTrustNotice).toHaveBeenCalledWith(
            'https://mock-url.com/tos.json',
            false,
            expect.any(Function),
            '/tos'
        );
    });
});
