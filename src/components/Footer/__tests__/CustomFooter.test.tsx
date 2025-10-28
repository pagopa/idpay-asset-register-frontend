import { render, screen, fireEvent } from '@testing-library/react';
import { CustomFooter } from '../CustomFooter';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@pagopa/mui-italia', () => ({
    FooterPostLogin: ({ links, companyLink }: any) => (
        <div>
            <a href={companyLink.href} aria-label={companyLink.ariaLabel} onClick={companyLink.onClick}>
                company-link
            </a>
            {links.map((link: any, idx: number) => (
                <a
                    key={idx}
                    href={link.href}
                    aria-label={link.ariaLabel}
                    onClick={link.onClick}
                >
                    {link.label}
                </a>
            ))}
        </div>
    ),
    FooterLegal: ({ content }: any) => <div data-testid="footer-legal">{content}</div>,
}));

jest.mock('../../../utils/env', () => ({
    ENV: {
        FOOTER: {
            LINK: {
                PRIVACYPOLICY: 'https://test/privacy',
                PROTECTIONOFPERSONALDATA: 'https://test/data',
                TERMSANDCONDITIONS: 'https://test/terms',
                ACCESSIBILITY: 'https://test/a11y',
            },
        },
    },
}));

describe('CustomFooter', () => {
    beforeEach(() => {
        global.open = jest.fn(() => ({
            focus: jest.fn(),
        })) as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders all footer links with correct labels', () => {
        render(<CustomFooter />);

        expect(screen.getByText('commons.footer.privacy')).toBeInTheDocument();
        expect(screen.getByText('commons.footer.personalData')).toBeInTheDocument();
        expect(screen.getByText('commons.footer.termsAndConditions')).toBeInTheDocument();
        expect(screen.getByText('commons.footer.a11y')).toBeInTheDocument();
    });

    it('renders company link', () => {
        render(<CustomFooter />);
        const companyLink = screen.getByText('company-link');
        expect(companyLink).toBeInTheDocument();
    });

    it('opens links in a new tab when clicked', () => {
        render(<CustomFooter />);

        const privacyLink = screen.getByText('commons.footer.privacy');
        fireEvent.click(privacyLink);

        expect(global.open).toHaveBeenCalledWith('https://test/privacy', '_blank');
    });

    it('renders legal footer content', () => {
        render(<CustomFooter />);
        const legal = screen.getByTestId('footer-legal');
        expect(legal).toHaveTextContent('commons.footer.PagoPA');
        expect(legal).toHaveTextContent('commons.footer.legalInfo');
    });
});
