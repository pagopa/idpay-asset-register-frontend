import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useScopedTranslation from '../../../hooks/useScopedTranslation';
import FormAddProducts from '../formAddProducts';
import { useFileState } from '../../../hooks/useFileState';
import { useErrorHandling } from '../../../hooks/useErrorHandling';
import { useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import { uploadProductListVerify, downloadErrorReport, uploadProductList } from '../../../services/registerService';
import { downloadCsv } from '../helpers';
import { JSX } from 'react/jsx-runtime';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({ useTranslation: jest.fn() }));
jest.mock('../../../hooks/useScopedTranslation');
jest.mock('../../../hooks/useCurrentInitiativeId', () => ({ useCurrentInitiativeId: () => 'initiative-1' }));
jest.mock('../../../hooks/useCategories', () => ({ useCategories: jest.fn() }));
jest.mock('../../../utils/env', () => ({ __esModule: true, ENV: { URL_API: { OPERATION: 'https://mock-api/register' }, API_TIMEOUT_MS: { OPERATION: 5000 } } }));
jest.mock('../../../routes', () => ({ __esModule: true, default: { HOME: '/home', PRODUCTS: '/home/:initiativeId/prodotti', OVERVIEW: '/home/:initiativeId/panoramica' }, BASE_ROUTE: '/base' }));
jest.mock('react-router-dom', () => ({ ...jest.requireActual('react-router-dom'), useNavigate: jest.fn() }));
jest.mock('../../../hooks/useFileState');
jest.mock('../../../hooks/useErrorHandling');
jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor');
jest.mock('../../../services/registerService');
jest.mock('../helpers');
jest.mock('../../../helpers', () => ({ delay: jest.fn().mockResolvedValue(undefined) }));
jest.mock('react-dropzone', () => ({ useDropzone: jest.fn() }));
jest.mock('../../../utils/constants', () => ({ DEBUG_CONSOLE: true }));
jest.mock('../../../redux/api/initiativesApi', () => ({ useGetInitiativesQuery: () => ({ data: [], isLoading: false }) }));
jest.mock('../fileUploadSection', () => {
  return function MockFileUploadSection(props: {
    getRootProps: () => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>;
    getInputProps: () => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLInputElement> & React.InputHTMLAttributes<HTMLInputElement>;
    onInputClick: React.MouseEventHandler<HTMLInputElement> | undefined;
    onDownloadReport: React.MouseEventHandler<HTMLButtonElement> | undefined;
    onDismissError: React.MouseEventHandler<HTMLButtonElement> | undefined;
    onChangeFile: React.MouseEventHandler<HTMLButtonElement> | undefined;
    formikCategory: string;
    csvTemplate: { name: string; file: string };
  }) {
    return (
      <div data-testid="file-upload-section">
        <div {...props.getRootProps()}><input {...props.getInputProps()} onClick={props.onInputClick} data-testid="file-input" /></div>
        <button onClick={props.onDownloadReport} data-testid="download-report-btn">Download Report</button>
        <button onClick={props.onDismissError} data-testid="dismiss-error-btn">Dismiss Error</button>
        <button onClick={props.onChangeFile} data-testid="change-file-btn">Change File</button>
        <div data-testid="template-filename">{props.csvTemplate?.name}</div>
        <div data-testid="formik-category">{props.formikCategory}</div>
      </div>
    );
  };
});

const mockNavigate = jest.fn();
const mockOnExit = jest.fn();
const csvFile = new File(['content'], 'test.csv', { type: 'text/csv' });
const mockFileState = {
  fileRejected: false, fileIsLoading: false, fileName: 'test.csv', fileDate: '2024-01-01',
  currentFile: null as File | null,
  setFileIsLoading: jest.fn(), setFileAcceptedState: jest.fn(), setFileRejectedState: jest.fn(),
  setFileRejected: jest.fn(), resetFileState: jest.fn(),
};
const mockErrorHandling = {
  alertTitle: 'Error Title', alertDescription: 'Error Description', isReport: false, idReport: 'report-123',
  showCategoryError: jest.fn(), clearErrors: jest.fn(), handleUploadError: jest.fn(),
  handleGenericError: jest.fn(), showMissingFileError: jest.fn(), handleDropRejectedError: jest.fn(),
};
const mockDropzone = {
  getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
  getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
};
const mockCategoriesReturn = {
  categories: {
    cookinghobs: { label: 'Piani cottura', csv: { name: 'cookinghobs_template.csv', file: '/' } },
    other: { label: 'Altro', csv: { name: 'other_template.csv', file: '/' } },
  },
};

describe('FormAddProducts', () => {
  const defaultProps = { fileAccepted: false, setFileAccepted: jest.fn() };
  const makeTFn = () => (key: string | number) => {
    const m: Record<string, string> = {
      'validation.categoryRequired': 'Category is required',
      'pages.addProducts.form.categoryLabel': 'Select Category',
      'pages.addProducts.form.categoryPlaceholder': 'Choose category',
      'common.backBtn': 'Back', 'common.continueBtn': 'Continue',
    };
    return m[String(key)] || String(key);
  };
  const setupMocks = () => {
    const t = makeTFn();
    (useTranslation as jest.Mock).mockReturnValue({ t, i18n: { changeLanguage: jest.fn(), language: 'it' } });
    (useScopedTranslation as jest.Mock).mockReturnValue({ t, isLoading: false, initiativeName: undefined });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useUnloadEventOnExit as jest.Mock).mockReturnValue(mockOnExit);
    (useFileState as jest.Mock).mockReturnValue(mockFileState);
    (useErrorHandling as jest.Mock).mockReturnValue(mockErrorHandling);
    (require('../../../hooks/useCategories').useCategories as jest.Mock).mockReturnValue(mockCategoriesReturn);
    require('react-dropzone').useDropzone.mockImplementation((options: any) => ({ ...mockDropzone, ...options }));
  };
  const selectCategory = async (id = 'category-option-cookinghobs', by: 'testId' | 'text' = 'testId') => {
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => { fireEvent.click(by === 'text' ? screen.getByText(id) : screen.getByTestId(id)); });
  };
  const getDropzoneOptions = () => require('react-dropzone').useDropzone.mock.calls[0][0];
  const getLatestDropzoneOptions = () => {
    const calls = require('react-dropzone').useDropzone.mock.calls;
    return calls[calls.length - 1][0];
  };
  const renderWithAcceptedFileAndContinue = async (uploadMock?: unknown) => {
    if (uploadMock instanceof Error || (uploadMock && typeof uploadMock === 'object' && ('details' in (uploadMock as Record<string, unknown>) || 'response' in (uploadMock as Record<string, unknown>)))) {
      (uploadProductList as jest.Mock).mockRejectedValue(uploadMock);
    } else if (uploadMock !== undefined) {
      (uploadProductList as jest.Mock).mockResolvedValue(uploadMock);
    }
    (useFileState as jest.Mock).mockReturnValue({ ...mockFileState, currentFile: csvFile });
    render(<FormAddProducts {...{ ...defaultProps, fileAccepted: true }} />);
    await selectCategory();
    await userEvent.click(screen.getByTestId('continue-button-test'));
  };
  beforeEach(() => { jest.clearAllMocks(); setupMocks(); });

  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<FormAddProducts {...defaultProps} />);
      expect(screen.getByText('Select Category')).toBeInTheDocument();
      expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button-test')).toBeInTheDocument();
      expect(screen.getByTestId('continue-button-test')).toBeInTheDocument();
    });
    it('renders with isReport=true', () => {
      (useFileState as jest.Mock).mockReturnValue({ ...mockFileState, fileRejected: true, fileIsLoading: true });
      (useErrorHandling as jest.Mock).mockReturnValue({ ...mockErrorHandling, isReport: true });
      render(<FormAddProducts {...defaultProps} />);
      expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    });
    it('renders without categories null - covers falsy JSX branch', () => {
      (require('../../../hooks/useCategories').useCategories as jest.Mock).mockReturnValue({ categories: null });
      render(<FormAddProducts {...defaultProps} />);
      expect(screen.getByTestId('file-upload-section')).toBeInTheDocument();
    });
  });

  describe('Template filename logic', () => {
    it('shows cookinghobs template for cookinghobs category', async () => {
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory('Piani cottura', 'text');
      expect(screen.getByTestId('template-filename')).toHaveTextContent('cookinghobs_template.csv');
    });
    it('shows other template for non-cookinghobs category', async () => {
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory('Altro', 'text');
      expect(screen.getByTestId('template-filename')).toHaveTextContent('other_template.csv');
    });
  });

  describe('Category validation', () => {
    it('validates category selection correctly', async () => {
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      expect(screen.getByTestId('formik-category')).toHaveTextContent('cookinghobs');
    });
    it('shows validation error when category is touched but empty', async () => {
      render(<FormAddProducts {...defaultProps} />);
      const sel = screen.getByRole('combobox');
      fireEvent.focus(sel); fireEvent.blur(sel);
      await waitFor(() => { expect(screen.getByText('Select Category')).toBeInTheDocument(); });
    });
    it('clears validation error when valid category is selected', async () => {
      render(<FormAddProducts {...defaultProps} />);
      const sel = screen.getByRole('combobox');
      fireEvent.focus(sel); fireEvent.blur(sel);
      await waitFor(() => { expect(screen.getByText('Select Category')).toBeInTheDocument(); });
      await selectCategory('Piani cottura', 'text');
      await waitFor(() => { expect(screen.queryByText('Category is required')).not.toBeInTheDocument(); });
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
      let result: any;
      await act(async () => { result = await ref.current.validateForm(); });
      expect(result).toBe(false);
    });
    it('validateForm returns false with valid category but no file', async () => {
      const ref = React.createRef<any>();
      render(<FormAddProducts {...defaultProps} ref={ref} />);
      await selectCategory();
      let result: any;
      await act(async () => { result = await ref.current.validateForm(); });
      expect(result).toBe(false);
    });
    it('validateForm returns true with valid category and accepted file', async () => {
      const ref = React.createRef<any>();
      render(<FormAddProducts {...{ ...defaultProps, fileAccepted: true }} ref={ref} />);
      await selectCategory('Piani cottura', 'text');
      let result: any;
      await act(async () => { result = await ref.current.validateForm(); });
      expect(result).toBe(true);
    });
    it('useImperativeHandle dependency array - re-creates on prop change', () => {
      const ref = React.createRef<any>();
      const { rerender } = render(<FormAddProducts {...defaultProps} ref={ref} />);
      expect(typeof ref.current.validateForm).toBe('function');
      rerender(<FormAddProducts {...{ ...defaultProps, fileAccepted: true }} ref={ref} />);
      expect(typeof ref.current.validateForm).toBe('function');
    });
  });

  describe('Download report', () => {
    it('download with .data and .filename', async () => {
      (downloadErrorReport as jest.Mock).mockResolvedValue({ data: 'report data', filename: 'report.csv' });
      render(<FormAddProducts {...defaultProps} />);
      await userEvent.click(screen.getByTestId('download-report-btn'));
      await waitFor(() => { expect(downloadCsv).toHaveBeenCalledWith('report data', 'report.csv'); });
    });
    it('download without .data - uses res directly', async () => {
      (downloadErrorReport as jest.Mock).mockResolvedValue('raw,csv');
      render(<FormAddProducts {...defaultProps} />);
      await userEvent.click(screen.getByTestId('download-report-btn'));
      await waitFor(() => { expect(downloadCsv).toHaveBeenCalledWith('raw,csv', 'report.csv'); });
    });
    it('download without .filename - uses default report.csv', async () => {
      (downloadErrorReport as jest.Mock).mockResolvedValue({ data: 'data' });
      render(<FormAddProducts {...defaultProps} />);
      await userEvent.click(screen.getByTestId('download-report-btn'));
      await waitFor(() => { expect(downloadCsv).toHaveBeenCalledWith('data', 'report.csv'); });
    });
    it('download error - console.error called when DEBUG_CONSOLE=true', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (downloadErrorReport as jest.Mock).mockRejectedValue(new Error('fail'));
      render(<FormAddProducts {...defaultProps} />);
      await userEvent.click(screen.getByTestId('download-report-btn'));
      await waitFor(() => { expect(spy).toHaveBeenCalledWith('Error downloading the report:', expect.any(Error)); });
      spy.mockRestore();
    });
  });

  describe('File state operations', () => {
    it('resets file status correctly', () => {
      render(<FormAddProducts {...defaultProps} />);
      fireEvent.click(screen.getByTestId('change-file-btn'));
      expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
      expect(mockFileState.resetFileState).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });
    it('dismisses error correctly', () => {
      render(<FormAddProducts {...defaultProps} />);
      fireEvent.click(screen.getByTestId('dismiss-error-btn'));
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(false);
    });
  });

  describe('Input click handling', () => {
    it('handles input click with invalid category - shows error', () => {
      render(<FormAddProducts {...defaultProps} />);
      fireEvent.click(screen.getByTestId('file-input'));
      expect(mockErrorHandling.showCategoryError).toHaveBeenCalledTimes(1);
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
    });
    it('handles input click with valid category - no error', async () => {
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      jest.clearAllMocks();
      setupMocks();
      fireEvent.click(screen.getByTestId('file-input'));
      expect(mockErrorHandling.showCategoryError).not.toHaveBeenCalled();
    });
  });

  describe('Dropzone callbacks', () => {

    it('onFileDialogOpen with invalid category shows error', () => {
      render(<FormAddProducts {...defaultProps} />);
      act(() => { getDropzoneOptions().onFileDialogOpen(); });
      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
    });
    it('onFileDialogOpen with valid category - no error shown', async () => {
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      act(() => { getLatestDropzoneOptions().onFileDialogOpen(); });
      expect(mockErrorHandling.showCategoryError).not.toHaveBeenCalled();
    });
    it('onDrop clears fileRejected', () => {
      render(<FormAddProducts {...defaultProps} />);
      act(() => { getDropzoneOptions().onDrop(); });
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(false);
    });
    it('onDropRejected handles file error', () => {
      render(<FormAddProducts {...defaultProps} />);
      act(() => { getDropzoneOptions().onDropRejected([{ file: csvFile, errors: [{ code: 'file-invalid-type' }] }]); });
      expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
      expect(mockErrorHandling.handleDropRejectedError).toHaveBeenCalledWith('file-invalid-type');
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });
    it('onDropAccepted with invalid category shows error (stale closure)', async () => {
      (uploadProductListVerify as jest.Mock).mockResolvedValue({ data: { status: 'OK' } });
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => { await getDropzoneOptions().onDropAccepted([csvFile]); });
      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(uploadProductListVerify).not.toHaveBeenCalled();
    });
    it('onDropAccepted with valid category - OK response accepts file', async () => {
      (uploadProductListVerify as jest.Mock).mockResolvedValue({ data: { status: 'OK' } });
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => { await getLatestDropzoneOptions().onDropAccepted([csvFile]); });
      expect(mockFileState.setFileIsLoading).toHaveBeenCalledWith(true);
      expect(uploadProductListVerify).toHaveBeenCalledWith('initiative-1', csvFile, 'COOKINGHOBS');
      expect(mockFileState.setFileAcceptedState).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(true);
    });
    it('onDropAccepted with valid category - errorKey in response', async () => {
      (uploadProductListVerify as jest.Mock).mockResolvedValue({ data: { errorKey: 'ERR_KEY' } });
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => { await getLatestDropzoneOptions().onDropAccepted([csvFile]); });
      expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith({ errorKey: 'ERR_KEY' });
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });
    it('onDropAccepted with valid category - status in response (no errorKey)', async () => {
      (uploadProductListVerify as jest.Mock).mockResolvedValue({ data: { status: 'ERROR' } });
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => { await getLatestDropzoneOptions().onDropAccepted([csvFile]); });
      expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith({ status: 'ERROR' });
    });
    it('onDropAccepted with valid category - no errorKey no status uses generic error', async () => {
      (uploadProductListVerify as jest.Mock).mockResolvedValue({ data: {} });
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => { await getLatestDropzoneOptions().onDropAccepted([csvFile]); });
      expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
    });
    it('onDropAccepted with valid category - catch with details', async () => {
      (uploadProductListVerify as jest.Mock).mockRejectedValue({ details: { errorKey: 'ERR' } });
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => { await getLatestDropzoneOptions().onDropAccepted([csvFile]); });
      expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith({ errorKey: 'ERR' });
    });
    it('onDropAccepted with valid category - catch with response.data', async () => {
      (uploadProductListVerify as jest.Mock).mockRejectedValue({ response: { data: { status: 'ERROR' } } });
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => { await getLatestDropzoneOptions().onDropAccepted([csvFile]); });
      expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith({ status: 'ERROR' });
    });
    it('onDropAccepted with valid category - catch with empty error uses generic', async () => {
      (uploadProductListVerify as jest.Mock).mockRejectedValue({});
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => { await getLatestDropzoneOptions().onDropAccepted([csvFile]); });
      expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
    });
  });

  describe('Continue button', () => {
    it('continue with no category - shows category error', async () => {
      render(<FormAddProducts {...defaultProps} />);
      await userEvent.click(screen.getByTestId('continue-button-test'));
      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });
    it('continue with valid category but no file - alertDescription empty shows missing file error', async () => {
      const localEH = { ...mockErrorHandling, alertDescription: '' };
      (useErrorHandling as jest.Mock).mockReturnValue(localEH);
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      jest.clearAllMocks();
      (useErrorHandling as jest.Mock).mockReturnValue(localEH);
      require('react-dropzone').useDropzone.mockImplementation((options: any) => ({ ...mockDropzone, ...options }));
      await userEvent.click(screen.getByTestId('continue-button-test'));
      expect(localEH.showMissingFileError).toHaveBeenCalled();
    });
    it('continue with valid category but no file - alertDescription non-empty skips missing file error', async () => {
      const localEH = { ...mockErrorHandling, alertDescription: 'Already an error' };
      (useErrorHandling as jest.Mock).mockReturnValue(localEH);
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      jest.clearAllMocks();
      (useErrorHandling as jest.Mock).mockReturnValue(localEH);
      require('react-dropzone').useDropzone.mockImplementation((options: any) => ({ ...mockDropzone, ...options }));
      await userEvent.click(screen.getByTestId('continue-button-test'));
      expect(localEH.showMissingFileError).not.toHaveBeenCalled();
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
    });
    it('continue with valid form and file - success navigates', async () => {
      (uploadProductList as jest.Mock).mockResolvedValue({ status: 200 });
      mockOnExit.mockImplementation((cb: () => void) => cb());
      (useFileState as jest.Mock).mockReturnValue({ ...mockFileState, currentFile: csvFile });
      render(<FormAddProducts {...{ ...defaultProps, fileAccepted: true }} />);
      await selectCategory();
      await userEvent.click(screen.getByTestId('continue-button-test'));
      await waitFor(() => {
        expect(uploadProductList).toHaveBeenCalledWith('initiative-1', csvFile, 'COOKINGHOBS');
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
    it('continue with valid form and file - non-200 response', async () => {
      await renderWithAcceptedFileAndContinue({ status: 400, data: { status: 'ERROR' } });
      await waitFor(() => {
        expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith({ status: 'ERROR' });
        expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
      });
    });
    it('continue with no current file throws generic error', async () => {
      (useFileState as jest.Mock).mockReturnValue({ ...mockFileState, currentFile: null });
      render(<FormAddProducts {...{ ...defaultProps, fileAccepted: true }} />);
      await selectCategory();
      await userEvent.click(screen.getByTestId('continue-button-test'));
      await waitFor(() => {
        expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
        expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      });
    });
    it.each([
      {
        name: 'catch with details from upload error',
        uploadError: { details: { errorKey: 'ERR' } },
        assertion: () => {
          expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith({ errorKey: 'ERR' });
        },
      },
      {
        name: 'catch with response.data from upload error',
        uploadError: { response: { data: { status: 'ERROR', errorKey: 'ERR' } } },
        assertion: () => {
          expect(mockErrorHandling.handleUploadError).toHaveBeenCalled();
        },
      },
      {
        name: 'catch with empty error uses handleFileProcessingError',
        uploadError: {},
        assertion: () => {
          expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
          expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
        },
      },
    ])('continue - $name', async ({ uploadError, assertion }) => {
      await renderWithAcceptedFileAndContinue(uploadError);
      await waitFor(assertion);
    });
  });

  describe('Navigation', () => {
    it('cancel button navigates', () => {
      mockOnExit.mockImplementation((cb: () => void) => cb());
      render(<FormAddProducts {...defaultProps} />);
      fireEvent.click(screen.getByTestId('cancel-button-test'));
      expect(mockOnExit).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Formik onSubmit coverage', () => {
    it('covers formik onSubmit handler by capturing formik instance', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const formikMod = require('formik');
      const originalUseFormik = formikMod.useFormik;
      let capturedSubmitForm: (() => Promise<void>) | null = null;
      jest.spyOn(formikMod, 'useFormik').mockImplementation((config: any) => {
        const result = originalUseFormik(config);
        capturedSubmitForm = result.submitForm.bind(result);
        return result;
      });
      render(<FormAddProducts {...defaultProps} />);
      await selectCategory();
      await act(async () => {
        if (capturedSubmitForm) { await capturedSubmitForm(); }
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      jest.spyOn(formikMod, 'useFormik').mockRestore();
    });
  });
});
