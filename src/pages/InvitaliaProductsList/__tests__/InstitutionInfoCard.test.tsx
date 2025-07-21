jest.mock('../../../utils/env', () => ({
    __esModule: true,
    default: {
        URL_API: {
            OPERATION: 'https://mock-api/register',
        },
        API_TIMEOUT_MS: {
            OPERATION: 5000,
        },
    },
}));

jest.mock('../../../routes', () => ({
    __esModule: true,
    default: {
        HOME: '/home'
    },
    BASE_ROUTE: '/base'
}));

jest.mock('../../../api/registerApiClient', () => ({
    RegisterApi: {
        getProducts: jest.fn(),
        getBatchFilterItems: jest.fn(),
    },
}));

import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import InstitutionInfoCard from '../InstitutionInfoCard';
import * as registerService from '../../../services/registerService';
import { truncateString } from '../../../helpers';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'pages.invitaliaProductsList.infoCardTitle': 'Informazioni Istituzione',
                'pages.invitaliaProductsList.ragioneSociale': 'Ragione Sociale',
                'pages.invitaliaProductsList.sedeLegale': 'Sede Legale',
                'pages.invitaliaProductsList.codiceFiscale': 'Codice Fiscale',
                'pages.invitaliaProductsList.pec': 'PEC',
                'pages.invitaliaProductsList.piva': 'P.IVA',
            };
            return translations[key] || key;
        },
    }),
}));

jest.mock('../../../services/registerService');
jest.mock('../../../helpers');

const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

const createMockStore = (institutionState: any) => {
    return configureStore({
        reducer: {
            invitalia: (state = institutionState) => state,
        },
        preloadedState: {
            invitalia: institutionState,
        },
    });
};

const theme = createTheme();

const mockInstitutionFromStore = {
    institutionId: '12345',
};

const mockInstitutionResponse = {
    description: 'Test Company S.r.l.',
    address: 'Via Roma 123',
    zipCode: '00100',
    city: 'Roma',
    county: 'RM',
    fiscalCode: 'TSTCMP80A01H501Z',
    digitalAddress: 'test@pec.company.com',
    vatNumber: '12345678901',
};

const mockTruncatedString = 'Test Company...';

describe('InstitutionInfoCard', () => {
    const mockedGetInstitutionById = registerService.getInstitutionById as jest.MockedFunction<
        typeof registerService.getInstitutionById
    >;
    const mockedTruncateString = truncateString as jest.MockedFunction<typeof truncateString>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedTruncateString.mockReturnValue(mockTruncatedString);
    });

    afterEach(() => {
        consoleSpy.mockClear();
    });

    const renderComponent = (institutionState: any = { institution: mockInstitutionFromStore }) => {
        const store = createMockStore(institutionState);

        jest.doMock('../../../redux/slices/invitaliaSlice', () => ({
            institutionSelector: (state: any) => state.invitalia.institution,
        }));

        return render(
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <InstitutionInfoCard />
                </ThemeProvider>
            </Provider>
        );
    };

    it('renders the component with title', () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent();

        expect(screen.getByText('INFORMAZIONI ISTITUZIONE')).toBeInTheDocument();
    });

    it('fetches and displays institution data successfully', async () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent();

        await waitFor(() => {
            expect(mockedGetInstitutionById).toHaveBeenCalledWith('12345');
        });

        expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();
        expect(screen.getByText('Sede Legale')).toBeInTheDocument();
        expect(screen.getByText('Codice Fiscale')).toBeInTheDocument();
        expect(screen.getByText('PEC')).toBeInTheDocument();
        expect(screen.getByText('P.IVA')).toBeInTheDocument();
    });

    it('displays truncated values with tooltips', async () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent();

        await waitFor(() => {
            expect(mockedGetInstitutionById).toHaveBeenCalled();
        });

        expect(mockedTruncateString).toHaveBeenCalledWith(mockInstitutionResponse.description);
        expect(mockedTruncateString).toHaveBeenCalledWith(
            `${mockInstitutionResponse.address}, ${mockInstitutionResponse.zipCode} ${mockInstitutionResponse.city} (${mockInstitutionResponse.county})`
        );
        expect(mockedTruncateString).toHaveBeenCalledWith(mockInstitutionResponse.fiscalCode);
        expect(mockedTruncateString).toHaveBeenCalledWith(mockInstitutionResponse.digitalAddress);
        expect(mockedTruncateString).toHaveBeenCalledWith(mockInstitutionResponse.vatNumber);
    });

    it('displays tooltip with full value for truncated text', async () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(mockTruncatedString)).toBeInTheDocument();
        });

        const tooltipElement = screen.getByText(mockTruncatedString).closest('[title]');
        expect(tooltipElement).toHaveAttribute('title', mockInstitutionResponse.description);
    });

    it('displays "-" for empty values', async () => {
        const incompleteInstitutionResponse = {
            ...mockInstitutionResponse,
            description: null,
            digitalAddress: '',
        };

        mockedGetInstitutionById.mockResolvedValue(incompleteInstitutionResponse);

        renderComponent();

        await waitFor(() => {
            expect(mockedGetInstitutionById).toHaveBeenCalled();
        });

        const dashElements = screen.getAllByText('-');
        expect(dashElements.length).toBeGreaterThan(0);
    });

    it('handles API error gracefully', async () => {
        const errorMessage = 'API Error';
        mockedGetInstitutionById.mockRejectedValue(new Error(errorMessage));

        renderComponent();

        await waitFor(() => {
            expect(mockedGetInstitutionById).toHaveBeenCalledWith('12345');
        });

    });

    it('handles missing institution in store', async () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent({ institution: null });

        await waitFor(() => {
            expect(mockedGetInstitutionById).toHaveBeenCalledWith('');
        });
    });

    it('handles missing institutionId in store', async () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent({ institution: {} });

        await waitFor(() => {
            expect(mockedGetInstitutionById).toHaveBeenCalledWith('');
        });
    });

    it('constructs complete address correctly', async () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent();

        await waitFor(() => {
            expect(mockedGetInstitutionById).toHaveBeenCalled();
        });

        const expectedAddress = `${mockInstitutionResponse.address}, ${mockInstitutionResponse.zipCode} ${mockInstitutionResponse.city} (${mockInstitutionResponse.county})`;
        expect(mockedTruncateString).toHaveBeenCalledWith(expectedAddress);
    });

    it('handles partial address data', async () => {
        const partialAddressResponse = {
            ...mockInstitutionResponse,
            address: 'Via Roma 123',
            zipCode: '',
            city: 'Roma',
            county: null,
        };

        mockedGetInstitutionById.mockResolvedValue(partialAddressResponse);

        renderComponent();

        await waitFor(() => {
            expect(mockedGetInstitutionById).toHaveBeenCalled();
        });

        const expectedAddress = 'Via Roma 123,  Roma ()';
        expect(mockedTruncateString).toHaveBeenCalledWith(expectedAddress);
    });

    it('renders all field labels correctly', async () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Ragione Sociale')).toBeInTheDocument();
            expect(screen.getByText('Sede Legale')).toBeInTheDocument();
            expect(screen.getByText('Codice Fiscale')).toBeInTheDocument();
            expect(screen.getByText('PEC')).toBeInTheDocument();
            expect(screen.getByText('P.IVA')).toBeInTheDocument();
        });
    });

    it('applies correct grid layout classes', () => {
        mockedGetInstitutionById.mockResolvedValue(mockInstitutionResponse);

        renderComponent();

        const mainBox = screen.getByText('INFORMAZIONI ISTITUZIONE').closest('[class*="MuiBox"]');
        expect(mainBox).toHaveStyle('grid-column: span 12');
    });
});