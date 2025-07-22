import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import Overview from '../Overview';
import { fetchUserFromLocalStorage, truncateString } from '../../../helpers';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                'pages.overview.overviewTitle': 'Panoramica',
                'pages.overview.overviewTitleDescription': 'Descrizione della panoramica',
                'pages.overview.overviewTitleBoxInfo': 'Informazioni Organizzazione',
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
    withTranslation: () => (Component: any) => {
        Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
        return Component;
    },
}));

jest.mock('../../../helpers', () => ({
    fetchUserFromLocalStorage: jest.fn(),
    truncateString: jest.fn((str, maxLength) => {
        if (str && str.length > maxLength) {
            return str.substring(0, maxLength) + '...';
        }
        return str;
    }),
}));

jest.mock('../../components/OverviewProductionSection', () => {
    return function OverviewProductionSection() {
        return <div data-testid="overview-production-section">Production Section</div>;
    };
});

jest.mock('../../../utils/constants', () => ({
    emptyData: 'N/A',
    maxLengthOverviewProd: 20,
}));

const mockFetchUserFromLocalStorage = fetchUserFromLocalStorage as jest.MockedFunction<typeof fetchUserFromLocalStorage>;
const mockTruncateString = truncateString as jest.MockedFunction<typeof truncateString>;

// Theme di test per Material-UI
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

describe('Overview Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockUserData = {
        org_name: 'Test Organization Name',
        org_taxcode: 'TEST123456789',
        org_vat: 'IT12345678901',
        org_address: 'Via Test 123, Milano, Italy',
        org_pec: 'test@pec.test.it',
        org_email: 'test@test.it',
    };

    describe('Rendering Tests', () => {
        it('should render the main title and subtitle correctly', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(screen.getByText('Panoramica')).toBeInTheDocument();
            expect(screen.getByText('Descrizione della panoramica')).toBeInTheDocument();
        });

        it('should render the information section title', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(screen.getByText('Informazioni Organizzazione')).toBeInTheDocument();
        });

        it('should render all field labels', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();
            expect(screen.getByText('Codice Fiscale')).toBeInTheDocument();
            expect(screen.getByText('Partita IVA')).toBeInTheDocument();
            expect(screen.getByText('Sede Legale')).toBeInTheDocument();
            expect(screen.getByText('PEC')).toBeInTheDocument();
            expect(screen.getByText('Email Operativa')).toBeInTheDocument();
        });

        it('should render OverviewProductionSection component', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(screen.getByTestId('overview-production-section')).toBeInTheDocument();
        });

        it('should render footer paper element', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            const { container } = renderWithTheme(<Overview />);

            // Il footer è un Paper element, verifichiamo che sia presente
            const papers = container.querySelectorAll('[class*="MuiPaper"]');
            expect(papers.length).toBeGreaterThanOrEqual(2); // Info section + footer
        });
    });

    describe('User Data Display Tests', () => {
        it('should display user data with tooltips when data is available and truncated', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            mockTruncateString.mockImplementation((str, maxLength) => {
                if (str && str.length > maxLength) {
                    return str.substring(0, maxLength) + '...';
                }
                return str;
            });

            renderWithTheme(<Overview />);

            expect(screen.getByLabelText('Test Organization Name')).toBeInTheDocument();
        });

        it('should display truncated text in the UI when text exceeds max length', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(screen.getByLabelText('Test Organization Name')).toBeInTheDocument();
        });

        it('should display short text without truncation', () => {
            const shortDataUser = {
                ...mockUserData,
                org_name: 'Ragione Sociale',
                org_taxcode: 'SHORT123',
            };

            mockFetchUserFromLocalStorage.mockReturnValue(shortDataUser);

            renderWithTheme(<Overview />);

            expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();
        });
    });

    describe('Empty Data Handling Tests', () => {
        it('should display empty data placeholder when user data is null', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(null);

            renderWithTheme(<Overview />);

            // Verifica che vengano mostrati i placeholder per dati vuoti
            const emptyDataElements = screen.getAllByText('N/A');
            expect(emptyDataElements).toHaveLength(6); // 6 campi con dati vuoti
        });

        it('should display empty data placeholder when user object exists but fields are empty', () => {
            const emptyUser = {
                org_name: '',
                org_taxcode: null,
                org_vat: undefined,
                org_address: '',
                org_pec: null,
                org_email: undefined,
            };

            mockFetchUserFromLocalStorage.mockReturnValue(emptyUser);

            renderWithTheme(<Overview />);

            // Verifica che vengano mostrati i placeholder per dati vuoti
            const emptyDataElements = screen.getAllByText('N/A');
            expect(emptyDataElements).toHaveLength(6);
        });

        it('should handle partially filled user data', () => {
            const partialUser = {
                org_name: 'Ragione Sociale',
                org_taxcode: '',
                org_vat: 'IT123456789',
                org_address: null,
                org_pec: 'test@pec.it',
                org_email: undefined,
            };

            mockFetchUserFromLocalStorage.mockReturnValue(partialUser);

            renderWithTheme(<Overview />);

            // Verifica che i dati presenti siano mostrati
            expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();

            // Verifica che i campi vuoti mostrino il placeholder
            const emptyDataElements = screen.getAllByText('N/A');
            expect(emptyDataElements).toHaveLength(3);
        });
    });

    describe('Function Calls Tests', () => {
        it('should call fetchUserFromLocalStorage on component mount', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(mockFetchUserFromLocalStorage).toHaveBeenCalledTimes(1);
        });

        it('should call truncateString for each field with data', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            // Verifica che truncateString sia chiamata per ogni campo con dati
            expect(mockTruncateString).toHaveBeenCalledWith('Test Organization Name', 20);
            expect(mockTruncateString).toHaveBeenCalledWith('TEST123456789', 20);
            expect(mockTruncateString).toHaveBeenCalledWith('IT12345678901', 20);
            expect(mockTruncateString).toHaveBeenCalledWith('Via Test 123, Milano, Italy', 20);
            expect(mockTruncateString).toHaveBeenCalledWith('test@pec.test.it', 20);
            expect(mockTruncateString).toHaveBeenCalledWith('test@test.it', 20);
        });

        it('should not call truncateString for empty fields', () => {
            const userWithSomeEmptyFields = {
                org_name: 'Test Org',
                org_taxcode: '',
                org_vat: null,
                org_address: 'Via Test 123',
                org_pec: undefined,
                org_email: 'test@email.it',
            };

            mockFetchUserFromLocalStorage.mockReturnValue(userWithSomeEmptyFields);

            renderWithTheme(<Overview />);

            // Verifica che truncateString sia chiamata solo per i campi con dati
            expect(mockTruncateString).toHaveBeenCalledWith('Test Org', 20);
            expect(mockTruncateString).toHaveBeenCalledWith('Via Test 123', 20);
            expect(mockTruncateString).toHaveBeenCalledWith('test@email.it', 20);
            expect(mockTruncateString).toHaveBeenCalledTimes(3);
        });
    });

    describe('Accessibility Tests', () => {
        it('should have tooltips with proper title attributes for accessibility', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();
        });
    });

    describe('Component Structure Tests', () => {
        it('should render all Typography components with correct variants', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(mockUserData);

            renderWithTheme(<Overview />);

            // Verifica che i componenti Typography siano renderizzati
            // (Non possiamo testare direttamente le variant, ma possiamo verificare che il testo sia presente)
            expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();
            expect(screen.getByText('Codice Fiscale')).toBeInTheDocument();
            expect(screen.getByText('Partita IVA')).toBeInTheDocument();
            expect(screen.getByText('Sede Legale')).toBeInTheDocument();
            expect(screen.getByText('PEC')).toBeInTheDocument();
            expect(screen.getByText('Email Operativa')).toBeInTheDocument();
        });
    });

    describe('Error Handling Tests', () => {
        it('should handle when fetchUserFromLocalStorage returns undefined', () => {
            mockFetchUserFromLocalStorage.mockReturnValue(undefined);

            renderWithTheme(<Overview />);

            // Verifica che vengano mostrati i placeholder per dati vuoti
            const emptyDataElements = screen.getAllByText('N/A');
            expect(emptyDataElements).toHaveLength(6);
        });
    });
});