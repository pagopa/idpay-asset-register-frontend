import React from 'react';
import '@testing-library/jest-dom';

jest.mock(
  '../../../components/DetailDrawer/DetailDrawer',
  () => (props: any) =>
    props.open ? (
      <div data-testid="detail-drawer">
        <button onClick={() => props.toggleDrawer(false)}>CloseDrawer</button>
        {props.children}
      </div>
    ) : null
);
jest.mock('../ManufacturerDetail', () => (props: any) => (
  <div data-testid="manufacturer-detail">{JSON.stringify(props.data)}</div>
));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvitaliaOverview from '../invitaliaOverview';
import * as registerService from '../../../services/registerService';
import * as reduxHooks from '../../../redux/hooks';
import * as reduxSlice from '../../../redux/slices/invitaliaSlice';
import { Institution } from '../../../model/Institution';
import { Provider } from 'react-redux';
import { createStore } from '../../../redux/store';
import { InstitutionsResponse } from '../../../api/generated/register';

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  ...jest.requireActual('@pagopa/selfcare-common-frontend/lib'),
  TitleBox: (props: any) => (
    <div data-testid={props['data-testid']}>
      <h4>{props.title}</h4>
      <p>{props.subTitle}</p>
    </div>
  ),
}));

const mockFilterInputWithSpaceRule = jest.fn();

jest.mock('../../../helpers', () => ({
  filterInputWithSpaceRule: (value: string) => mockFilterInputWithSpaceRule(value),
  fetchUserFromLocalStorage: jest.fn(),
}));

const renderWithProvider = (ui: React.ReactElement) => {
  const store = createStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
    return Component;
  },
}));

jest.spyOn(reduxHooks, 'useAppDispatch').mockReturnValue(jest.fn());

jest.spyOn(reduxSlice, 'setInstitutionList').mockReturnValue({ type: 'MOCK_ACTION' } as any);

jest.mock('../institutionsTable', () => (props: any) => {
  return (
    <div data-testid="institutions-table">
      <button onClick={() => props.onRequestSort({}, 'description')}>Sort</button>
      <button onClick={() => props.onRequestSort({}, 'institutionId')}>SortById</button>
      <button onClick={() => props.onPageChange({}, 1)}>PageChange</button>
      <button onClick={() => props.onRowsPerPageChange({ target: { value: '5' } })}>
        RowsPerPage
      </button>
      <button
        onClick={() =>
          props.data.institutions.length > 0 && props.onDetailRequest(props.data.institutions[0])
        }
      >
        Detail
      </button>
      <span>{props.loading ? 'Loading...' : 'Loaded'}</span>
      <span>{props.error}</span>
      <span data-testid="table-count">{props.data.institutions.length}</span>
      <span data-testid="table-page">{props.page}</span>
      <span data-testid="table-rows">{props.rowsPerPage}</span>
      <span data-testid="table-total">{props.totalElements}</span>
      <span data-testid="table-order">{props.order}</span>
      <span data-testid="table-order-by">{props.orderBy}</span>
    </div>
  );
});

const mockInstitutions = [
  { institutionId: '1', description: 'Alpha' },
  { institutionId: '2', description: 'Beta' },
] as InstitutionsResponse['institutions'];

const mockInstitutionDetail = { institutionId: '1', description: 'Alpha', extra: 'detail' };

describe('InvitaliaOverview', () => {
  beforeEach(() => {
    const { fetchUserFromLocalStorage } = require('../../../helpers');
    fetchUserFromLocalStorage.mockReturnValue({ uid: 'user-x' });
    mockFilterInputWithSpaceRule.mockImplementation((value: string) => value);

    jest.spyOn(registerService, 'getInstitutionsList').mockResolvedValue({
      data: {
        institutions: mockInstitutions,
      },
    });
    jest
      .spyOn(registerService, 'getInstitutionById')
      .mockResolvedValue({ data: mockInstitutionDetail });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and subtitle', async () => {
    renderWithProvider(<InvitaliaOverview />);
    expect(await screen.findByTestId('title-overview')).toBeInTheDocument();
  });

  it('renders institutions table with data', async () => {
    renderWithProvider(<InvitaliaOverview />);
    const table = await screen.findByTestId('institutions-table');
    expect(screen.getByText('Loaded')).toBeInTheDocument();
    expect(table).toBeInTheDocument();
    expect(screen.getByTestId('table-count')).toHaveTextContent('2');
    expect(screen.getByTestId('table-total')).toHaveTextContent('2');
  });

  it('filters institutions by search', async () => {
    renderWithProvider(<InvitaliaOverview />);
    await screen.findByText('Loaded');
    const input = screen.getByLabelText('Cerca per nome produttore') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alpha' } });
    expect(input).toHaveValue('Alpha');
    expect(mockFilterInputWithSpaceRule).toHaveBeenCalledWith('Alpha');
    expect(screen.getByTestId('table-count')).toHaveTextContent('1');
    expect(screen.getByTestId('table-page')).toHaveTextContent('0');
  });

  it('shows no results when search does not match', async () => {
    renderWithProvider(<InvitaliaOverview />);
    await screen.findByText('Loaded');

    fireEvent.change(screen.getByLabelText('Cerca per nome produttore'), {
      target: { value: 'Missing' },
    });

    expect(screen.getByTestId('table-count')).toHaveTextContent('0');
    expect(screen.getByTestId('table-total')).toHaveTextContent('0');
  });

  it('handles institutions with missing description while filtering', async () => {
    jest.spyOn(registerService, 'getInstitutionsList').mockResolvedValue({
      data: {
        institutions: [{ institutionId: '3' }] as InstitutionsResponse['institutions'],
      },
    });

    renderWithProvider(<InvitaliaOverview />);
    await screen.findByText('Loaded');

    fireEvent.change(screen.getByLabelText('Cerca per nome produttore'), {
      target: { value: 'Alpha' },
    });

    expect(screen.getByTestId('table-count')).toHaveTextContent('0');
  });

  it('filters out the institution associated with the current user', async () => {
    const { fetchUserFromLocalStorage } = require('../../../helpers');
    fetchUserFromLocalStorage.mockReturnValue({ org_id: '1' });

    renderWithProvider(<InvitaliaOverview />);
    await screen.findByText('Loaded');

    expect(screen.getByTestId('table-count')).toHaveTextContent('1');
    expect(screen.getByTestId('table-total')).toHaveTextContent('1');
  });

  it('falls back to an empty list when the API returns no institutions', async () => {
    jest.spyOn(registerService, 'getInstitutionsList').mockResolvedValue({
      data: {},
    });

    renderWithProvider(<InvitaliaOverview />);
    await screen.findByText('Loaded');

    expect(screen.getByTestId('table-count')).toHaveTextContent('0');
    expect(screen.getByTestId('table-total')).toHaveTextContent('0');
  });

  it('sorts institutions', async () => {
    renderWithProvider(<InvitaliaOverview />);
    const sortBtn = await screen.findByText('Sort');
    fireEvent.click(sortBtn);
    expect(screen.getByTestId('table-order')).toHaveTextContent('desc');
    fireEvent.click(sortBtn);
    expect(screen.getByTestId('table-order')).toHaveTextContent('asc');
    fireEvent.click(screen.getByText('SortById'));
    expect(screen.getByTestId('table-order-by')).toHaveTextContent('institutionId');
  });

  it('changes page and rows per page', async () => {
    renderWithProvider(<InvitaliaOverview />);
    const pageBtn = await screen.findByText('PageChange');
    fireEvent.click(pageBtn);
    expect(screen.getByTestId('table-page')).toHaveTextContent('1');
    const rowsBtn = await screen.findByText('RowsPerPage');
    fireEvent.click(rowsBtn);
    expect(screen.getByTestId('table-rows')).toHaveTextContent('5');
    expect(screen.getByTestId('table-page')).toHaveTextContent('0');
  });

  it('opens and closes the detail drawer', async () => {
    renderWithProvider(<InvitaliaOverview />);
    await waitFor(() => {
      expect(screen.getByTestId('table-count')).toHaveTextContent('2');
    });
    const detailBtn = screen.getByText('Detail');
    fireEvent.click(detailBtn);
    expect(await screen.findByTestId('detail-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('manufacturer-detail')).toHaveTextContent('detail');
    fireEvent.click(screen.getByText('CloseDrawer'));
    await waitFor(() => {
      expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
    });
  });

  it('handles loading state', async () => {
    jest
      .spyOn(registerService, 'getInstitutionsList')
      .mockImplementation(() => new Promise(() => {}));
    renderWithProvider(<InvitaliaOverview />);
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('handles error in fetchInstitutions', async () => {
    jest.spyOn(registerService, 'getInstitutionsList').mockRejectedValue(new Error('fail'));
    renderWithProvider(<InvitaliaOverview />);
    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });
  });

  it('handles error in handleDetailRequest', async () => {
    jest.spyOn(registerService, 'getInstitutionById').mockRejectedValue(new Error('fail'));
    renderWithProvider(<InvitaliaOverview />);
    await waitFor(() => {
      expect(screen.getByTestId('table-count')).toHaveTextContent('2');
    });
    const detailBtn = screen.getByText('Detail');
    fireEvent.click(detailBtn);
    await waitFor(() => {
      expect(registerService.getInstitutionById).toHaveBeenCalledWith('1');
    });
    expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
  });
});
