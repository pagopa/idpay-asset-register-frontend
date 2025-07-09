import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import FormAddProducts, { FormAddProductsRef } from '../formAddProducts';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            console.log('Translation key requested:', key);
            const translations: { [key: string]: string } = {
                'validation.categoryRequired': 'Categoria richiesta',
                'pages.addProducts.form.categoryLabel': 'Categoria Prodotto',
                'pages.addProducts.form.categoryPlaceholder': 'Seleziona categoria',
                'pages.addProducts.form.fileUpload.dragAreaText': 'Trascina qui il file o',
                'pages.addProducts.form.fileUpload.dragAreaLink': 'carica dal dispositivo',
                'pages.addProducts.form.fileUpload.fileUploadHelpText': 'Scarica il template',
                'pages.addProducts.form.fileUpload.fileUploadHelpLinkLabel': 'qui',
                'pages.addProducts.form.fileUpload.fileIsLoading': 'Caricamento file...',
                'pages.addProducts.form.fileUpload.validFile': 'File valido',
                'pages.addProducts.form.fileUpload.changeFile': 'Cambia file',
                'pages.addProducts.form.fileUpload.fileUploadError.invalidTypeTitle': 'Tipo file non valido',
                'pages.addProducts.form.fileUpload.fileUploadError.invalidTypeDescription': 'Formato non supportato',
                'pages.addProducts.form.fileUpload.fileUploadError.fileTooLargeTitle': 'File troppo grande',
                'pages.addProducts.form.fileUpload.fileUploadError.fileTooLargeDescription': `File troppo grande (max ${options?.x}MB)`,
                'pages.addProducts.form.fileUpload.fileUploadError.errorTitle': 'Errore',
                'pages.addProducts.form.fileUpload.fileUploadError.errorDescription': 'Errore generico',
                'pages.addProducts.form.fileUpload.fileUploadError.tooMuchProductsTitle': 'Troppi prodotti',
                'pages.addProducts.form.fileUpload.fileUploadError.tooMuchProductsDescription': 'Troppi prodotti nel file',
                'pages.addProducts.form.fileUpload.fileUploadError.wrongHeaderTitle': 'Header errato',
                'pages.addProducts.form.fileUpload.fileUploadError.wrongHeaderDescription': 'Header non valido',
                'pages.addProducts.form.fileUpload.fileUploadError.multipeErrorsTitle': 'Errori multipli',
                'pages.addProducts.form.fileUpload.fileUploadError.multipleErrorDescription': 'Errori multipli nel file',
                'pages.addProducts.form.fileUpload.fileUploadError.emptyTitle': 'File vuoto',
                'pages.addProducts.form.fileUpload.fileUploadError.emptyDescription': 'Il file è vuoto',
                'pages.addProducts.form.fileUpload.fileUploadError.errorGenericTitle': 'Errore generico',
                'commons.categories.cookinghobs': 'Piani cottura',
                'eprel': 'EPREL'
            };
            return translations[key] || key;
        }
    })
}));

jest.mock('react-dropzone', () => ({
    useDropzone: ({ onDrop, onDropAccepted, onDropRejected, onFileDialogOpen }: any) => ({
        getRootProps: jest.fn(() => ({
            className: 'dropzone',
            onClick: jest.fn()
        })),
        getInputProps: jest.fn(() => ({
            'data-testid': 'drop-input',
            onClick: jest.fn()
        })),
        _onDrop: onDrop,
        _onDropAccepted: onDropAccepted,
        _onDropRejected: onDropRejected,
        _onFileDialogOpen: onFileDialogOpen
    })
}));

jest.mock('../../../components/RejectedFile/RejectedFile', () => {
    return function RejectedFile({ title, description, isReport, onDownloadReport, dismissFn }: any) {
        return (
            <div data-testid="rejected-file">
                <div data-testid="rejected-file-title">{title}</div>
                <div data-testid="rejected-file-description">{description}</div>
                {isReport && (
                    <button data-testid="download-report-btn" onClick={onDownloadReport}>
                        Scarica Report
                    </button>
                )}
                <button data-testid="dismiss-btn" onClick={dismissFn}>
                    Chiudi
                </button>
            </div>
        );
    };
});

jest.mock('../../../components/LoadingFile/LoadingFile', () => {
    return function LoadingFile({ message }: any) {
        return <div data-testid="loading-file">{message}</div>;
    };
});

jest.mock('../../../components/AcceptedFile/AcceptedFile', () => {
    return function AcceptedFile({ fileName, fileDate, chipLabel, buttonLabel, buttonHandler }: any) {
        return (
            <div data-testid="accepted-file">
                <div data-testid="file-name">{fileName}</div>
                <div data-testid="file-date">{fileDate}</div>
                <div data-testid="chip-label">{chipLabel}</div>
                <button data-testid="change-file-btn" onClick={buttonHandler}>
                    {buttonLabel}
                </button>
            </div>
        );
    };
});

jest.mock('../../../components/InitUploadBox/InitUploadBox', () => {
    return function InitUploadBox({ text, link }: any) {
        return (
            <div data-testid="init-upload-box">
                <span>{text}</span>
                <span>{link}</span>
            </div>
        );
    };
});

jest.mock('../../../services/registerService', () => ({
    uploadProductList: jest.fn(),
    downloadErrorReport: jest.fn()
}));

jest.mock('../../../utils/constants', () => ({
    PRODUCTS_CATEGORY: {
        WASHINGMACHINES : 'WASHINGMACHINES',
        WASHERDRIERS : 'WASHERDRIERS',
        OVENS : 'OVENS',
        RANGEHOODS : 'RANGEHOODS',
        DISHWASHERS : 'DISHWASHERS',
        TUMBLEDRYERS : 'TUMBLEDRYERS',
        REFRIGERATINGAPPL : 'REFRIGERATINGAPPL',
        COOKINGHOBS : 'COOKINGHOBS',
    }
}));

jest.mock('../../../helpers', () => ({
    initUploadBoxStyle: {},
    initUploadHelperBoxStyle: {}
}));

jest.mock('../helpers', () => ({
    categoryList: [
        {
            label: 'commons.categories.washingmachines',
            value: 'WASHINGMACHINES'
        },
        {
            label: "commons.categories.washerdriers",
            value: 'WASHERDRIERS'
        },
        {
            label: "commons.categories.ovens",
            value: 'OVENS'
        },
        {
            label: "commons.categories.rangehoods",
            value: 'RANGEHOODS'
        },
        {
            label: "commons.categories.dishwashers",
            value: 'DISHWASHERS'
        },
        {
            label: "commons.categories.tumbledryers",
            value: 'TUMBLEDRYERS'
        },
        {
            label: "commons.categories.refrigeratingappl",
            value: 'REFRIGERATINGAPPL'
        },
        {
            label: "commons.categories.cookinghobs",
            value: 'COOKINGHOBS'
        },
    ],
    downloadCsv: jest.fn()
}));

const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

describe('FormAddProducts Component', () => {
    const mockSetFileAccepted = jest.fn();
    const mockUploadProductList = require('../../../services/registerService').uploadProductList;
    const mockDownloadErrorReport = require('../../../services/registerService').downloadErrorReport;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUploadProductList.mockClear();
        mockDownloadErrorReport.mockClear();
    });

    const defaultProps = {
        fileAccepted: false,
        setFileAccepted: mockSetFileAccepted
    };

    test('renders component correctly', () => {
        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByText('Categoria Prodotto')).toBeInTheDocument();
        expect(screen.getByLabelText('Seleziona categoria')).toBeInTheDocument();
        expect(screen.getByTestId('init-upload-box')).toBeInTheDocument();
    });

    test('renders category select with options', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const selectTrigger = screen.getByLabelText('Seleziona categoria');
        await user.click(selectTrigger);
        
        await waitFor(() => {
            expect(screen.getByText('Piani cottura')).toBeInTheDocument();
        });
    });

    test('shows validation error when category is not selected', async () => {
        const ref = React.createRef<FormAddProductsRef>();

        render(
            <TestWrapper>
                <FormAddProducts ref={ref} {...defaultProps} />
            </TestWrapper>
        );

        await act(async () => {
            const isValid = await ref.current?.validateForm();
            expect(isValid).toBe(false);
        });

        await waitFor(() => {
            expect(screen.getByText('Categoria richiesta')).toBeInTheDocument();
        });
    });

    test('shows template download link when category is selected', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );


        const selectTrigger = screen.getByLabelText('Seleziona categoria');
        await user.click(selectTrigger);

        const option = await screen.findByText('Piani cottura');
        await user.click(option);

        await waitFor(() => {
            expect(screen.getByText('Scarica il template')).toBeInTheDocument();
            expect(screen.getByText('qui')).toBeInTheDocument();
        });
    });

    test('validates form correctly with category and file', async () => {
        const user = userEvent.setup();
        const ref = React.createRef<FormAddProductsRef>();

        render(
            <TestWrapper>
                <FormAddProducts ref={ref} {...defaultProps} fileAccepted={true} />
            </TestWrapper>
        );

        const selectTrigger = screen.getByLabelText('Seleziona categoria');
        await user.click(selectTrigger);

        const option = await screen.findByText('Piani cottura');
        await user.click(option);

        await act(async () => {
            const isValid = await ref.current?.validateForm();
            expect(isValid).toBe(true);
        });
    });

    test('handles successful file upload', async () => {
        mockUploadProductList.mockResolvedValue({ status: 'OK' });

        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const selectTrigger = screen.getByLabelText('Seleziona categoria');
        await user.click(selectTrigger);

        const option = await screen.findByText('Piani cottura');
        await user.click(option);

        const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' });

        const { useDropzone } = require('react-dropzone');
        const mockDropzone = useDropzone({});

        await act(async () => {
            await mockDropzone._onDropAccepted([testFile]);
        });

        await waitFor(() => {
            expect(mockUploadProductList).toHaveBeenCalledWith(testFile, 'cookinghobs');
        });
    });

    test('handles file upload error', async () => {
        mockUploadProductList.mockResolvedValue({
            status: 'ERROR',
            errorKey: 'product.invalid.file.extension'
        });

        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const selectTrigger = screen.getByLabelText('Seleziona categoria');
        await user.click(selectTrigger);

        const option = await screen.findByText('Piani cottura');
        await user.click(option);

        const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' });

        const { useDropzone } = require('react-dropzone');
        const mockDropzone = useDropzone({});

        await act(async () => {
            await mockDropzone._onDropAccepted([testFile]);
        });

        await waitFor(() => {
            expect(screen.getByTestId('rejected-file')).toBeInTheDocument();
            expect(screen.getByTestId('rejected-file-title')).toHaveTextContent('Tipo file non valido');
        });
    });

    test('handles file upload with report error', async () => {
        mockUploadProductList.mockResolvedValue({
            status: 'ERROR',
            errorKey: 'product.invalid.file.report',
            productFileId: 123
        });

        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const selectTrigger = screen.getByLabelText('Seleziona categoria');
        await user.click(selectTrigger);

        const option = await screen.findByText('Piani cottura');
        await user.click(option);

        const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' });

        const { useDropzone } = require('react-dropzone');
        const mockDropzone = useDropzone({});

        await act(async () => {
            await mockDropzone._onDropAccepted([testFile]);
        });

        await waitFor(() => {
            expect(screen.getByTestId('rejected-file')).toBeInTheDocument();
            expect(screen.getByTestId('download-report-btn')).toBeInTheDocument();
        });
    });

    test('handles download error report', async () => {
        mockUploadProductList.mockResolvedValue({
            status: 'ERROR',
            errorKey: 'product.invalid.file.report',
            productFileId: 123
        });

        mockDownloadErrorReport.mockResolvedValue({
            data: 'error,data',
            filename: 'error_report.csv'
        });

        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const selectTrigger = screen.getByLabelText('Seleziona categoria');
        await user.click(selectTrigger);

        const option = await screen.findByText('Piani cottura');
        await user.click(option);

        const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' });

        const { useDropzone } = require('react-dropzone');
        const mockDropzone = useDropzone({});

        await act(async () => {
            await mockDropzone._onDropAccepted([testFile]);
        });

        await waitFor(() => {
            expect(screen.getByTestId('download-report-btn')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('download-report-btn'));

        await waitFor(() => {
            expect(mockDownloadErrorReport).toHaveBeenCalledWith('123');
        });
    });

    test('handles file rejection', async () => {
        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const rejectedFile = {
            file: new File([''], 'test.txt', { type: 'text/plain' }),
            errors: [{ code: 'file-invalid-type', message: 'Invalid type' }]
        };

        const { useDropzone } = require('react-dropzone');
        const mockDropzone = useDropzone({});

        await act(async () => {
            await mockDropzone._onDropRejected([rejectedFile]);
        });

        await waitFor(() => {
            expect(screen.getByTestId('rejected-file')).toBeInTheDocument();
            expect(screen.getByTestId('rejected-file-title')).toHaveTextContent('Tipo file non valido');
        });
    });

    test('handles file too large error', async () => {
        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const rejectedFile = {
            file: new File([''], 'test.csv', { type: 'text/csv' }),
            errors: [{ code: 'file-too-large', message: 'File too large' }]
        };

        const { useDropzone } = require('react-dropzone');
        const mockDropzone = useDropzone({});

        await act(async () => {
            await mockDropzone._onDropRejected([rejectedFile]);
        });

        await waitFor(() => {
            expect(screen.getByTestId('rejected-file')).toBeInTheDocument();
            expect(screen.getByTestId('rejected-file-title')).toHaveTextContent('File troppo grande');
        });
    });

    test('shows loading state during file upload', async () => {
        mockUploadProductList.mockImplementation(() => new Promise(resolve => {
            setTimeout(() => resolve({ status: 'OK' }), 100);
        }));

        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const selectTrigger = screen.getByLabelText('Seleziona categoria');
        await user.click(selectTrigger);

        const option = await screen.findByText('Piani cottura');
        await user.click(option);

        const testFile = new File(['test content'], 'test.csv', { type: 'text/csv' });

        const { useDropzone } = require('react-dropzone');
        const mockDropzone = useDropzone({});

        act(() => {
            mockDropzone._onDropAccepted([testFile]);
        });

        expect(screen.getByTestId('loading-file')).toBeInTheDocument();
        expect(screen.getByText('Caricamento file...')).toBeInTheDocument();
    });

    test('shows accepted file component after successful upload', async () => {
        mockUploadProductList.mockResolvedValue({ status: 'OK' });

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} fileAccepted={true} />
            </TestWrapper>
        );

        expect(screen.getByTestId('accepted-file')).toBeInTheDocument();
        expect(screen.getByTestId('chip-label')).toHaveTextContent('File valido');
        expect(screen.getByTestId('change-file-btn')).toHaveTextContent('Cambia file');
    });

    test('handles change file button click', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} fileAccepted={true} />
            </TestWrapper>
        );

        const changeFileBtn = screen.getByTestId('change-file-btn');
        await user.click(changeFileBtn);

        expect(mockSetFileAccepted).toHaveBeenCalledWith(false);
    });

    test('prevents file dialog when category is not selected', async () => {
        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const fileInput = screen.getByTestId('drop-input');

        const clickEvent = new MouseEvent('click', { bubbles: true });
        const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

        fireEvent(fileInput, clickEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('dismisses rejected file alert', async () => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <FormAddProducts {...defaultProps} />
            </TestWrapper>
        );

        const rejectedFile = {
            file: new File([''], 'test.txt', { type: 'text/plain' }),
            errors: [{ code: 'file-invalid-type', message: 'Invalid type' }]
        };

        const { useDropzone } = require('react-dropzone');
        const mockDropzone = useDropzone({});

        await act(async () => {
            await mockDropzone._onDropRejected([rejectedFile]);
        });

        expect(screen.getByTestId('rejected-file')).toBeInTheDocument();

        const dismissBtn = screen.getByTestId('dismiss-btn');
        await user.click(dismissBtn);

        await waitFor(() => {
            expect(screen.queryByTestId('rejected-file')).not.toBeInTheDocument();
        });
    });
});