import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {CustomFooter} from "../CustomFooter";

const renderDefault = () => {
    jest.doMock('react-i18next', () => ({
        useTranslation: () => ({
            t: (key: string) => key,
        }),
    }));
    jest.doMock('@pagopa/mui-italia', () => ({
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
    jest.doMock('../../../utils/env', () => ({
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

    const { CustomFooter } = require('../CustomFooter');
    return CustomFooter as typeof import('../CustomFooter').CustomFooter;
};

describe('CustomFooter', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    it('renders all footer links with correct labels & legal content', () => {
        const CustomFooter = renderDefault();
        const focus = jest.fn();
        (global as any).open = jest.fn(() => ({ focus }));

        render(<CustomFooter />);

        expect(screen.getByText('commons.footer.privacy')).toBeInTheDocument();
        expect(screen.getByText('commons.footer.personalData')).toBeInTheDocument();
        expect(screen.getByText('commons.footer.termsAndConditions')).toBeInTheDocument();
        expect(screen.getByText('commons.footer.a11y')).toBeInTheDocument();

        const legal = screen.getByTestId('footer-legal');
        expect(legal).toHaveTextContent('commons.footer.PagoPA');
        expect(legal).toHaveTextContent('commons.footer.legalInfo');

        const companyLink = screen.getByText('company-link');
        expect(companyLink).toBeInTheDocument();

        fireEvent.click(screen.getByText('commons.footer.privacy'));
        expect(global.open).toHaveBeenCalledWith('https://test/privacy', '_blank');

        const openResult = (global.open as jest.Mock).mock.results[0].value;
        expect(openResult.focus).toHaveBeenCalled();

        fireEvent.click(screen.getByText('commons.footer.personalData'));
        expect(global.open).toHaveBeenCalledWith('https://test/data', '_blank');
        const openResult2 = (global.open as jest.Mock).mock.results[0].value;
        expect(openResult2.focus).toHaveBeenCalled();
    });

    it('opens company link in a new tab when clicked', () => {
        const CustomFooter = renderDefault();
        (global as any).open = jest.fn(() => ({ focus: jest.fn() }));

        render(<CustomFooter />);
        fireEvent.click(screen.getByText('company-link'));
        expect(global.open).toHaveBeenCalledWith('https://www.pagopa.it/it/', '_blank');
    });

    it('handles links without href (A11Y) via onClick', () => {
        const CustomFooter = renderDefault();
        (global as any).open = jest.fn(() => ({ focus: jest.fn() }));

        render(<CustomFooter />);
        const a11y = screen.getByText('commons.footer.a11y');

        expect(a11y).not.toHaveAttribute('href');

        fireEvent.click(a11y);
        expect(global.open).toHaveBeenCalledWith('https://test/a11y', '_blank');
    });

    it('does not throw if window.open returns null (no focus path of optional chaining)', () => {
        const CustomFooter = renderDefault();
        (global as any).open = jest.fn(() => null);

        render(<CustomFooter />);
        expect(() => fireEvent.click(screen.getByText('commons.footer.termsAndConditions'))).not.toThrow();
        expect(global.open).toHaveBeenCalledWith('https://test/terms', '_blank');
    });

    it('falls back to empty string when PRIVACYPOLICY is missing (covers "|| \'\'" branch)', () => {
        jest.isolateModules(() => {
            jest.doMock('react-i18next', () => ({
                useTranslation: () => ({
                    t: (key: string) => key,
                }),
            }));
            jest.doMock('@pagopa/mui-italia', () => ({
                FooterPostLogin: ({ links, companyLink }: any) => (
                    <div>
                        <a href={companyLink.href} aria-label={companyLink.ariaLabel} onClick={companyLink.onClick}>
                            company-link
                        </a>
                        {links.map((link: any, idx: number) => (
                            <a key={idx} href={link.href} aria-label={link.ariaLabel} onClick={link.onClick}>
                                {link.label}
                            </a>
                        ))}
                    </div>
                ),
                FooterLegal: ({ content }: any) => <div data-testid="footer-legal">{content}</div>,
            }));
            jest.doMock('../../../utils/env', () => ({
                ENV: {
                    FOOTER: {
                        LINK: {
                            PRIVACYPOLICY: undefined,
                            PROTECTIONOFPERSONALDATA: 'https://test/data',
                            TERMSANDCONDITIONS: 'https://test/terms',
                            ACCESSIBILITY: 'https://test/a11y',
                        },
                    },
                },
            }));

            const { CustomFooter } = require('../CustomFooter');
            (global as any).open = jest.fn(() => ({ focus: jest.fn() }));

            render(<CustomFooter />);

            fireEvent.click(screen.getByText('commons.footer.privacy'));
            expect(global.open).toHaveBeenCalledWith('', '_blank');
        });
    });
    it('falls back to empty string when TERMS_AND_CONDITIONS  is missing (covers "|| \'\'" branch)', () => {
        jest.isolateModules(() => {
            jest.doMock('react-i18next', () => ({
                useTranslation: () => ({
                    t: (key: string) => key,
                }),
            }));
            jest.doMock('@pagopa/mui-italia', () => ({
                FooterPostLogin: ({ links, companyLink }: any) => (
                    <div>
                        <a href={companyLink.href} aria-label={companyLink.ariaLabel} onClick={companyLink.onClick}>
                            company-link
                        </a>
                        {links.map((link: any, idx: number) => (
                            <a key={idx} href={link.href} aria-label={link.ariaLabel} onClick={link.onClick}>
                                {link.label}
                            </a>
                        ))}
                    </div>
                ),
                FooterLegal: ({ content }: any) => <div data-testid="footer-legal">{content}</div>,
            }));
            jest.doMock('../../../utils/env', () => ({
                ENV: {
                    FOOTER: {
                        LINK: {
                            PRIVACYPOLICY: undefined,
                            PROTECTIONOFPERSONALDATA: 'https://test/data',
                            TERMSANDCONDITIONS: undefined,
                            ACCESSIBILITY: 'https://test/a11y',
                        },
                    },
                },
            }));

            const { CustomFooter } = require('../CustomFooter');
            (global as any).open = jest.fn(() => ({ focus: jest.fn() }));

            render(<CustomFooter />);

            fireEvent.click(screen.getByText('commons.footer.termsAndConditions'));
            expect(global.open).toHaveBeenCalledWith('', '_blank');
        });
    });
});
