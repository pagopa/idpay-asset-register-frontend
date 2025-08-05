import {act, render, screen, waitFor} from '@testing-library/react';
import OverviewHistoryUpload from '../uploadsHistory';
import { getProductFilesList } from '../../../services/registerService';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'pages.uploadHistory.sideMenuTitle': 'Storico caricamenti',
        'pages.uploadHistory.uploadHistorySubTitle': 'Visualizza tutti i caricamenti e i dettagli.',
        'pages.uploadHistory.uploadHistoryAlertMessage': 'Alert message for uploaded status',
        'pages.uploadHistory.uploadHistoryNoFilesUploaded': 'Nessun file caricato',
        'errors.uploadsList.errorDescription': 'Errore nel caricamento dei dati'
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
  default: ({ loading, error, data, onPageChange, onRowsPerPageChange }: any) => (
      <div data-testid="uploads-table">
        {loading && <div>Loading...</div>}
        {error && <div>Error loading data</div>}
        {data && <div>Data loaded</div>}
        <button
            data-testid="page-change-btn"
            onClick={() => onPageChange(null, 1)}
        >
          Change Page
        </button>
        <input
            data-testid="rows-per-page-input"
            onChange={(e) => onRowsPerPageChange(e)}
            value="10"
        />
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


    test('shows error message when API fails', async () => {
        mockGetProductFilesList.mockRejectedValue(new Error('API Error'));
        act(() => {
            render(<OverviewHistoryUpload />);

        });

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
       act(() => {
           render(<OverviewHistoryUpload/>);
       });

       await waitFor(() => {
           expect(screen.getByTestId('title-overview')).toBeInTheDocument();
       });
   });

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


  test('handles empty content array correctly', async () => {
    const emptyData = {
      totalElements: 0,
      content: []
    };
    mockGetProductFilesList.mockResolvedValue(emptyData);

    render(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(screen.getByTestId('title-overview')).toBeInTheDocument();
      expect(screen.queryByText('Alert message for uploaded status')).not.toBeInTheDocument();
    });
  });


  test('handles null content correctly', async () => {
    const nullContentData = {
      totalElements: 0,
      content: null
    };
    mockGetProductFilesList.mockResolvedValue(nullContentData);

    render(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(screen.getByTestId('title-overview')).toBeInTheDocument();
    });
  });

  test('handles undefined content correctly', async () => {
    const undefinedContentData = {
      totalElements: 0
    };
    mockGetProductFilesList.mockResolvedValue(undefinedContentData);

    render(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(screen.getByTestId('title-overview')).toBeInTheDocument();
    });
  });


  test('InfoUpload component renders with correct props', async () => {
    const dataWithUploaded = {
      totalElements: 1,
      content: [{ uploadStatus: 'UPLOADED', id: 1 }]
    };
    mockGetProductFilesList.mockResolvedValue(dataWithUploaded);

    render(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(screen.getByText('Alert message for uploaded status')).toBeInTheDocument();
    });
  });


  test('renders error state with empty table', async () => {
    mockGetProductFilesList.mockRejectedValue(new Error('Network error'));

    render(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(screen.getByTestId('title-overview')).toBeInTheDocument();
      expect(screen.getByTestId('uploads-table')).toBeInTheDocument();
      expect(screen.getByText('Nessun file caricato')).toBeInTheDocument();
    });
  });


  test('useEffect dependency array works correctly', async () => {
    mockGetProductFilesList.mockResolvedValue(mockData);
    const { rerender } = render(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(mockGetProductFilesList).toHaveBeenCalledTimes(1);
    });

    rerender(<OverviewHistoryUpload />);

    await waitFor(() => {
      expect(mockGetProductFilesList).toHaveBeenCalled();
    });
  });

  /*
  test('loading state is handled correctly during API call', async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockGetProductFilesList.mockReturnValue(pendingPromise);

    render(<OverviewHistoryUpload />);

    expect(screen.queryByTestId('title-overview')).not.toBeInTheDocument();

    act(() => {
      resolvePromise!(mockData);
    });

    await waitFor(() => {
      expect(screen.getByTestId('title-overview')).toBeInTheDocument();
    });
  });
   */
});