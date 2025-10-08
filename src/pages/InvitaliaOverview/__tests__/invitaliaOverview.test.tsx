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

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: () => ({ uid: 'user-1' }),
}));

jest.mock('../institutionsTable', () => (props: any) => (
  <div data-testid="institutions-table">
    <button onClick={() => props.onRequestSort({}, 'description')}>Sort</button>
    <button onClick={() => props.onPageChange({}, 1)}>PageChange</button>
    <button onClick={() => props.onRowsPerPageChange({ target: { value: '5' } })}>
      RowsPerPage
    </button>
    <button onClick={() => props.onDetailRequest(props.data.institutions[0])}>Detail</button>
    <span>{props.loading ? 'Loading...' : 'Loaded'}</span>
    <span>{props.error}</span>
    <span>{props.data.institutions.length}</span>
  </div>
));

const mockInstitutions = [
  { institutionId: '1', description: 'Alpha' },
  { institutionId: '2', description: 'Beta' },
] as Institution[];

const mockInstitutionDetail = { institutionId: '1', description: 'Alpha', extra: 'detail' };

describe('InvitaliaOverview', () => {
  beforeEach(() => {
    jest.spyOn(registerService, 'getInstitutionsList').mockResolvedValue({
      institutions: mockInstitutions,
    });
    jest.spyOn(registerService, 'getInstitutionById').mockResolvedValue(mockInstitutionDetail);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and subtitle', async () => {
    render(<InvitaliaOverview />);
    expect(await screen.findByTestId('title-overview')).toBeInTheDocument();
  });

  it('renders institutions table with data', async () => {
    render(<InvitaliaOverview />);
    expect(await screen.findByTestId('institutions-table')).toBeInTheDocument();
    expect(screen.getByText('Loaded')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('filters institutions by search', async () => {
    render(<InvitaliaOverview />);
    const input = screen.getByLabelText('Cerca per nome produttore') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alpha' } });
    expect(input).toHaveValue('Alpha');
  });

  it('sorts institutions', async () => {
    render(<InvitaliaOverview />);
    const sortBtn = await screen.findByText('Sort');
    fireEvent.click(sortBtn);
  });

  it('changes page and rows per page', async () => {
    render(<InvitaliaOverview />);
    const pageBtn = await screen.findByText('PageChange');
    fireEvent.click(pageBtn);
    const rowsBtn = await screen.findByText('RowsPerPage');
    fireEvent.click(rowsBtn);
  });

  it('opens and closes the detail drawer', async () => {
    render(<InvitaliaOverview />);
    const detailBtn = await screen.findByText('Detail');
    fireEvent.click(detailBtn);
    expect(await screen.findByTestId('detail-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('manufacturer-detail')).toHaveTextContent('Alpha');
    const closeBtn = screen.getByText('CloseDrawer');
    fireEvent.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByTestId('detail-drawer')).not.toBeInTheDocument();
    });
  });

  it('handles loading state', async () => {
    jest.spyOn(registerService, 'getInstitutionsList').mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    render(<InvitaliaOverview />);
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
  });

  it('handles error in fetchInstitutions', async () => {
    jest.spyOn(registerService, 'getInstitutionsList').mockRejectedValue(new Error('fail'));
    render(<InvitaliaOverview />);
    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });
  });

  it('handles error in handleDetailRequest', async () => {
    jest.spyOn(registerService, 'getInstitutionById').mockRejectedValue(new Error('fail'));
    render(<InvitaliaOverview />);
    const detailBtn = await screen.findByText('Detail');
    fireEvent.click(detailBtn);
  });
});
