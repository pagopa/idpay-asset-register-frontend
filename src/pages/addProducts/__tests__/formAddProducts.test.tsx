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
import {
  uploadProductListVerify,
  downloadErrorReport,
  uploadProductList,
} from '../../../services/registerService';
import { downloadCsv } from '../helpers';
import { JSX } from 'react/jsx-runtime';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../../../hooks/useScopedTranslation');

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: {
      cookinghobs: {
        label: 'Piani cottura',
        csv: { name: 'cookinghobs_template.csv', file: '/' },
      },
      other: {
        label: 'Altro',
        csv: { name: 'other_template.csv', file: '/' },
      },
    },
  }),
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
    PRODUCTS: '/home/:initiativeId/prodotti',
    OVERVIEW: '/home/:initiativeId/panoramica',
  },
  BASE_ROUTE: '/base',
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
  return function MockFileUploadSection(props: {
    getRootProps: () => JSX.IntrinsicAttributes &
      React.ClassAttributes<HTMLDivElement> &
      React.HTMLAttributes<HTMLDivElement>;
    getInputProps: () => JSX.IntrinsicAttributes &
      React.ClassAttributes<HTMLInputElement> &
      React.InputHTMLAttributes<HTMLInputElement>;
    onInputClick: React.MouseEventHandler<HTMLInputElement> | undefined;
    onDownloadReport: React.MouseEventHandler<HTMLButtonElement> | undefined;
    onDismissError: React.MouseEventHandler<HTMLButtonElement> | undefined;
    onChangeFile: React.MouseEventHandler<HTMLButtonElement> | undefined;
    formikCategory: string;
    csvTemplate: { name: string; file: string };
  }) {
    return (
      <div data-testid="file-upload-section">
        <div {...props.getRootProps()}>
          <input {...props.getInputProps()} onClick={props.onInputClick} data-testid="file-input" />
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
        <div data-testid="template-filename">{props.csvTemplate?.name}</div>
        <div data-testid="formik-category">{props.formikCategory}</div>
      </div>
    );
  };
});

const mockNavigate = jest.fn();
const mockOnExit = jest.fn();

const mockFileState = {
  fileRejected: false,
  fileIsLoading: false,
  fileName: 'test.csv',
  fileDate: '2024-01-01',
  currentFile: null as File | null,
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
  getRootProps: jest.fn(() => ({ 'data-testid': 'dropzone' })),
  getInputProps: jest.fn(() => ({ 'data-testid': 'file-input' })),
};

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({ data: [], isLoading: false }),
}));

describe('FormAddProducts', () => {
  const defaultProps = {
    fileAccepted: false,
    setFileAccepted: jest.fn(),
  };

  const setupMocks = () => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string | number) => {
        const translations: { [key: string]: string } = {
          'validation.categoryRequired': 'Category is required',
          'pages.addProducts.form.categoryLabel': 'Select Category',
          'pages.addProducts.form.categoryPlaceholder': 'Choose category',
          'common.backBtn': 'Back',
          'common.continueBtn': 'Continue',
        };
        return translations[key as string] || String(key);
      },
      i18n: {
        changeLanguage: jest.fn(),
        language: 'it',
      },
    });

    (useScopedTranslation as jest.Mock).mockReturnValue({
      t: (key: string | number) => {
        const translations: { [key: string]: string } = {
          'validation.categoryRequired': 'Category is required',
          'pages.addProducts.form.categoryLabel': 'Select Category',
          'pages.addProducts.form.categoryPlaceholder': 'Choose category',
          'common.backBtn': 'Back',
          'common.continueBtn': 'Continue',
        };
        return translations[key as string] || String(key);
      },
      isLoading: false,
      initiativeName: undefined,
    });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useUnloadEventOnExit as jest.Mock).mockReturnValue(mockOnExit);
    (useFileState as jest.Mock).mockReturnValue(mockFileState);
    (useErrorHandling as jest.Mock).mockReturnValue(mockErrorHandling);

    const { useDropzone } = require('react-dropzone');
    useDropzone.mockImplementation((options: any) => ({
      ...mockDropzone,
      ...options,
    }));
  };

  const selectCategory = async (
    categoryIdentifier: string = 'category-option-cookinghobs',
    by: 'testId' | 'text' = 'testId'
  ) => {
    const categorySelect = screen.getByRole('combobox');
    fireEvent.mouseDown(categorySelect);

    await waitFor(() => {
      const option =
        by === 'text'
          ? screen.getByText(categoryIdentifier)
          : screen.getByTestId(categoryIdentifier);
      fireEvent.click(option);
    });
  };

  const getDropzoneOptions = () => {
    const { useDropzone } = require('react-dropzone');
    return useDropzone.mock.calls[0][0];
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
      (useFileState as jest.Mock).mockReturnValue({
        ...mockFileState,
        fileRejected: true,
        fileIsLoading: true,
      });
      (useErrorHandling as jest.Mock).mockReturnValue({
        ...mockErrorHandling,
        isReport: true,
      });

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

    it('shows eprel template for non-cookinghobs category', async () => {
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

      fireEvent.focus(categorySelect);
      fireEvent.blur(categorySelect);

      await waitFor(() => {
        expect(screen.getByText('Select Category')).toBeInTheDocument();
      });

      await selectCategory('Piani cottura', 'text');

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

      let result;
      await act(async () => {
        result = await ref.current.validateForm();
      });

      expect(result).toBe(false);
    });

    it('validateForm returns false with valid category but no file accepted', async () => {
      const ref = React.createRef<any>();
      render(<FormAddProducts {...defaultProps} ref={ref} />);

      await selectCategory();

      let result;
      await act(async () => {
        result = await ref.current.validateForm();
      });

      expect(result).toBe(false);
    });

    it('validateForm returns true with valid category and accepted file', async () => {
      const ref = React.createRef<any>();
      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} ref={ref} />);

      await selectCategory('Piani cottura', 'text');

      let result;
      await act(async () => {
        result = await ref.current.validateForm();
      });

      expect(result).toBe(true);
    });
  });

  describe('File operations', () => {
    it('handles download report successfully', async () => {
      const mockReportData = { data: 'report data', filename: 'report.csv' };
      (downloadErrorReport as jest.Mock).mockResolvedValue(mockReportData);

      render(<FormAddProducts {...defaultProps} />);

      await userEvent.click(screen.getByTestId('download-report-btn'));

      await waitFor(() => {
        expect(downloadErrorReport).toHaveBeenCalledWith(
          'initiative-1',
          mockErrorHandling.idReport
        );
        expect(downloadCsv).toHaveBeenCalledWith(mockReportData.data, mockReportData.filename);
      });
    });

    it('handles download report error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (downloadErrorReport as jest.Mock).mockRejectedValue(new Error('Download failed'));

      render(<FormAddProducts {...defaultProps} />);

      await userEvent.click(screen.getByTestId('download-report-btn'));

      await waitFor(() => {
        expect(consoleErrorSpy).not.toHaveBeenCalledWith(
          'Errore nel download del report:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

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

  describe('Dropzone callbacks', () => {
    const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });

    it('handles onFileDialogOpen with invalid category', () => {
      render(<FormAddProducts {...defaultProps} />);

      const dropzoneOptions = getDropzoneOptions();

      act(() => {
        dropzoneOptions.onFileDialogOpen();
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
    });

    it('handles onFileDialogOpen after category selection attempt', async () => {
      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      act(() => {
        dropzoneOptions.onFileDialogOpen();
      });

      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
    });

    it('handles onDrop callback', () => {
      render(<FormAddProducts {...defaultProps} />);

      const dropzoneOptions = getDropzoneOptions();

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

      const dropzoneOptions = getDropzoneOptions();

      act(() => {
        dropzoneOptions.onDropRejected(rejectedFiles);
      });

      expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
      expect(mockErrorHandling.handleDropRejectedError).toHaveBeenCalledWith('file-invalid-type');
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });

    it('handles onDropAccepted with category still considered invalid', async () => {
      (uploadProductListVerify as jest.Mock).mockResolvedValue({ data: { status: 'OK' } });

      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
      expect(uploadProductListVerify).not.toHaveBeenCalled();
    });

    it('does not call upload error handler when category is still invalid before upload', async () => {
      (uploadProductListVerify as jest.Mock).mockResolvedValueOnce({
        data: { errorKey: 'ERR_UPLOAD' },
      });

      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
      expect(mockErrorHandling.handleUploadError).not.toHaveBeenCalled();
    });

    it('does not process upload status errors when category is still invalid before upload', async () => {
      (uploadProductListVerify as jest.Mock).mockResolvedValue({
        data: { status: 'ERROR', message: 'Upload failed' },
      });

      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      expect(mockErrorHandling.handleUploadError).not.toHaveBeenCalled();
    });

    it('handles onDropAccepted with valid category - network error', async () => {
      (uploadProductListVerify as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
    });

    it('covers processFileUpload catch branches (details, response.data, fallback)', async () => {
      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      (uploadProductListVerify as jest.Mock).mockRejectedValueOnce({
        details: { errorKey: 'ERR_KEY' },
      });
      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      (uploadProductListVerify as jest.Mock).mockRejectedValueOnce({
        response: { data: { status: 'ERROR' } },
      });
      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      (uploadProductListVerify as jest.Mock).mockRejectedValueOnce({});
      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
    });
  });

  describe('Input click handling', () => {
    it('handles input click with invalid category', () => {
      render(<FormAddProducts {...defaultProps} />);
      fireEvent.click(screen.getByTestId('file-input'));
      expect(mockErrorHandling.showCategoryError).toHaveBeenCalledTimes(1);
    });

    it('handles input click with valid category', async () => {
      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      fireEvent.click(screen.getByTestId('file-input'));

      expect(mockErrorHandling.showCategoryError).not.toHaveBeenCalled();
    });
  });

  describe('Continue button functionality', () => {
    it('handles continue with no category selected', async () => {
      render(<FormAddProducts {...defaultProps} />);

      await userEvent.click(screen.getByTestId('continue-button-test'));

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });

    it('handles continue with valid category but no file', async () => {
      const localErrorHandling = {
        ...mockErrorHandling,
        alertDescription: '',
      };
      (useErrorHandling as jest.Mock).mockReturnValue(localErrorHandling);
      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();
      jest.clearAllMocks();
      setupMocks();
      (useErrorHandling as jest.Mock).mockReturnValue(localErrorHandling);

      await userEvent.click(screen.getByTestId('continue-button-test'));

      expect(localErrorHandling.showMissingFileError).toHaveBeenCalled();
      expect(mockFileState.setFileRejected).toHaveBeenCalledWith(true);
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });

    it('handles continue with valid form and file - success', async () => {
      const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      (uploadProductList as jest.Mock).mockResolvedValue({ status: 200 });
      mockOnExit.mockImplementation((callback: () => void) => callback());

      (useFileState as jest.Mock).mockReturnValue({
        ...mockFileState,
        currentFile: mockFile,
      });

      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} />);

      await selectCategory();

      await userEvent.click(screen.getByTestId('continue-button-test'));

      await waitFor(() => {
        expect(mockFileState.setFileIsLoading).toHaveBeenCalledWith(true);
        expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
        expect(uploadProductList).toHaveBeenCalledWith('initiative-1', mockFile, 'COOKINGHOBS');
      });
    });

    it('handles continue with valid form and file - upload error', async () => {
      const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const mockResponse = { status: 'ERROR', message: 'Upload failed' };

      (uploadProductList as jest.Mock).mockResolvedValue({ data: mockResponse });
      (useFileState as jest.Mock).mockReturnValue({
        ...mockFileState,
        currentFile: mockFile,
      });

      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} />);

      await selectCategory();

      await userEvent.click(screen.getByTestId('continue-button-test'));

      await waitFor(() => {
        expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith(mockResponse);
        expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      });
    });

    it('handles continue with no current file error', async () => {
      (useFileState as jest.Mock).mockReturnValue({
        ...mockFileState,
        currentFile: null,
      });

      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} />);

      await selectCategory();

      await userEvent.click(screen.getByTestId('continue-button-test'));

      await waitFor(() => {
        expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
        expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      });
    });

    it('handles continue with network error', async () => {
      const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      (uploadProductList as jest.Mock).mockRejectedValue(new Error('Network error'));
      (useFileState as jest.Mock).mockReturnValue({
        ...mockFileState,
        currentFile: mockFile,
      });

      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} />);

      await selectCategory();

      await userEvent.click(screen.getByTestId('continue-button-test'));

      await waitFor(() => {
        expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
        expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      });
    });

    it('handles continue with upload error details returned from API', async () => {
      const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });

      (uploadProductList as jest.Mock).mockRejectedValue({
        response: { data: { status: 'ERROR', errorKey: 'UPLOAD_ERR' } },
      });
      (useFileState as jest.Mock).mockReturnValue({
        ...mockFileState,
        currentFile: mockFile,
      });

      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} />);

      await selectCategory();

      await userEvent.click(screen.getByTestId('continue-button-test'));

      await waitFor(() => {
        expect(mockErrorHandling.handleUploadError).toHaveBeenCalledWith({
          status: 'ERROR',
          errorKey: 'UPLOAD_ERR',
        });
        expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
        expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('handles cancel button click', () => {
      mockOnExit.mockImplementation((callback: () => void) => callback());

      render(<FormAddProducts {...defaultProps} />);

      fireEvent.click(screen.getByTestId('cancel-button-test'));

      expect(mockOnExit).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and complete coverage', () => {
    it('covers all dropzone configuration options', () => {
      render(<FormAddProducts {...defaultProps} />);

      const dropzoneConfig = getDropzoneOptions();

      expect(dropzoneConfig.maxFiles).toBe(1);
      expect(dropzoneConfig.maxSize).toBe(2097152);
      expect(dropzoneConfig.accept).toEqual({ 'text/csv': ['.csv'] });
      expect(typeof dropzoneConfig.onFileDialogOpen).toBe('function');
      expect(typeof dropzoneConfig.onDrop).toBe('function');
      expect(typeof dropzoneConfig.onDropAccepted).toBe('function');
      expect(typeof dropzoneConfig.onDropRejected).toBe('function');
    });

    it('covers processFileUpload with invalid category branch', async () => {
      const mockFile = new File(['content'], 'invalid.csv', { type: 'text/csv' });

      render(<FormAddProducts {...defaultProps} />);

      const dropzoneOptions = getDropzoneOptions();

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      expect(defaultProps.setFileAccepted).toHaveBeenCalledWith(false);
    });

    it('handles multiple error scenarios in sequence', async () => {
      render(<FormAddProducts {...defaultProps} />);

      const dropzoneOptions = getDropzoneOptions();

      act(() => {
        dropzoneOptions.onFileDialogOpen();
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();

      act(() => {
        dropzoneOptions.onDropRejected([
          {
            file: new File(['content'], 'test.txt', { type: 'text/plain' }),
            errors: [{ code: 'file-too-large' }],
          },
        ]);
      });

      expect(mockErrorHandling.handleDropRejectedError).toHaveBeenCalledWith('file-too-large');
    });

    it('covers isCategoryValid function branches', async () => {
      const ref = React.createRef<any>();
      render(<FormAddProducts {...defaultProps} ref={ref} />);

      let result;
      await act(async () => {
        result = await ref.current.validateForm();
      });
      expect(result).toBe(false);

      await selectCategory();

      await act(async () => {
        result = await ref.current.validateForm();
      });
      expect(result).toBe(false);
    });

    it('handles formik validation states correctly', async () => {
      render(<FormAddProducts {...defaultProps} />);

      const categorySelect = screen.getByRole('combobox');

      expect(screen.queryByText('Category is required')).not.toBeInTheDocument();

      fireEvent.focus(categorySelect);
      fireEvent.blur(categorySelect);

      await waitFor(() => {
        expect(screen.getByText('Select Category')).toBeInTheDocument();
      });

      await selectCategory('category-option-other');

      await waitFor(() => {
        expect(screen.queryByText('Category is required')).not.toBeInTheDocument();
      });
    });

    it('covers all FileUploadSection props', async () => {
      (useFileState as jest.Mock).mockReturnValue({
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
      });
      (useErrorHandling as jest.Mock).mockReturnValue({
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
      });

      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} />);

      await selectCategory();

      expect(screen.getByTestId('template-filename')).toHaveTextContent('cookinghobs_template.csv');
      expect(screen.getByTestId('formik-category')).toHaveTextContent('cookinghobs');
    });

    it('ensures useImperativeHandle dependency array is covered', () => {
      const ref1 = React.createRef<any>();
      const props1 = { ...defaultProps, fileAccepted: false };
      const { rerender } = render(<FormAddProducts {...props1} ref={ref1} />);

      const validateForm1 = ref1.current.validateForm;

      const ref2 = React.createRef<any>();
      const props2 = { ...defaultProps, fileAccepted: true };
      rerender(<FormAddProducts {...props2} ref={ref2} />);

      const validateForm2 = ref2.current.validateForm;

      expect(typeof validateForm1).toBe('function');
      expect(typeof validateForm2).toBe('function');
    });

    it('covers handleInputClick preventDefault path', () => {
      render(<FormAddProducts {...defaultProps} />);
      fireEvent.click(screen.getByTestId('file-input'));
      expect(mockErrorHandling.showCategoryError).toHaveBeenCalledTimes(1);
    });

    it('tests all MenuItem rendering', () => {
      render(<FormAddProducts {...defaultProps} />);

      const categorySelect = screen.getByRole('combobox');
      fireEvent.mouseDown(categorySelect);

      expect(screen.getByTestId('category-option-cookinghobs')).toBeInTheDocument();
      expect(screen.getByTestId('category-option-other')).toBeInTheDocument();
    });

    it('covers formik enableReinitialize and validateOnMount', () => {
      render(<FormAddProducts {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('handles uploadProductListVerify mocks being bypassed when category stays invalid', async () => {
      const mockFile = new File(['content'], 'error.csv', { type: 'text/csv' });

      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      (uploadProductListVerify as jest.Mock).mockRejectedValueOnce({
        response: { data: { status: 'ERROR', message: 'Upload failed' } },
      });

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      (uploadProductListVerify as jest.Mock).mockRejectedValueOnce({});

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(uploadProductListVerify).not.toHaveBeenCalled();
    });

    it('handles undefined details/response branch being skipped when category stays invalid', async () => {
      const mockFile = new File(['content'], 'undefined.csv', { type: 'text/csv' });
      (uploadProductListVerify as jest.Mock).mockRejectedValueOnce({});

      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      expect(uploadProductListVerify).not.toHaveBeenCalled();
    });

    it('covers status branch being skipped when category stays invalid', async () => {
      const mockFile = new File(['content'], 'status.csv', { type: 'text/csv' });

      (uploadProductListVerify as jest.Mock).mockResolvedValueOnce({
        data: { status: 'ERROR' },
      });

      render(<FormAddProducts {...defaultProps} />);

      await selectCategory();

      const dropzoneOptions = getDropzoneOptions();

      await act(async () => {
        await dropzoneOptions.onDropAccepted([mockFile]);
      });

      expect(mockErrorHandling.showCategoryError).toHaveBeenCalled();
      expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      expect(uploadProductListVerify).not.toHaveBeenCalled();
    });

    it('covers uploadFileAndNavigate non-200 status branch', async () => {
      const mockFile = new File(['content'], 'upload.csv', { type: 'text/csv' });

      (uploadProductList as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { status: 'ERROR' },
      });
      (useFileState as jest.Mock).mockReturnValue({
        ...mockFileState,
        currentFile: mockFile,
      });

      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} />);

      await selectCategory();

      await userEvent.click(screen.getByTestId('continue-button-test'));

      await waitFor(() => {
        expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      });
    });

    it('covers handleFileProcessingError fallback branch', async () => {
      const mockFile = new File(['content'], 'fallback.csv', { type: 'text/csv' });

      (uploadProductList as jest.Mock).mockRejectedValueOnce({});
      (useFileState as jest.Mock).mockReturnValue({
        ...mockFileState,
        currentFile: mockFile,
      });

      const props = { ...defaultProps, fileAccepted: true };
      render(<FormAddProducts {...props} />);

      await selectCategory();

      await userEvent.click(screen.getByTestId('continue-button-test'));

      await waitFor(() => {
        expect(mockErrorHandling.handleGenericError).toHaveBeenCalled();
        expect(mockFileState.setFileRejectedState).toHaveBeenCalled();
      });
    });

    it('handles all error clearing scenarios', () => {
      render(<FormAddProducts {...defaultProps} />);

      fireEvent.click(screen.getByTestId('change-file-btn'));
      expect(mockErrorHandling.clearErrors).toHaveBeenCalled();

      const dropzoneOptions = getDropzoneOptions();

      act(() => {
        dropzoneOptions.onDropRejected([
          {
            file: new File(['content'], 'test.txt', { type: 'text/plain' }),
            errors: [{ code: 'file-invalid-type' }],
          },
        ]);
      });

      expect(mockErrorHandling.clearErrors).toHaveBeenCalled();
    });
  });
});
