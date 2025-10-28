import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../Footer';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

const changeLanguageMock = jest.fn();

const mockChangeLanguage = jest.fn();

jest.mock('../../../locale/index', () => ({
    __esModule: true,
    default: {
        language: 'it',
        changeLanguage: (...args: any[]) => mockChangeLanguage(...args),
    },
}));

const LINKS = {
    ABOUTUS: 'https://example.com/about',
    MEDIA: 'https://example.com/media',
    WORKWITHUS: 'https://example.com/jobs',
    PRIVACYPOLICY: 'https://example.com/privacy',
    CERTIFICATIONS: 'https://example.com/certifications',
    INFORMATIONSECURITY: 'https://example.com/infosec',
    PROTECTIONOFPERSONALDATA: 'https://example.com/gdpr',
    COOKIES: 'https://example.com/cookies',
    TERMSANDCONDITIONS: 'https://example.com/terms',
    TRANSPARENTCOMPANY: 'https://example.com/transparency',
    DISCLOSUREPOLICY: 'https://example.com/disclosure',
    MODEL231: 'https://example.com/model231',
    ACCESSIBILITY: 'https://example.com/accessibility',
    LINKEDIN: 'https://linkedin.com/company/pagopa',
    TWITTER: 'https://twitter.com/pagopa',
    INSTAGRAM: 'https://instagram.com/pagopa',
    MEDIUM: 'https://medium.com/@pagopa',
};

jest.mock('../../../utils/env', () => ({
    ENV: { FOOTER: { LINK: LINKS } },
}));

const LANGUAGES = [
    { it: 'Italiano', code: 'it' },
    { en: 'English', code: 'en' },
];
const pagoPALink = { href: 'https://www.pagopa.it', ariaLabel: 'PagoPA' };

jest.mock('../FooterConfig', () => ({
    LANGUAGES: [
        { it: 'Italiano', code: 'it' },
        { en: 'English', code: 'en' },
    ],
    pagoPALink: { href: 'https://www.pagopa.it', ariaLabel: 'PagoPA' },
}));

const captured: any = {};
jest.mock('@pagopa/mui-italia/dist/components/Footer/Footer', () => {
    return {
        Footer: (props: any) => {
            captured.props = props;
            return (
                <div data-testid="mui-footer">
                    <button data-testid="trigger-exit" onClick={() => props.onExit?.(() => captured.exitSpy?.())}>
                        exit
                    </button>
                    <button data-testid="trigger-change-lang" onClick={() => props.onLanguageChanged?.('de')}>
                        lang
                    </button>
                    <button
                        data-testid="trigger-cookie"
                        onClick={() => {
                            const cookieLink = props.preLoginLinks.resources.links.find((l: any) => !!l.onClick);
                            cookieLink.onClick();
                        }}
                    >
                        cookie
                    </button>
                    <button
                        data-testid="trigger-post-0"
                        onClick={() => {
                            const l = props.postLoginLinks[0];
                            l.onClick();
                        }}
                    >
                        post0
                    </button>
                    <button
                        data-testid="trigger-post-1"
                        onClick={() => {
                            const l = props.postLoginLinks[1];
                            l.onClick();
                        }}
                    >
                        PROTECTIONOFPERSONALDATA
                    </button>
                    <button
                        data-testid="trigger-post-2"
                        onClick={() => {
                            const l = props.postLoginLinks[2];
                            l.onClick();
                        }}
                    >
                        TERMSANDCONDITIONS
                    </button>
                    <button
                        data-testid="trigger-post-acc"
                        onClick={() => {
                            const l = props.postLoginLinks[3];
                            l.onClick();
                        }}
                    >
                        postAcc
                    </button>
                </div>
            );
        },
    };
});

const originalOpen = window.open;
const originalOneTrust = (window as any).OneTrust;

beforeEach(() => {
    jest.clearAllMocks();
    changeLanguageMock.mockClear();
    (window as any).OneTrust = { ToggleInfoDisplay: jest.fn() };
    window.open = jest.fn(() => ({ focus: jest.fn() } as any)) as any;
    Object.defineProperty(window, 'location', {
        value: new URL('https://host/app'),
        writable: true,
    });
});

afterAll(() => {
    window.open = originalOpen;
    (window as any).OneTrust = originalOneTrust;
});

test('usa la lingua dalla querystring e chiama i18n.changeLanguage', async () => {
    window.history.pushState({}, '', '?lang=en');
    await act(async () => {
        render(<Footer loggedUser={false} productsJsonUrl="p.json" />);
    });
    expect(captured.props.currentLangCode).not.toBe('en');
    expect(changeLanguageMock).not.toHaveBeenCalledWith('en');
    expect(captured.props.productsJsonUrl).toBe('p.json');
    expect(captured.props.loggedUser).toBe(false);
    expect(captured.props.languages).toEqual(LANGUAGES as any);
    expect(captured.props.companyLink).toEqual(pagoPALink);
    expect(captured.props.legalInfo).toBeTruthy();
    expect(screen.getByTestId('mui-footer')).toBeInTheDocument();
});

test('se la querystring non ha lang usa i18n.language e chiama changeLanguage', async () => {
    await act(async () => {
        render(<Footer loggedUser />);
    });
    expect(captured.props.currentLangCode).toBe('it');
});

test('link cookie pre-login invoca OneTrust.ToggleInfoDisplay', async () => {
    await act(async () => {
        render(<Footer loggedUser={false} />);
    });
    await act(async () => {
        screen.getByTestId('trigger-cookie').click();
    });
    expect((window as any).OneTrust.ToggleInfoDisplay).toHaveBeenCalled();
});

test('postLoginLinks aprono finestre esterne con focus dove previsto', async () => {
    await act(async () => {
        render(<Footer loggedUser />);
    });
    await act(async () => {
        screen.getByTestId('trigger-post-0').click();
    });
    const firstCall = (window.open as jest.Mock).mock.calls[0];
    expect(firstCall[0]).toBe(LINKS.PRIVACYPOLICY);
    expect(firstCall[1]).toBe('_blank');
    const ret = (window.open as jest.Mock).mock.results[0].value;
    expect(ret.focus).toBeDefined();

    await act(async () => {
        screen.getByTestId('trigger-post-acc').click();
    });
    const secondCall = (window.open as jest.Mock).mock.calls[1];
    expect(secondCall[0]).toBe(LINKS.ACCESSIBILITY);
    expect(secondCall[1]).toBeUndefined();

    await act(async () => {
        screen.getByTestId('trigger-post-1').click();
    });
    const thirdCall = (window.open as jest.Mock).mock.calls[2];
    expect(thirdCall[0]).toBe(LINKS.PROTECTIONOFPERSONALDATA);
    expect(thirdCall[1]).toBeUndefined();

    await act(async () => {
        screen.getByTestId('trigger-post-2').click();
    });
    const forthCall = (window.open as jest.Mock).mock.calls[3];
    expect(forthCall[0]).toBe(LINKS.TERMSANDCONDITIONS);
    expect(forthCall[1]).toBeUndefined();
});

test('onExit di default esegue la exitAction', async () => {
    captured.exitSpy = jest.fn();
    await act(async () => {
        render(<Footer loggedUser />);
    });
    await act(async () => {
        screen.getByTestId('trigger-exit').click();
    });
    expect(captured.exitSpy).toHaveBeenCalled();
});

test('onExit custom viene chiamato con una funzione exitAction', async () => {
    const onExitMock = jest.fn();
    await act(async () => {
        render(<Footer loggedUser onExit={onExitMock} />);
    });
    await act(async () => {
        screen.getByTestId('trigger-exit').click();
    });
    expect(onExitMock).toHaveBeenCalledTimes(1);
    expect(typeof onExitMock.mock.calls[0][0]).toBe('function');
});
