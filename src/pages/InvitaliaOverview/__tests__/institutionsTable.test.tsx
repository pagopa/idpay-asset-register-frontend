import { render, screen, fireEvent } from '@testing-library/react';
import InstitutionsTable from '../institutionsTable';
import { Institution } from '../../../model/Institution';
import { InstitutionsResponse } from '../../../api/generated/register';
import '@testing-library/jest-dom';
import { createStore } from '../../../redux/store';
import { Provider } from 'react-redux';

jest.mock('../../../utils/env', () => ({
  __esModule: true,
  ENV: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
  },
}));

const store = createStore();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../helpers', () => ({
  formatDateWithoutHours: (date: string) => date,
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home',
    INVITALIA_PRODUCTS_LIST: '/home/:initiativeId/lista-prodotti',
  },
  BASE_ROUTE: '/base',
}));

const mockInstitutions: Institution[] = [
  {
    institutionId: '1',
    description: 'Alpha Institution',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
  },
  {
    institutionId: '2',
    description: 'Beta Institution',
    createdAt: '2023-02-01',
    updatedAt: '2023-02-02',
  },
];

const defaultProps = {
  loading: false,
  error: null,
  data: { institutions: mockInstitutions } as InstitutionsResponse,
  page: 0,
  rowsPerPage: 10,
  totalElements: 2,
  order: 'asc' as const,
  orderBy: 'description' as keyof Institution,
  onPageChange: jest.fn(),
  onRowsPerPageChange: jest.fn(),
  onRequestSort: jest.fn(),
  onDetailRequest: jest.fn(),
};

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({ data: [], isLoading: false }),
}));

describe('InstitutionsTable', () => {
  it('renders loading state', () => {
    render(
      <Provider store={store}>
        <InstitutionsTable {...defaultProps} loading={true} />
      </Provider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <Provider store={store}>
        <InstitutionsTable {...defaultProps} error="Error loading" />
      </Provider>
    );
    expect(screen.getByText('Error loading')).toBeInTheDocument();
  });

  it('renders no data message', () => {
    render(
      <Provider store={store}>
        <InstitutionsTable {...defaultProps} data={{ institutions: [] }} />
      </Provider>
    );
    expect(screen.getByText('pages.invitaliaOverview.noInstitutionsFound')).toBeInTheDocument();
  });

  it('renders institutions data', () => {
    render(
      <Provider store={store}>
        <InstitutionsTable {...defaultProps} />
      </Provider>
    );
    expect(screen.getByText('Alpha Institution')).toBeInTheDocument();
    expect(screen.getByText('Beta Institution')).toBeInTheDocument();
  });

  it('calls onRequestSort when header is clicked', () => {
    render(
      <Provider store={store}>
        <InstitutionsTable {...defaultProps} />
      </Provider>
    );
    const header = screen.getByRole('button', {
      name: /pages.invitaliaOverview.listHeader.institutionName/i,
    });
    fireEvent.click(header);
    expect(defaultProps.onRequestSort).toHaveBeenCalled();
  });

  it('navigates to institution products when institution name is clicked', () => {
    render(
      <Provider store={store}>
        <InstitutionsTable {...defaultProps} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Alpha Institution' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      '/home/initiative-1/lista-prodotti',
      { state: { organizationId: '1' } }
    );
  });
});
