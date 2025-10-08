import { render, screen, fireEvent } from '@testing-library/react';
import FileUploadSection from '../fileUploadSection';
import '@testing-library/jest-dom';

jest.mock('../../../utils/env', () => ({
    __esModule: true,
    ENV: {
        UPCOMING_INITIATIVE_DAY: 'xx/xx/xx',
        URL_API: {
            OPERATION: 'https://mock-api/register',
            LOGOUT: 'https://mock-api/logout',
        },
    },
}));

jest.mock('../../../components/LoadingFile/LoadingFile', () => () => <div data-testid="loading-file" />);
jest.mock('../../../components/AcceptedFile/AcceptedFile', () => () => <div data-testid="accepted-file" />);
jest.mock('../../../components/RejectedFile/RejectedFile', () => () => <div data-testid="rejected-file" />);
jest.mock('../../../components/InitUploadBox/InitUploadBox', () => () => <div data-testid="init-upload-box" />);

const defaultProps = {
    fileRejected: false,
    fileIsLoading: false,
    fileAccepted: false,
    fileName: 'test.csv',
    fileDate: '2025-07-25',
    alertTitle: '',
    alertDescription: '',
    isReport: false,
    onDownloadReport: jest.fn(),
    onDismissError: jest.fn(),
    onChangeFile: jest.fn(),
    getRootProps: () => ({ className: 'dropzone' }),
    getInputProps: () => ({ type: 'file' }),
    onInputClick: jest.fn(),
    formikCategory: '',
    templateFileName: 'template.csv',
    t: (key: string) => key,
};

describe('FileUploadSection', () => {
    it('renders loading state', () => {
        render(<FileUploadSection {...defaultProps} fileIsLoading />);
        expect(screen.getByTestId('loading-file')).toBeInTheDocument();
    });

    it('renders accepted file state', () => {
        render(<FileUploadSection {...defaultProps} fileAccepted />);
        expect(screen.getByTestId('accepted-file')).toBeInTheDocument();
    });

    it('renders rejected file alert if fileRejected and alert info are present', () => {
        render(
            <FileUploadSection
                {...defaultProps}
                fileRejected
                alertTitle="Errore"
                alertDescription="Descrizione errore"
            />
        );
        expect(screen.getByTestId('rejected-file')).toBeInTheDocument();
    });

    it('renders dropzone and InitUploadBox', () => {
        render(<FileUploadSection {...defaultProps} />);
        expect(screen.getByTestId('drop-input')).toBeInTheDocument();
        expect(screen.getByTestId('init-upload-box')).toBeInTheDocument();
    });

    it('renders helper text and download link when category is selected', () => {
        render(<FileUploadSection {...defaultProps} formikCategory="COOKINGHOBS" />);
        expect(screen.getByText('pages.addProducts.form.fileUpload.fileUploadHelpText')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', 'template.csv');
    });

    it('calls onInputClick when input is clicked', () => {
        render(<FileUploadSection {...defaultProps} />);
        const input = screen.getByTestId('drop-input');
        fireEvent.click(input);
        expect(defaultProps.onInputClick).toHaveBeenCalled();
    });
});
