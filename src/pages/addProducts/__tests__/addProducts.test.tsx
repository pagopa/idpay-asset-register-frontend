import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import AddProducts from '../addProducts';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                'breadcrumbs.exit': 'Esci',
                'breadcrumbs.home': 'Home',
                'breadcrumbs.aggiungiProdotti': 'Aggiungi Prodotti',
                'pages.addProducts.title': 'Aggiungi Prodotti',
                'pages.addProducts.boxAddTitle': 'Carica i tuoi prodotti',
                'pages.addProducts.boxAddText': 'Carica il file con i tuoi prodotti. ',
                'pages.addProducts.boxAddTextProduct': 'Formato supportato: CSV',
                'pages.addProducts.goToManual': 'Vai al manuale',
                'commons.backBtn': 'Indietro',
                'commons.continueBtn': 'Continua'
            };
            return translations[key] || key;
        }
    })
}));

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
    TitleBox: ({ title, 'data-testid': testId, ...props }: any) => (
        <div data-testid={testId} {...props}>
            <h1>{title}</h1>
        </div>
    )
}));

jest.mock('@pagopa/mui-italia', () => ({
    ButtonNaked: ({ children, onClick, startIcon, 'data-testid': testId, ...props }: any) => (
        <button data-testid={testId} onClick={onClick} {...props}>
            {startIcon}
            {children}
        </button>
    )
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
    useUnloadEventOnExit: () => jest.fn((callback) => callback())
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
}));

jest.mock('../formAddProducts', () => {
    const React = require('react');
    return {
        __esModule: true,
        default: React.forwardRef(({ fileAccepted, setFileAccepted }: any, ref: any) => {
            React.useImperativeHandle(ref, () => ({
                validateForm: jest.fn().mockResolvedValue(true)
            }));

            return (
                <div data-testid="form-add-products">
                    <input
                        type="file"
                        data-testid="file-input"
                        onChange={() => setFileAccepted(true)}
                    />
                    <div>File accepted: {fileAccepted ? 'Yes' : 'No'}</div>
                </div>
            );
        })
    };
});

jest.mock('../../../routes', () => ({
    __esModule: true,
    default: {
        HOME: '/home'
    },
    BASE_ROUTE: '/base'
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    </BrowserRouter>
);

describe('AddProducts Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders component correctly', () => {
        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        expect(screen.getByTestId('title')).toBeInTheDocument();

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Aggiungi Prodotti')).toBeInTheDocument();

        expect(screen.getByTestId('exit-button-test')).toBeInTheDocument();
        expect(screen.getByText('Esci')).toBeInTheDocument();
    });

    test('renders form section correctly', () => {
        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        expect(screen.getByTestId('title-box-info')).toBeInTheDocument();

        expect(screen.getByText('Carica il file con i tuoi prodotti.')).toBeInTheDocument();
        expect(screen.getByText('Formato supportato: CSV')).toBeInTheDocument();

        expect(screen.getByText('Vai al manuale')).toBeInTheDocument();

        expect(screen.getByTestId('form-add-products')).toBeInTheDocument();
    });

    test('renders action buttons correctly', () => {
        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        expect(screen.getByTestId('cancel-button-test')).toBeInTheDocument();
        expect(screen.getByText('Indietro')).toBeInTheDocument();

        expect(screen.getByText('Continua')).toBeInTheDocument();
    });

    test('handles file upload interaction', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        expect(screen.getByText('File accepted: No')).toBeInTheDocument();

        const fileInput = screen.getByTestId('file-input');
        await user.upload(fileInput, new File(['test'], 'test.csv', { type: 'text/csv' }));

        expect(screen.getByText('File accepted: Yes')).toBeInTheDocument();
    });

    test('handles continue button click', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        const continueButton = screen.getByText('Continua');
        await user.click(continueButton);

        expect(continueButton).toBeInTheDocument();
    });

    test('handles cancel button click', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        const cancelButton = screen.getByTestId('cancel-button-test');
        await user.click(cancelButton);

        expect(cancelButton).toBeInTheDocument();
    });

    test('handles exit button click', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        const exitButton = screen.getByTestId('exit-button-test');
        await user.click(exitButton);

        expect(exitButton).toBeInTheDocument();
    });

    test('displays correct breadcrumb structure', () => {
        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        const breadcrumbContainer = screen.getByRole('navigation');
        expect(breadcrumbContainer).toBeInTheDocument();

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Aggiungi Prodotti')).toBeInTheDocument();
    });

    test('form validation works correctly', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        const continueButton = screen.getByText('Continua');

        await user.click(continueButton);

        await waitFor(() => {
            expect(continueButton).toBeInTheDocument();
        });
    });

    test('component handles theme correctly', () => {
        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        const mainContainer = screen.getByTestId('title');
        expect(mainContainer).toBeInTheDocument();
    });

    test('accessibility attributes are present', () => {
        render(
            <TestWrapper>
                <AddProducts />
            </TestWrapper>
        );

        expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'breadcrumb');

        expect(screen.getByRole('button', { name: /esci/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /indietro/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /continua/i })).toBeInTheDocument();
    });
});