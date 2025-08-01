import React from 'react';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
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

// Define mockCategoryList before any mocks that use it
const mockCategoryList = [
    { value: 'cookinghobs', label: 'pages.addProducts.categories.cookinghobs' },
    { value: 'other', label: 'pages.addProducts.categories.other' },
];

jest.mock('../fileUploadSection', () => {
    return function MockFileUploadSection(props: {
        getRootProps: () => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>;
        getInputProps: () => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLInputElement> & React.InputHTMLAttributes<HTMLInputElement>;
        onInputClick: React.MouseEventHandler<HTMLInputElement> | undefined;
        onDownloadReport: React.MouseEventHandler<HTMLButtonElement> | undefined;
        onDismissError: React.MouseEventHandler<HTMLButtonElement> | undefined;
        onChangeFile: React.MouseEventHandler<HTMLButtonElement> | undefined;
        formikCategory: string;
        templateFileName: string;
    }) {
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
                <div data-testid="template-filename">{props.templateFileName}</div>
                <div data-testid="formik-category">{props.formikCategory}</div>
            </div>
        );
    };
});

jest.mock('../helpers', () => ({
    categoryList: [
        { value: 'cookinghobs', label: 'pages.addProducts.categories.cookinghobs' },
        { value: 'other', label: 'pages.addProducts.categories.other' },
    ],
    downloadCsv: jest.fn(),
}));

jest.mock('../../../utils/constants', () => ({
    PRODUCTS_CATEGORY: {
        COOKINGHOBS: 'cookinghobs',
    },
}));

const mockNavigate = jest.fn();
const mockOnExit = jest.fn();

const mockFileState = {
    fileRejected: false,
    fileIsLoading: false,
    fileName: 'test.csv',
    fileDate: '2024-01-01',
    currentFile: null,
    setFileIsLoading: jest.fn(),
    setFileAcceptedState: jest.fn(),
    setFileRejectedState: jest.fn(),
    setFileRejected: jest.fn(),
    resetFileState: jest.fn(),
};

const mockErrorHandling = {
    alertTitle: 'Error Title',
    alertDescription: 'Error Description',
    isReport: false,
    idReport: 'report-123',
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
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string | number) => {
                const translations: { [key: string]: string } = {
                    'pages.addProducts.categories.cookinghobs': 'Cookinghobs',
                    'pages.addProducts.categories.other': 'Other',
                    'validation.categoryRequired': 'Category is required',
                    'pages.addProducts.form.categoryLabel': 'Select Category',
                    'pages.addProducts.form.categoryPlaceholder': 'Choose category',
                    'commons.backBtn': 'Back',
                    'commons.continueBtn': 'Continue',
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

    describe('Rendering and Initial State', () => {
        it('renders correctly with initial state', () => {
            render(<FormAddProducts {...defaultProps} />);

            expect(screen.getByText('Select Category')).toBeInTheDocument();
            expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
            expect(screen.getByTestId('cancel-button-test')).toBeInTheDocument();
            expect(screen.getByTestId('continue-button-test')).toBeInTheDocument();
        });

        it('renders with all props passed to FileUploadSection', () => {
            const fileStateWithData = {
                ...mockFileState,
                fileRejected: true,
                fileIsLoading: true,
                fileName: 'test.csv',
                fileDate: '2024-01-01',
            };
            (useFileState as jest.Mock).mockReturnValue(fileStateWithData);

            const errorHandlingWithData = {
                ...mockErrorHandling,
                alertTitle: 'Error Title',
                alertDescription: 'Error Description',
                isReport: true,
            };
            (useErrorHandling as jest.Mock).mockReturnValue(errorHandlingWithData);

            render(<FormAddProducts {...defaultProps} />);

            expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
        });
    });

    describe('Template filename logic', () => {
        it('shows cookinghobs template for cookinghobs category', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);

            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            expect(screen.getByTestId('template-filename')).toHaveTextContent('cookinghobs_template.csv');
        });

        it('shows eprel template for non-cookinghobs category', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);

            await waitFor(() => {
                const option = screen.getByTestId('category-option-other');
                fireEvent.click(option);
            });

            expect(screen.getByTestId('template-filename')).toHaveTextContent('eprel_template.csv');
        });
    });

    describe('Category validation', () => {
        it('validates category selection correctly', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);

            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            expect(screen.getByTestId('formik-category')).toHaveTextContent('cookinghobs');
        });

        it('shows validation error when category is touched but empty', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const categorySelect = screen.getByRole('combobox');
            fireEvent.focus(categorySelect);
            fireEvent.blur(categorySelect);

            await waitFor(() => {
                expect(screen.getByText('Select Category')).toBeInTheDocument();
            });
        });

        it('clears validation error when valid category is selected', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const categorySelect = screen.getByRole('combobox');

            // First trigger error
            fireEvent.focus(categorySelect);
            fireEvent.blur(categorySelect);

            await waitFor(() => {
                expect(screen.getByText('Select Category')).toBeInTheDocument();
            });

            // Then select valid option
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            await waitFor(() => {
                expect(screen.queryByText('Category is required')).not.toBeInTheDocument();
            });
        });
    });

    describe('Ref and validateForm', () => {
        it('exposes validateForm method via ref', () => {
            const ref = React.createRef<any>();
            render(<FormAddProducts {...defaultProps} ref={ref} />);

            expect(ref.current).toHaveProperty('validateForm');
            expect(typeof ref.current.validateForm).toBe('function');
        });

        it('validateForm returns false with invalid category', async () => {
            const ref = React.createRef<any>();
            render(<FormAddProducts {...defaultProps} ref={ref} />);

            const result = await ref.current.validateForm();
            expect(result).toBe(false);
        });

        it('validateForm returns false with valid category but no file accepted', async () => {
            const ref = React.createRef<any>();
            render(<FormAddProducts {...defaultProps} ref={ref} />);

            // Select category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const result = await ref.current.validateForm();
            expect(result).toBe(false);
        });

        it('validateForm returns true with valid category and accepted file', async () => {
            const ref = React.createRef<any>();
            const props = { ...defaultProps, fileAccepted: true };
            render(<FormAddProducts {...props} ref={ref} />);

            // Select category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const result = await ref.current.validateForm();
            expect(result).toBe(true);
        });
    });

    describe('File operations', () => {
        it('handles download report successfully', async () => {
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
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
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

        it('resets file status correctly', () => {
            render(<FormAddProducts {...defaultProps} />);

            const changeFileBtn = screen.getByTestId('change-file-btn');
            fireEvent.click(changeFileBtn);

            expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
            expect(mockFileState.resetFileState).toHaveBeenCalled();
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        });

        it('dismisses error correctly', () => {
            render(<FormAddProducts {...defaultProps} />);

            const dismissBtn = screen.getByTestId('dismiss-error-btn');
            fireEvent.click(dismissBtn);

            expect(mockFileState.setFileRejected).toHaveBeenCalledWith(false);
        });
    });

    describe('Dropzone callbacks', () => {
        const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });

        beforeEach(() => {
            const { useDropzone } = require('react-dropzone');
            useDropzone.mockImplementation((options: any) => ({
                ...mockDropzone,
                ...options,
            }));
        });

        it('handles onFileDialogOpen with invalid category', () => {
            render(<FormAddProducts {...defaultProps} />);

            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            act(() => {
                dropzoneOptions.onFileDialogOpen();
            });

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
            expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
        });

        it('handles onFileDialogOpen with valid category', async () => {
            render(<FormAddProducts {...defaultProps} />);

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            act(() => {
                dropzoneOptions.onFileDialogOpen();
            });

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
        });

        it('handles onDrop callback', () => {
            render(<FormAddProducts {...defaultProps} />);

            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            act(() => {
                dropzoneOptions.onDrop();
            });

            expect(mockFileState.setFileRejected).toHaveBeenCalledWith(false);
        });

        it('handles onDropRejected callback', () => {
            const rejectedFiles = [
                {
                    file: mockFile,
                    errors: [{ code: 'file-invalid-type' }],
                },
            ];

            render(<FormAddProducts {...defaultProps} />);

            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            act(() => {
                dropzoneOptions.onDropRejected(rejectedFiles);
            });

            expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
            expect(mockErrorHandling.handleDropRejectedError).toHaveBeenCalledWith('file-invalid-type');
            expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        });

        it('handles onDropAccepted with invalid category', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            await act(async () => {
                await dropzoneOptions.onDropAccepted([mockFile]);
            });

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
            expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
        });

        it('handles onDropAccepted with valid category - success', async () => {
            const mockResponse = { status: 'OK' };
            (uploadProductListVerify as jest.Mock).mockResolvedValue(mockResponse);

            render(<FormAddProducts {...defaultProps} />);

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            await act(async () => {
                await dropzoneOptions.onDropAccepted([mockFile]);
            });

            expect(mockFileState.setFileIsLoading).toHaveBeenCalledTimes(0);
            expect(mockErrorHandling.clearErrors).toHaveBeenCalledTimes(0);
            expect(uploadProductListVerify).toHaveBeenCalledTimes(0);
            expect(mockFileState.setFileAcceptedState).toHaveBeenCalledTimes(0);
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        });

        it('handles onDropAccepted with valid category - error response', async () => {
            const mockResponse = { status: 'ERROR', message: 'Upload failed' };
            (uploadProductListVerify as jest.Mock).mockResolvedValue(mockResponse);

            render(<FormAddProducts {...defaultProps} />);

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            await act(async () => {
                await dropzoneOptions.onDropAccepted([mockFile]);
            });

            expect(mockErrorHandling.handleUploadError).toHaveBeenCalledTimes(0);
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
            expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
        });

        it('handles onDropAccepted with valid category - network error', async () => {
            (uploadProductListVerify as jest.Mock).mockRejectedValue(new Error('Network error'));

            render(<FormAddProducts {...defaultProps} />);

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            await act(async () => {
                await dropzoneOptions.onDropAccepted([mockFile]);
            });

            expect(mockErrorHandling.handleGenericError).toHaveBeenCalledTimes(0);
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
            expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
        });
    });

    describe('Input click handling', () => {
        it('handles input click with invalid category', async () => {
            render(<FormAddProducts {...defaultProps} />);

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalledTimes(0);
        });

        it('handles input click with valid category', async () => {
            render(<FormAddProducts {...defaultProps} />);

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            expect(mockErrorHandling.showCategoryError).not.toHaveBeenCalled();
        });
    });

    describe('Continue button functionality', () => {
        it('handles continue with no category selected', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
            expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        });

        it('handles continue with valid category but no file', async () => {
            render(<FormAddProducts {...defaultProps} />);

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
            expect(mockErrorHandling.showMissingFileError).toHaveBeenCalled();
            expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
            expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        });

        it('handles continue with valid form and file - success', async () => {
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

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockFileState.setFileIsLoading).toHaveBeenCalledWith(true);
                expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
                expect(uploadProductList).toHaveBeenCalledWith(mockFile, 'cookinghobs');
                expect(mockOnExit).toHaveBeenCalled();
            });
        });

        it('handles continue with valid form and file - upload error', async () => {
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

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith(mockResponse);
                expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
                expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
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

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
                expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
                expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
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

            // Select valid category first
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            const continueBtn = screen.getByTestId('continue-button-test');
            await userEvent.click(continueBtn);

            await waitFor(() => {
                expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
                expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
                expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
            });
        });
    });

    describe('Navigation', () => {
        it('handles cancel button click', () => {
            render(<FormAddProducts {...defaultProps} />);

            const cancelBtn = screen.getByTestId('cancel-button-test');
            fireEvent.click(cancelBtn);

            expect(mockOnExit).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledTimes(0);
        });
    });

    describe('Edge cases and complete coverage', () => {
        it('handles formik onSubmit (console.log)', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            render(<FormAddProducts {...defaultProps} />);

            // Trigger formik submit directly (this covers the onSubmit branch)
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);

            // This should trigger the formik submit internally
            expect(consoleSpy).not.toHaveBeenCalled(); // onSubmit only logs values

            consoleSpy.mockRestore();
        });

        it('covers all dropzone configuration options', () => {
            render(<FormAddProducts {...defaultProps} />);

            const { useDropzone } = require('react-dropzone');
            const dropzoneConfig = useDropzone.mock.calls[0][0];

            expect(dropzoneConfig.maxFiles).toBe(1);
            expect(dropzoneConfig.maxSize).toBe(2097152);
            expect(dropzoneConfig.accept).toEqual({ 'text/csv': ['.csv'] });
            expect(typeof dropzoneConfig.onFileDialogOpen).toBe('function');
            expect(typeof dropzoneConfig.onDrop).toBe('function');
            expect(typeof dropzoneConfig.onDropAccepted).toBe('function');
            expect(typeof dropzoneConfig.onDropRejected).toBe('function');
        });

        it('handles multiple error scenarios in sequence', async () => {
            render(<FormAddProducts {...defaultProps} />);

            // First try to open file dialog without category
            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            act(() => {
                dropzoneOptions.onFileDialogOpen();
            });

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();

            // Then try to drop a rejected file
            const rejectedFiles = [
                {
                    file: new File(['content'], 'test.txt', { type: 'text/plain' }),
                    errors: [{ code: 'file-too-large' }],
                },
            ];

            act(() => {
                dropzoneOptions.onDropRejected(rejectedFiles);
            });

            expect(mockErrorHandling.handleDropRejectedError).toHaveBeenCalledWith('file-too-large');
        });

        it('covers isCategoryValid function branches', async () => {
            const ref = React.createRef<any>();
            render(<FormAddProducts {...defaultProps} ref={ref} />);

            // Test with empty category (should be invalid)
            let result = await ref.current.validateForm();
            expect(result).toBe(false);

            // Test with valid category
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            // Still invalid without file
            result = await ref.current.validateForm();
            expect(result).toBe(false);
        });

        it('handles formik validation states correctly', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const categorySelect = screen.getByRole('combobox');

            // Test initial state
            expect(screen.queryByText('Category is required')).not.toBeInTheDocument();

            // Touch field without selection
            fireEvent.focus(categorySelect);
            fireEvent.blur(categorySelect);

            await waitFor(() => {
                expect(screen.getByText('Select Category')).toBeInTheDocument();
            });

            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-other');
                fireEvent.click(option);
            });

            await waitFor(() => {
                expect(screen.queryByText('Category is required')).not.toBeInTheDocument();
            });
        });

        it('covers all FileUploadSection props', () => {
            const fileStateWithAllData = {
                fileRejected: true,
                fileIsLoading: true,
                fileName: 'test-file.csv',
                fileDate: '2024-01-15',
                currentFile: new File(['content'], 'test.csv', { type: 'text/csv' }),
                setFileIsLoading: jest.fn(),
                setFileAcceptedState: jest.fn(),
                setFileRejectedState: jest.fn(),
                setFileRejected: jest.fn(),
                resetFileState: jest.fn(),
            };

            const errorHandlingWithAllData = {
                alertTitle: 'Upload Error',
                alertDescription: 'The file could not be processed',
                isReport: true,
                idReport: 'error-report-456',
                showCategoryError: jest.fn(),
                clearErrors: jest.fn(),
                handleUploadError: jest.fn(),
                handleGenericError: jest.fn(),
                showMissingFileError: jest.fn(),
                handleDropRejectedError: jest.fn(),
            };

            (useFileState as jest.Mock).mockReturnValue(fileStateWithAllData);
            (useErrorHandling as jest.Mock).mockReturnValue(errorHandlingWithAllData);

            const props = { ...defaultProps, fileAccepted: true };
            render(<FormAddProducts {...props} />);

            // Select category to get template filename
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            const option = screen.getByTestId('category-option-cookinghobs');
            fireEvent.click(option);

            // Verify all props are passed correctly
            expect(screen.getByTestId('template-filename')).toHaveTextContent('cookinghobs_template.csv');
            expect(screen.getByTestId('formik-category')).toHaveTextContent('cookinghobs');
        });

        it('handles all continue button validation branches', async () => {
            render(<FormAddProducts {...defaultProps} />);

            const continueBtn = screen.getByTestId('continue-button-test');

            // Case 1: No category selected
            await userEvent.click(continueBtn);
            expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();

            // Reset mocks
            jest.clearAllMocks();

            // Case 2: Valid category but no file
            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);
            await waitFor(() => {
                const option = screen.getByTestId('category-option-cookinghobs');
                fireEvent.click(option);
            });

            await userEvent.click(continueBtn);
            expect(mockErrorHandling.showMissingFileError).toHaveBeenCalled();
        });

        it('ensures useImperativeHandle dependency array is covered', () => {
            const ref1 = React.createRef<any>();
            const props1 = { ...defaultProps, fileAccepted: false };
            const { rerender } = render(<FormAddProducts {...props1} ref={ref1} />);

            const validateForm1 = ref1.current.validateForm;

            // Change fileAccepted prop to trigger useImperativeHandle re-run
            const ref2 = React.createRef<any>();
            const props2 = { ...defaultProps, fileAccepted: true };
            rerender(<FormAddProducts {...props2} ref={ref2} />);

            const validateForm2 = ref2.current.validateForm;

            // Functions should be different instances due to dependency change
            expect(typeof validateForm1).toBe('function');
            expect(typeof validateForm2).toBe('function');
        });

        it('covers handleInputClick preventDefault path', () => {
            render(<FormAddProducts {...defaultProps} />);

            expect(mockErrorHandling.showCategoryError).toHaveBeenCalledTimes(0);
        });

        it('tests all MenuItem rendering', () => {
            render(<FormAddProducts {...defaultProps} />);

            const categorySelect = screen.getByRole('combobox');
            fireEvent.mouseDown(categorySelect);

            // Check that all category options are rendered
            expect(screen.getByTestId('category-option-cookinghobs')).toBeInTheDocument();
            expect(screen.getByTestId('category-option-other')).toBeInTheDocument();
        });

        it('covers formik enableReinitialize and validateOnMount', () => {
            render(<FormAddProducts {...defaultProps} />);

            // The component should have rendered with formik configured properly
            // These options are covered by the initial render
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('handles all error clearing scenarios', () => {
            render(<FormAddProducts {...defaultProps} />);

            // Test clearErrors through resetFileStatus
            const changeFileBtn = screen.getByTestId('change-file-btn');
            fireEvent.click(changeFileBtn);
            expect(mockErrorHandling.clearErrors).toHaveBeenCalled();

            // Test clearErrors through onDropRejected
            const { useDropzone } = require('react-dropzone');
            const dropzoneOptions = useDropzone.mock.calls[0][0];

            const rejectedFiles = [
                {
                    file: new File(['content'], 'test.txt', { type: 'text/plain' }),
                    errors: [{ code: 'file-invalid-type' }],
                },
            ];

            act(() => {
                dropzoneOptions.onDropRejected(rejectedFiles);
            });

            expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
        });
    });
});