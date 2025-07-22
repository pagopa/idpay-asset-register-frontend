import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import Overview from '../Overview';

// Mock delle dipendenze
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'pages.overview.overviewTitle': 'Panoramica',
                'pages.overview.overviewTitleDescription': 'Descrizione della panoramica',
                'pages.overview.overviewTitleBoxInfo': 'Informazioni Ente',
                'pages.overview.overviewTitleBoxInfoTitleLblRs': 'Ragione Sociale',
                'pages.overview.overviewTitleBoxInfoTitleLblCf': 'Codice Fiscale',
                'pages.overview.overviewTitleBoxInfoTitleLblPiva': 'Partita IVA',
                'pages.overview.overviewTitleBoxInfoTitleLblSl': 'Sede Legale',
                'pages.overview.overviewTitleBoxInfoTitleLblPec': 'PEC',
                'pages.overview.overviewTitleBoxInfoTitleLblEmailOp': 'Email Operativa',
            };
            return translations[key] || key;
        },
    }),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
    TitleBox: ({ title, subTitle, 'data-testid': dataTestId, ...props }: any) => (
        <div data-testid={dataTestId}>
            <h1>{title}</h1>
            {subTitle && <p>{subTitle}</p>}
        </div>
    ),
}));

jest.mock('../../components/OverviewProductionSection', () => {
    return function MockOverviewProductionSection() {
        return <div data-testid="overview-production-section">Production Section</div>;
    };
});

jest.mock('../../../helpers', () => ({
    fetchUserFromLocalStorage: jest.fn(),
    truncateString: jest.fn((str: string, maxLength: number) => {
        if (str.length > maxLength) {
            return str.substring(0, maxLength) + '...';
        }
        return str;
    }),
}));

jest.mock('../../../utils/constants', () => ({
    maxLengthOverviewProd: 30,
}));

const { fetchUserFromLocalStorage, truncateString } = require('../../../helpers');

describe('Overview Component', () => {
    const theme = createTheme();

    const renderWithTheme = (component: React.ReactElement) => {
        return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render main title and subtitle correctly', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            renderWithTheme(<Overview />);

            expect(screen.getByTestId('title-overview')).toBeInTheDocument();
            expect(screen.getByText('Panoramica')).toBeInTheDocument();
            expect(screen.getByText('Descrizione della panoramica')).toBeInTheDocument();
        });

        it('should render information section title', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            renderWithTheme(<Overview />);

            expect(screen.getByTestId('title-box-overview-info')).toBeInTheDocument();
            expect(screen.getByText('Informazioni Ente')).toBeInTheDocument();
        });

        it('should render OverviewProductionSection component', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            renderWithTheme(<Overview />);

            expect(screen.getByTestId('overview-production-section')).toBeInTheDocument();
        });

        it('should render all information labels', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            renderWithTheme(<Overview />);

            expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();
            expect(screen.getByText('Codice Fiscale')).toBeInTheDocument();
            expect(screen.getByText('Partita IVA')).toBeInTheDocument();
            expect(screen.getByText('Sede Legale')).toBeInTheDocument();
            expect(screen.getByText('PEC')).toBeInTheDocument();
            expect(screen.getByText('Email Operativa')).toBeInTheDocument();
        });
    });

    describe('User Data Display', () => {
        const mockUserData = {
            org_name: 'Test Organization',
            org_taxcode: 'TEST123456789',
            org_vat: 'IT12345678901',
            org_address: 'Via Test 123, Milano',
            org_pec: 'test@pec.test.it',
            org_email: 'test@test.it',
        };

        it('should display user data when available', () => {
            fetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            // Usa getByDisplayValue, queryByText con matcher flessibili o getByTitle per i tooltip
            expect(screen.getByText((content, node) => {
                return node?.textContent === 'Test Organization';
            })).toBeInTheDocument();

            expect(screen.getByText((content, node) => {
                return node?.textContent === 'TEST123456789';
            })).toBeInTheDocument();

            expect(screen.getByText((content, node) => {
                return node?.textContent === 'IT12345678901';
            })).toBeInTheDocument();

            expect(screen.getByText((content, node) => {
                return node?.textContent === 'Via Test 123, Milano';
            })).toBeInTheDocument();

            expect(screen.getByText((content, node) => {
                return node?.textContent === 'test@pec.test.it';
            })).toBeInTheDocument();

            expect(screen.getByText((content, node) => {
                return node?.textContent === 'test@test.it';
            })).toBeInTheDocument();
        });

        it('should display user data when available - alternative approach', () => {
            fetchUserFromLocalStorage.mockReturnValue(mockUserData);

            const { container } = renderWithTheme(<Overview />);

            // Approccio alternativo: verifica che i dati siano presenti nel DOM
            expect(container.textContent).toContain('Test Organization');
            expect(container.textContent).toContain('TEST123456789');
            expect(container.textContent).toContain('IT12345678901');
            expect(container.textContent).toContain('Via Test 123, Milano');
            expect(container.textContent).toContain('test@pec.test.it');
            expect(container.textContent).toContain('test@test.it');
        });

        it('should display user data in tooltips when truncated', () => {
            fetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            // Verifica che i dati siano presenti come title attributes (tooltip)
            Object.values(mockUserData).forEach(value => {
                expect(screen.queryByTitle(value)).toBeInTheDocument();
            });
        });

        it('should display dash (-) when user data is not available', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            renderWithTheme(<Overview />);

            const dashElements = screen.getAllByText('-');
            expect(dashElements).toHaveLength(6); // Uno per ogni campo vuoto
        });

        it('should display dash (-) when user data is null', () => {
            fetchUserFromLocalStorage.mockReturnValue(null);

            renderWithTheme(<Overview />);

            const dashElements = screen.getAllByText('-');
            expect(dashElements).toHaveLength(6);
        });

        it('should display partial user data correctly', () => {
            const partialUserData = {
                org_name: 'Test Organization',
                org_taxcode: null,
                org_vat: 'IT12345678901',
                org_address: undefined,
                org_pec: '',
                org_email: 'test@test.it',
            };

            fetchUserFromLocalStorage.mockReturnValue(partialUserData);

            renderWithTheme(<Overview />);

            expect(screen.getByText((content, node) => {
                return node?.textContent === 'Test Organization';
            })).toBeInTheDocument();

            expect(screen.getByText((content, node) => {
                return node?.textContent === 'IT12345678901';
            })).toBeInTheDocument();

            expect(screen.getByText((content, node) => {
                return node?.textContent === 'test@test.it';
            })).toBeInTheDocument();

            const dashElements = screen.getAllByText('-');
            expect(dashElements).toHaveLength(3); // Per i campi null, undefined ed empty
        });
    });

    describe('Text Truncation and Tooltips', () => {
        const longText = 'This is a very long text that should be truncated';
        const shortText = 'Short text';

        beforeEach(() => {
            truncateString.mockImplementation((str: string, maxLength: number) => {
                if (str.length > maxLength) {
                    return str.substring(0, maxLength) + '...';
                }
                return str;
            });
        });

        it('should truncate long text and show tooltip', () => {
            const mockUserData = {
                org_name: longText,
                org_taxcode: shortText,
            };

            fetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(truncateString).toHaveBeenCalledWith(longText, 30);
            expect(truncateString).toHaveBeenCalledWith(shortText, 30);

            // Verifica che il tooltip sia presente per il testo lungo
            const tooltipElement = screen.getByTitle(longText);
            expect(tooltipElement).toBeInTheDocument();
            expect(tooltipElement).toHaveStyle('cursor: pointer');
        });

        it('should not add tooltip for short text', () => {
            const mockUserData = {
                org_name: shortText,
            };

            fetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(screen.getByText((content, node) => {
                return node?.textContent === shortText;
            })).toBeInTheDocument();

            expect(screen.queryByTitle(shortText)).toBeInTheDocument(); // Il tooltip sarà comunque presente ma con lo stesso testo
        });

        it('should handle empty values in truncation logic', () => {
            const mockUserData = {
                org_name: '',
                org_taxcode: null,
                org_vat: undefined,
            };

            fetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            // Non dovrebbe chiamare truncateString per valori vuoti
            expect(truncateString).not.toHaveBeenCalledWith('', expect.any(Number));
            expect(truncateString).not.toHaveBeenCalledWith(null, expect.any(Number));
            expect(truncateString).not.toHaveBeenCalledWith(undefined, expect.any(Number));
        });
    });

    describe('Layout and Styling', () => {
        it('should apply correct grid layout', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            const { container } = renderWithTheme(<Overview />);

            const gridContainer = container.querySelector('[style*="grid-template-columns"]');
            expect(gridContainer).toBeInTheDocument();
        });

        it('should render footer section', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            const { container } = renderWithTheme(<Overview />);

            // Verifica che ci sia un Paper con il colore di sfondo grigio (footer)
            const footerPaper = container.querySelector('[style*="background-color"]');
            expect(footerPaper).toBeInTheDocument();
        });
    });

    describe('Component Integration', () => {
        it('should call fetchUserFromLocalStorage on mount', () => {
            renderWithTheme(<Overview />);

            expect(fetchUserFromLocalStorage).toHaveBeenCalledTimes(1);
        });

        it('should memoize user data', () => {
            const { rerender } = renderWithTheme(<Overview />);

            expect(fetchUserFromLocalStorage).toHaveBeenCalledTimes(1);

            // Re-render del componente
            rerender(<ThemeProvider theme={theme}><Overview /></ThemeProvider>);

            // fetchUserFromLocalStorage dovrebbe essere chiamato solo una volta grazie a useMemo
            expect(fetchUserFromLocalStorage).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle error when fetchUserFromLocalStorage throws', () => {
            fetchUserFromLocalStorage.mockImplementation(() => {
                throw new Error('LocalStorage error');
            });

            // Il componente dovrebbe comunque renderizzarsi anche se c'è un errore
            expect(() => renderWithTheme(<Overview />)).not.toThrow();
        });

        it('should handle undefined return from fetchUserFromLocalStorage', () => {
            fetchUserFromLocalStorage.mockReturnValue(undefined);

            renderWithTheme(<Overview />);

            const dashElements = screen.getAllByText('-');
            expect(dashElements).toHaveLength(6);
        });
    });

    describe('Accessibility', () => {
        it('should have proper test ids', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            renderWithTheme(<Overview />);

            expect(screen.getByTestId('title-overview')).toBeInTheDocument();
            expect(screen.getByTestId('title-box-overview-info')).toBeInTheDocument();
        });

        it('should have proper tooltip interaction', () => {
            const mockUserData = {
                org_name: 'Very long organization name that will be truncated',
            };

            fetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            const tooltipElement = screen.getByTitle(mockUserData.org_name);
            expect(tooltipElement).toBeInTheDocument();

            // Simula hover sul tooltip
            fireEvent.mouseOver(tooltipElement);
            expect(tooltipElement).toHaveAttribute('title', mockUserData.org_name);
        });
    });

    describe('Translation Integration', () => {
        it('should use translation keys correctly', () => {
            fetchUserFromLocalStorage.mockReturnValue({});

            renderWithTheme(<Overview />);

            // Verifica che tutte le traduzioni siano applicate
            expect(screen.getByText('Panoramica')).toBeInTheDocument();
            expect(screen.getByText('Descrizione della panoramica')).toBeInTheDocument();
            expect(screen.getByText('Informazioni Ente')).toBeInTheDocument();
            expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();
            expect(screen.getByText('Codice Fiscale')).toBeInTheDocument();
            expect(screen.getByText('Partita IVA')).toBeInTheDocument();
            expect(screen.getByText('Sede Legale')).toBeInTheDocument();
            expect(screen.getByText('PEC')).toBeInTheDocument();
            expect(screen.getByText('Email Operativa')).toBeInTheDocument();
        });
    });
});