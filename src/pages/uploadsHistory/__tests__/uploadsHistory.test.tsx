import { render, screen, waitFor } from '@testing-library/react';
import OverviewHistoryUpload from '../uploadsHistory';
import { getProductFilesList } from '../../../services/registerService';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'pages.uploadHistory.sideMenuTitle': 'Storico caricamenti',
        'pages.uploadHistory.uploadHistorySubTitle': 'Visualizza tutti i caricamenti e i dettagli.',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title, subTitle, 'data-testid': testId }: any) => (
    <div data-testid={testId}>
      <h4>{title}</h4>
      <p>{subTitle}</p>
    </div>
  ),
}));

jest.mock('../../components/HistoryUploadSection', () => ({
  __esModule: true,
  default: ({ loading, error, data }: any) => (
    <div data-testid="uploads-table">
      {loading && <div>Loading...</div>}
      {error && <div>Error loading data</div>}
      {data && <div>Data loaded</div>}
    </div>
  ),
}));

jest.mock('../../../services/registerService', () => ({
  getProductFilesList: jest.fn(),
}));

const mockGetProductFilesList = getProductFilesList as jest.Mock;

describe('OverviewHistoryUpload', () => {
  const mockData = {
    totalElements: 2,
    content: [
      { uploadStatus: 'UPLOADED', id: 1 },
      { uploadStatus: 'SUPERVISIONED', id: 2 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProductFilesList.mockImplementation(() => Promise.resolve({}));
  });

  test('renders correctly in loading state', () => {
    mockGetProductFilesList.mockImplementation(() => new Promise(() => {}));
    render(<OverviewHistoryUpload />);

    expect(screen.queryByTestId('title-overview')).not.toBeInTheDocument();
  });

  test('shows data correctly when API succeeds', async () => {
    mockGetProductFilesList.mockResolvedValue(mockData);
    render(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(screen.getByTestId('title-overview')).toBeInTheDocument();
    });
  });

  /*
    test('shows error message when API fails', async () => {
        mockGetProductFilesList.mockRejectedValue(new Error('API Error'));
        render(<OverviewHistoryUpload />);

        await waitFor(() => {
            expect(screen.getByTestId('title-overview')).toBeInTheDocument();
        });
    });

    test('shows InfoUpload when uploadStatus is UPLOADED', async () => {
        const dataWithUploaded = {
            ...mockData,
            content: [{ uploadStatus: 'UPLOADED', id: 1 }]
        };
        mockGetProductFilesList.mockResolvedValue(dataWithUploaded);
        render(<OverviewHistoryUpload />);

        await waitFor(() => {
            expect(screen.getByTestId('title-overview')).toBeInTheDocument();
        });
    });
    */

  test('does not show InfoUpload when uploadStatus is not UPLOADED', async () => {
    const dataWithoutUploaded = {
      ...mockData,
      content: [{ uploadStatus: 'SUPERVISIONED', id: 1 }],
    };
    mockGetProductFilesList.mockResolvedValue(dataWithoutUploaded);
    render(<OverviewHistoryUpload />);

    expect(
      screen.queryByText('pages.uploadHistory.uploadHistoryAlertMessage')
    ).not.toBeInTheDocument();
  });

  test('calls getProductFilesList with correct initial parameters', async () => {
    mockGetProductFilesList.mockResolvedValue(mockData);
    render(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(mockGetProductFilesList).toHaveBeenCalledWith(0, 8);
    });
  });
});
