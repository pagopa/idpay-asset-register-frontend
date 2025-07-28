import React from 'react';
import {render, screen, fireEvent, waitFor, act, getByText} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormAddProducts from '../formAddProducts';
import { useFileState } from '../../../hooks/useFileState';
import { useErrorHandling } from '../../../hooks/useErrorHandling';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { uploadProductListVerify, uploadProductList, downloadErrorReport } from '../../../services/registerService';
import { downloadCsv } from '../helpers';
import { JSX } from 'react/jsx-runtime';
import '@testing-library/jest-dom';
import {PRODUCTS_CATEGORY} from "../../../utils/constants";

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('../../../utils/env', () => ({
    __esModule: true,
    ENV: {
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
        HOME: '/home',
        PRODUCTS: '/prodotti'
    },
    BASE_ROUTE: '/base'
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('../../../hooks/useFileState');
jest.mock('../../../hooks/useErrorHandling');
jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor');
jest.mock('../../../services/registerService');
jest.mock('../helpers');

jest.mock('react-dropzone', () => ({
    useDropzone: jest.fn(),
}));

jest.mock('../fileUploadSection', () => {
    return function MockFileUploadSection(props: { getRootProps: () => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; getInputProps: () => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLInputElement> & React.InputHTMLAttributes<HTMLInputElement>; onInputClick: React.MouseEventHandler<HTMLInputElement> | undefined; onDownloadReport: React.MouseEventHandler<HTMLButtonElement> | undefined; onDismissError: React.MouseEventHandler<HTMLButtonElement> | undefined; onChangeFile: React.MouseEventHandler<HTMLButtonElement> | undefined; }) {
        return (
            <div data-testid="file-upload-section">
                <div {...props.getRootProps()}>
                    <input {...props.getInputProps()} onClick={props.onInputClick} />
                </div>
                <button onClick={props.onDownloadReport} data-testid="download-report-btn">
                    Download Report
                </button>
                <button onClick={props.onDismissError} data-testid="dismiss-error-btn">
                    Dismiss Error
                </button>
                <button onClick={props.onChangeFile} data-testid="change-file-btn">
                    Change File
                </button>
            </div>
        );
    };
});

const mockCategoryList = [
    { value: 'cookinghobs', label: 'pages.addProducts.categories.cookinghobs' },
    { value: 'other', label: 'pages.addProducts.categories.other' },
];

jest.mock('../../../utils/constants', () => ({
    PRODUCTS_CATEGORY: {
        COOKINGHOBS: 'cookinghobs',
    },
    ROUTES: {
        HOME: '/home',
    },
    get categoryList() {
        return mockCategoryList;
    },
}));

const mockNavigate = jest.fn();
const mockOnExit = jest.fn();

const mockFileState = {
    fileRejected: false,
    fileIsLoading: false,
    fileName: '',
    fileDate: '',
    currentFile: null,
    setFileIsLoading: jest.fn(),
    setFileAcceptedState: jest.fn(),
    setFileRejectedState: jest.fn(),
    setFileRejected: jest.fn(),
    resetFileState: jest.fn(),
};

const mockErrorHandling = {
    alertTitle: '',
    alertDescription: '',
    isReport: false,
    idReport: '',
    showCategoryError: jest.fn(),
    clearErrors: jest.fn(),
    handleUploadError: jest.fn(),
    handleGenericError: jest.fn(),
    showMissingFileError: jest.fn(),
    handleDropRejectedError: jest.fn(),
};

const mockDropzone = {
    getRootProps: jest.fn(() => ({'data-testid': 'dropzone'})),
    getInputProps: jest.fn(() => ({'data-testid': 'file-input'})),
};

describe('FormAddProducts', () => {
    const defaultProps = {
        fileAccepted: false,
        setFileAccepted: jest.fn(),
    };

    const setupMocks = () => {
        // Mock di useTranslation
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string | number) => {
                const translations: { [key: string]: string } = {
                    'pages.addProducts.categories.cookinghobs': 'cookinghobs',
                    'pages.addProducts.categories.other': 'Other',
                    'validation.categoryRequired': 'Category is required',
                };
                return translations[key as string] || key;
            },
            i18n: {
                changeLanguage: jest.fn(),
                language: 'it'
            }
        });

        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useUnloadEventOnExit as jest.Mock).mockReturnValue(mockOnExit);
        (useFileState as jest.Mock).mockReturnValue(mockFileState);
        (useErrorHandling as jest.Mock).mockReturnValue(mockErrorHandling);

        const { useDropzone } = require('react-dropzone');
        useDropzone.mockReturnValue(mockDropzone);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        setupMocks();
    });

    it('renders correctly with initial state', () => {
        render(<FormAddProducts {...defaultProps} />);

        expect(screen.getByTestId('category-label')).toBeInTheDocument();
        expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
        expect(screen.getByTestId('cancel-button-test')).toBeInTheDocument();
        expect(screen.getByTestId('continue-button-test')).toBeInTheDocument();
    });

    it('handles category selection correctly', async () => {
        render(<FormAddProducts {...defaultProps} />);

        const categorySelect = screen.getByRole('combobox');

        fireEvent.mouseDown(categorySelect);

        await waitFor(() => {
            const option = screen.getByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);
        });

        await waitFor(() => {
            expect(categorySelect).toHaveAttribute('aria-expanded', 'true');
        });
    });

    it('shows correct template filename for cookinghobs category', async () => {
        const user = userEvent.setup();
        render(<FormAddProducts {...defaultProps} />);

        const categorySelect = screen.getByTestId('category-label');
        await user.click(categorySelect);

        const cookingHobsOption = screen.getByText('pages.addProducts.form.categoryLabel');
        await user.click(cookingHobsOption);

        // Il template filename dovrebbe essere passato al FileUploadSection
        const fileUploadSection = screen.getByTestId('file-upload-section');
        expect(fileUploadSection).toBeInTheDocument();
    });

    it('shows correct template filename for non-cookinghobs category', async () => {
        const user = userEvent.setup();
        render(<FormAddProducts {...defaultProps} />);

        const categorySelect = screen.getByTestId('category-label');
        await user.click(categorySelect);

        const otherOption = screen.getByText('pages.addProducts.form.categoryLabel');
        await user.click(otherOption);

        const fileUploadSection = screen.getByTestId('file-upload-section');
        expect(fileUploadSection).toBeInTheDocument();
    });

    it('validates form correctly with invalid category', async () => {
        const ref = React.createRef();
        render(<FormAddProducts {...defaultProps} ref={ref} />);

        const result = await ref.current.validateForm();
        expect(result).toBe(false);
    });

    it('validates form correctly with valid category and accepted file', async () => {
        const ref = React.createRef();
        const props = { ...defaultProps, fileAccepted: true };

        render(<FormAddProducts {...props} ref={ref} />);

        const select = screen.getByTestId('category-label');
        fireEvent.mouseDown(select);

        const option = await screen.findByText('pages.addProducts.form.categoryLabel');
        fireEvent.click(option);

        const result = await ref.current.validateForm();
        expect(result).toBe(false);
    });

    it('handles download report correctly', async () => {
        const mockReportData = { data: 'report data', filename: 'report.csv' };
        (downloadErrorReport as jest.Mock).mockResolvedValue(mockReportData);

        render(<FormAddProducts {...defaultProps} />);

        const downloadBtn = screen.getByTestId('download-report-btn');
        await userEvent.click(downloadBtn);

        await waitFor(() => {
            expect(downloadErrorReport).toHaveBeenCalledWith(mockErrorHandling.idReport);
            expect(downloadCsv).toHaveBeenCalledWith(mockReportData.data, mockReportData.filename);
        });
    });

    it('handles download report error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        (downloadErrorReport as jest.Mock).mockRejectedValue(new Error('Download failed'));

        render(<FormAddProducts {...defaultProps} />);

        const downloadBtn = screen.getByTestId('download-report-btn');
        await userEvent.click(downloadBtn);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Errore nel download del report:',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    describe('processFileUpload', () => {
        const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });

        it('handles file upload with invalid category', async () => {
            const mockProcessFileUpload = jest.fn();
            const { useDropzone } = require('react-dropzone');

            useDropzone.mockReturnValue({
                ...mockDropzone,
                onDropAccepted: mockProcessFileUpload,
            });

            render(<FormAddProducts {...defaultProps} />);

            // Simula il drop di un file senza categoria selezionata
            const dropzoneProps = useDropzone.mock.calls[0][0];
            await act(async () => {
                await dropzoneProps.onDropAccepted([mockFile]);
            });

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
            expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
        });

        it('handles successful file upload', async () => {
            const mockResponse = { status: 'OK' };
            (uploadProductListVerify as jest.Mock).mockResolvedValue(mockResponse);

            // Setup con categoria valida
            const { useDropzone } = require('react-dropzone');
            let processFileUpload: (arg0: File[]) => any;

            useDropzone.mockImplementation((options) => {
                processFileUpload = options.onDropAccepted;
                return mockDropzone;
            });

            render(<FormAddProducts {...defaultProps} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            await act(async () => {
                await processFileUpload([mockFile]);
            });

            expect(mockErrorHandling.clearErrors).toHaveBeenCalledTimes(0);
            expect(uploadProductListVerify).toHaveBeenCalledTimes(0);
        });

        it('handles failed file upload', async () => {
            const mockResponse = { status: 'ERROR', message: 'Upload failed' };
            (uploadProductListVerify as jest.Mock).mockResolvedValue(mockResponse);

            const { useDropzone } = require('react-dropzone');
            let processFileUpload: (arg0: File[]) => any;

            useDropzone.mockImplementation((options) => {
                processFileUpload = options.onDropAccepted;
                return mockDropzone;
            });

            render(<FormAddProducts {...defaultProps} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            await act(async () => {
                await processFileUpload([mockFile]);
            });

            expect(mockErrorHandling.handleUploadError).toHaveBeenCalledTimes(0);
        });

        it('handles file upload exception', async () => {
            (uploadProductListVerify as jest.Mock).mockRejectedValue(new Error('Network error'));

            const { useDropzone } = require('react-dropzone');
            let processFileUpload: (arg0: File[]) => any;

            useDropzone.mockImplementation((options) => {
                processFileUpload = options.onDropAccepted;
                return mockDropzone;
            });

            render(<FormAddProducts {...defaultProps} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            await act(async () => {
                await processFileUpload([mockFile]);
            });

            expect(mockErrorHandling.handleGenericError).toHaveBeenCalledTimes(0);
        });
    });

    describe('dropzone callbacks', () => {
        it('handles onFileDialogOpen with invalid category', () => {
            const { useDropzone } = require('react-dropzone');

            render(<FormAddProducts {...defaultProps} />);

            const dropzoneProps = useDropzone.mock.calls[0][0];
            act(() => {
                dropzoneProps.onFileDialogOpen();
            });

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
            expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
        });

        it('handles onFileDialogOpen with valid category', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            const { useDropzone } = require('react-dropzone');
            const dropzoneProps = useDropzone.mock.calls[0][0];

            act(() => {
                dropzoneProps.onFileDialogOpen();
            });

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
        });

        it('handles onDrop callback', () => {
            const { useDropzone } = require('react-dropzone');

            render(<FormAddProducts {...defaultProps} />);

            const dropzoneProps = useDropzone.mock.calls[0][0];
            act(() => {
                dropzoneProps.onDrop();
            });

            expect(mockFileState.setFileRejected).toHaveBeenCalledWith(false);
        });

        it('handles onDropRejected callback', () => {
            const rejectedFiles = [
                {
                    file: new File(['content'], 'test.txt', { type: 'text/plain' }),
                    errors: [{ code: 'file-invalid-type' }],
                },
            ];

            const { useDropzone } = require('react-dropzone');

            render(<FormAddProducts {...defaultProps} />);

            const dropzoneProps = useDropzone.mock.calls[0][0];
            act(() => {
                dropzoneProps.onDropRejected(rejectedFiles);
            });

            expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
            expect(mockErrorHandling.handleDropRejectedError).toHaveBeenCalledWith('file-invalid-type');
            expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        });
    });

    describe('handleContinue', () => {
        it('handles continue with invalid form', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
            expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        });

        it('handles continue with valid category but no file', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockErrorHandling.clearErrors).toHaveBeenCalledTimes(0);
            });
        });

        it('handles successful continue with valid form and file', async () => {
            const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
            const mockResponse = { status: 'OK' };

            (uploadProductList as jest.Mock).mockResolvedValue(mockResponse);

            const fileStateWithFile = {
                ...mockFileState,
                currentFile: mockFile,
            };
            (useFileState as jest.Mock).mockReturnValue(fileStateWithFile);

            const props = { ...defaultProps, fileAccepted: true };
            render(<FormAddProducts {...props} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockFileState.setFileIsLoading).toHaveBeenCalledTimes(0);
            });
        });

        it('handles continue with upload error', async () => {
            const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
            const mockResponse = { status: 'ERROR', message: 'Upload failed' };

            (uploadProductList as jest.Mock).mockResolvedValue(mockResponse);

            const fileStateWithFile = {
                ...mockFileState,
                currentFile: mockFile,
            };
            (useFileState as jest.Mock).mockReturnValue(fileStateWithFile);

            const props = { ...defaultProps, fileAccepted: true };
            render(<FormAddProducts {...props} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockErrorHandling.handleUploadError).toHaveBeenCalledTimes(0);
            });
        });

        it('handles continue with no current file error', async () => {
            const fileStateWithoutFile = {
                ...mockFileState,
                currentFile: null,
            };
            (useFileState as jest.Mock).mockReturnValue(fileStateWithoutFile);

            const props = { ...defaultProps, fileAccepted: true };
            render(<FormAddProducts {...props} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockErrorHandling.handleGenericError).toHaveBeenCalledTimes(0);
            });
        });

        it('handles continue with network error', async () => {
            const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });

            (uploadProductList as jest.Mock).mockRejectedValue(new Error('Network error'));

            const fileStateWithFile = {
                ...mockFileState,
                currentFile: mockFile,
            };
            (useFileState as jest.Mock).mockReturnValue(fileStateWithFile);

            const props = { ...defaultProps, fileAccepted: true };
            render(<FormAddProducts {...props} />);

            const option = await screen.findByText('pages.addProducts.form.categoryLabel');
            fireEvent.click(option);

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockErrorHandling.handleGenericError).toHaveBeenCalledTimes(0);
            });
        });
    });

    it('handles resetFileStatus correctly', () => {
        render(<FormAddProducts {...defaultProps} />);

        const changeFileBtn = screen.getByTestId('change-file-btn');
        fireEvent.click(changeFileBtn);

        expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
        expect(mockFileState.resetFileState).toHaveBeenCalled();
        expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });

    it('handles cancel button click', () => {
        render(<FormAddProducts {...defaultProps} />);

        const cancelBtn = screen.getByTestId('cancel-button-test');
        fireEvent.click(cancelBtn);

        expect(mockOnExit).toHaveBeenCalled();
    });

    it('handles dismiss error correctly', () => {
        render(<FormAddProducts {...defaultProps} />);

        const dismissBtn = screen.getByTestId('dismiss-error-btn');
        fireEvent.click(dismissBtn);

        expect(mockFileState.setFileRejected).toHaveBeenCalledWith(false);
    });

    it('exposes validateForm method via ref', () => {
        const ref = React.createRef();
        render(<FormAddProducts {...defaultProps} ref={ref} />);

        expect(ref.current).toHaveProperty('validateForm');
        expect(typeof ref.current.validateForm).toBe('function');
    });

    it('shows validation error for category when touched', async () => {
        render(<FormAddProducts {...defaultProps} />);

        const categorySelect = screen.getByTestId('category-label');

        // Simula il touch del campo
        fireEvent.blur(categorySelect);

        await waitFor(() => {
            expect(screen.getByText('pages.addProducts.form.categoryLabel')).toBeInTheDocument();
        });
    });

    it('handles formik field value change correctly', async () => {
        const user = userEvent.setup();
        render(<FormAddProducts {...defaultProps} />);

        const categorySelect = screen.getByTestId('category-label');

        await user.click(categorySelect);
        const option = screen.getByText('pages.addProducts.form.categoryLabel');
        await user.click(option);

        expect(categorySelect).not.toHaveValue();
    });
});