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
    HOME: '/home',
    PRODUCTS: '/prodotti',
  },
  BASE_ROUTE: '/base',
}));
jest.mock('../../../api/registerApiClient', () => ({
  RegisterApi: {
    getProducts: jest.fn(),
    getBatchFilterItems: jest.fn(),
  },
}));
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as registerService from '../../../services/registerService';
import * as helpers from '../../addProducts/helpers';
import * as redux from 'react-redux';
import UploadsTable from '../HistoryUploadSection';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
    return Component;
  },
}));

jest.mock('../../../services/registerService', () => ({
  downloadErrorReport: jest.fn().mockResolvedValue({
    data: 'csv content',
    filename: 'report.csv',
  }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockDispatch = jest.fn();
jest.spyOn(redux, 'useDispatch').mockReturnValue(mockDispatch);

jest.spyOn(registerService, 'downloadErrorReport').mockResolvedValue({
  data: 'csv content',
  filename: 'report.csv',
});
jest.spyOn(helpers, 'downloadCsv').mockImplementation(() => {});

const store = configureStore({ reducer: () => ({}) });
const theme = createTheme();

const renderComponent = (props: any) =>
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <UploadsTable {...props} />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );

describe('UploadsTable', () => {
  const mockData = {
    content: [
      {
        productFileId: 'file123',
        batchName: 'Batch A',
        dateUpload: '2025-07-21T10:00:45Z',
        findedProductsNumber: 5,
        addedProductNumber: 3,
        uploadStatus: 'PARTIAL',
      },
    ],
  };

  it('renders loading state', () => {
    renderComponent({
      loading: true,
      error: null,
      data: null,
      page: 0,
      rowsPerPage: 10,
      totalElements: 0,
      onPageChange: jest.fn(),
      onRowsPerPageChange: jest.fn(),
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    renderComponent({
      loading: false,
      error: 'Errore',
      data: null,
      page: 0,
      rowsPerPage: 10,
      totalElements: 0,
      onPageChange: jest.fn(),
      onRowsPerPageChange: jest.fn(),
    });
    expect(screen.getByText('Errore')).toBeInTheDocument();
  });

  it('renders table with data', () => {
    renderComponent({
      loading: false,
      error: null,
      data: mockData,
      page: 0,
      rowsPerPage: 10,
      totalElements: 1,
      onPageChange: jest.fn(),
      onRowsPerPageChange: jest.fn(),
    });
    expect(screen.getByTestId('uploads-table')).toBeInTheDocument();
    expect(screen.getByText('Batch A')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('12:00:45'))).toBeInTheDocument();
    expect(
      screen.getByText('5 pages.uploadHistory.uploadHistoryFoundProducts')
    ).toBeInTheDocument();
    expect(
      screen.getByText('3 pages.uploadHistory.uploadHistoryAddedProducts')
    ).toBeInTheDocument();
  });

  it('handles product link click', () => {
    renderComponent({
      loading: false,
      error: null,
      data: mockData,
      page: 0,
      rowsPerPage: 10,
      totalElements: 1,
      onPageChange: jest.fn(),
      onRowsPerPageChange: jest.fn(),
    });
    fireEvent.click(screen.getByText(/3 pages.uploadHistory.uploadHistoryAddedProducts/));
    expect(mockDispatch).toHaveBeenCalledTimes(0);
    expect(mockNavigate).toHaveBeenCalledWith('/prodotti', { replace: true });
  });

  it('handles download icon click', async () => {
    renderComponent({
      loading: false,
      error: null,
      data: mockData,
      page: 0,
      rowsPerPage: 10,
      totalElements: 1,
      onPageChange: jest.fn(),
      onRowsPerPageChange: jest.fn(),
    });

    fireEvent.click(screen.getByTestId('download-icon'));

    expect(registerService.downloadErrorReport).toHaveBeenCalledWith('file123');
  });

  it('renders empty table message', () => {
    renderComponent({
      loading: false,
      error: null,
      data: { content: [] },
      page: 0,
      rowsPerPage: 10,
      totalElements: 0,
      onPageChange: jest.fn(),
      onRowsPerPageChange: jest.fn(),
    });
    expect(
      screen.getByText('pages.uploadHistory.uploadHistoryNoFilesUploaded')
    ).toBeInTheDocument();
  });
});
