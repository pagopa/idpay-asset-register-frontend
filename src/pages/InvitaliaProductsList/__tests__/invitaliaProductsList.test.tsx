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
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import InvitaliaProductsList from '../InvitaliaProductsList';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'breadcrumbs.back': 'Indietro',
                'breadcrumbs.home': 'Home',
            };
            return translations[key] || key;
        },
    }),
    withTranslation: () => (Component: any) => {
        Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
        return Component;
    },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
    useUnloadEventOnExit: () => (callback: () => void) => callback(),
}));

jest.mock('../InstitutionInfoCard', () => () => <div data-testid="institution-info-card" />);
jest.mock('../../../components/Product/ProductDataGrid', () => ({ organizationId }: { organizationId: string }) => (
    <div data-testid="product-grid">Org ID: {organizationId}</div>
));

const mockInstitution = {
    institutionId: '12345',
    description: 'Test Institution',
};

const createMockStore = (institution: any) => {
    const invitaliaSlice = createSlice({
        name: 'invitalia',
        initialState: { institution },
        reducers: {},
    });

    return configureStore({
        reducer: {
            invitalia: invitaliaSlice.reducer,
        },
    });
};

const renderComponent = (institution = mockInstitution) => {
    const store = createMockStore(institution);
    const theme = createTheme();

    return render(
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <MemoryRouter>
                    <InvitaliaProductsList />
                </MemoryRouter>
            </ThemeProvider>
        </Provider>
    );
};

describe('InvitaliaProductsList', () => {
    it('renders breadcrumbs and titles correctly', () => {
        renderComponent();

        expect(screen.getByText('Indietro')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getAllByTestId('title')[0]).toHaveTextContent('Test Institution');
        expect(screen.getAllByTestId('title')[1]).toHaveTextContent('Prodotti');
    });

    it('renders InstitutionInfoCard and ProductGrid', () => {
        renderComponent();

        expect(screen.getByTestId('institution-info-card')).toBeInTheDocument();
        expect(screen.getByTestId('product-grid')).toHaveTextContent('Org ID: 12345');
    });

    it('navigates back on button click', () => {
        renderComponent();

        const backButton = screen.getByTestId('exit-button-test');
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/base', { replace: true });
    });

    it('handles missing institution gracefully', () => {
        renderComponent(null);

        expect(screen.queryByText('Test Institution')).not.toBeInTheDocument();
        expect(screen.getByTestId('product-grid')).toHaveTextContent('Org ID:');
    });
});
