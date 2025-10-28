import { pagoPALink, LANGUAGES } from '../FooterConfig';

jest.mock('../../../utils/env', () => ({
    ENV: {
        FOOTER: {
            LINK: {
                PAGOPALINK: 'https://www.pagopa.it',
            },
        },
    },
}));

describe('FooterConfig', () => {
    describe('pagoPALink', () => {
        it('deve contenere href corretto da ENV', () => {
            expect(pagoPALink.href).toBe('https://www.pagopa.it');
        });

        it('deve contenere ariaLabel corretto', () => {
            expect(pagoPALink.ariaLabel).toBe('Link: vai al sito di PagoPA S.p.A.');
        });

        it('deve essere un oggetto di tipo CompanyLinkType', () => {
            expect(pagoPALink).toHaveProperty('href');
            expect(pagoPALink).toHaveProperty('ariaLabel');
            expect(typeof pagoPALink.href).toBe('string');
            expect(typeof pagoPALink.ariaLabel).toBe('string');
        });
    });

    describe('LANGUAGES', () => {
        it('deve contenere tutte le lingue supportate', () => {
            expect(LANGUAGES).toHaveProperty('it');
            expect(LANGUAGES).toHaveProperty('en');
            expect(LANGUAGES).toHaveProperty('fr');
            expect(LANGUAGES).toHaveProperty('de');
            expect(LANGUAGES).toHaveProperty('sl');
        });

        describe('lingua italiana (it)', () => {
            it('deve avere tutte le traduzioni corrette', () => {
                expect(LANGUAGES.it.it).toBe('Italiano');
                expect(LANGUAGES.it.en).toBe('Inglese');
                expect(LANGUAGES.it.fr).toBe('Francese');
                expect(LANGUAGES.it.de).toBe('Tedesco');
                expect(LANGUAGES.it.sl).toBe('Sloveno');
            });

            it('deve avere 5 traduzioni', () => {
                expect(Object.keys(LANGUAGES.it)).toHaveLength(5);
            });
        });

        describe('lingua inglese (en)', () => {
            it('deve avere tutte le traduzioni corrette', () => {
                expect(LANGUAGES.en.it).toBe('Italian');
                expect(LANGUAGES.en.en).toBe('English');
                expect(LANGUAGES.en.fr).toBe('French');
                expect(LANGUAGES.en.de).toBe('German');
                expect(LANGUAGES.en.sl).toBe('Slovene');
            });

            it('deve avere 5 traduzioni', () => {
                expect(Object.keys(LANGUAGES.en)).toHaveLength(5);
            });
        });

        describe('lingua francese (fr)', () => {
            it('deve avere tutte le traduzioni corrette', () => {
                expect(LANGUAGES.fr.it).toBe('Italien');
                expect(LANGUAGES.fr.en).toBe('Anglais');
                expect(LANGUAGES.fr.fr).toBe('Français');
                expect(LANGUAGES.fr.de).toBe('Allemand');
                expect(LANGUAGES.fr.sl).toBe('Slovène');
            });

            it('deve avere 5 traduzioni', () => {
                expect(Object.keys(LANGUAGES.fr)).toHaveLength(5);
            });
        });

        describe('lingua tedesca (de)', () => {
            it('deve avere tutte le traduzioni corrette', () => {
                expect(LANGUAGES.de.it).toBe('Italienisch');
                expect(LANGUAGES.de.en).toBe('Englisch');
                expect(LANGUAGES.de.fr).toBe('Französisch');
                expect(LANGUAGES.de.de).toBe('Deutsch');
                expect(LANGUAGES.de.sl).toBe('Slowenisch');
            });

            it('deve avere 5 traduzioni', () => {
                expect(Object.keys(LANGUAGES.de)).toHaveLength(5);
            });
        });

        describe('lingua slovena (sl)', () => {
            it('deve avere tutte le traduzioni corrette', () => {
                expect(LANGUAGES.sl.it).toBe('Italienisch');
                expect(LANGUAGES.sl.en).toBe('Angleščina');
                expect(LANGUAGES.sl.fr).toBe('Französisch');
                expect(LANGUAGES.sl.de).toBe('Nemščina');
                expect(LANGUAGES.sl.sl).toBe('Slovenski');
            });

            it('deve avere 5 traduzioni', () => {
                expect(Object.keys(LANGUAGES.sl)).toHaveLength(5);
            });
        });

        it('ogni lingua deve avere le stesse chiavi', () => {
            const languages = ['it', 'en', 'fr', 'de', 'sl'];
            const firstKeys = Object.keys(LANGUAGES.it).sort();

            languages.forEach(lang => {
                const keys = Object.keys(LANGUAGES[lang as keyof typeof LANGUAGES]).sort();
                expect(keys).toEqual(firstKeys);
            });
        });

        it('tutte le traduzioni devono essere stringhe non vuote', () => {
            const languages = ['it', 'en', 'fr', 'de', 'sl'] as const;

            languages.forEach(sourceLang => {
                languages.forEach(targetLang => {
                    const translation = LANGUAGES[sourceLang][targetLang];
                    expect(typeof translation).toBe('string');
                    expect(translation.length).toBeGreaterThan(0);
                });
            });
        });

        it('deve essere un oggetto immutabile (snapshot)', () => {
            expect(LANGUAGES).toMatchSnapshot();
        });
    });

    describe('integrazione ENV', () => {
        it('pagoPALink deve usare il valore da ENV.FOOTER.LINK.PAGOPALINK', () => {
            expect(pagoPALink.href).toBe('https://www.pagopa.it');
        });
    });
});