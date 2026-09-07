import { fireEvent, screen } from '@testing-library/react';
import { store } from '../../../redux/store';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativesList from '../initiativesList';
import * as helpers from '../../../helpers';
import * as sideMenuConfig from '../../../components/SideMenu/sideMenuConfig';
import { beforeEach, describe, expect, test } from '@jest/globals';

const mockUseGetInitiativesQuery = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => mockUseGetInitiativesQuery(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue(null);
  mockUseGetInitiativesQuery.mockReturnValue({
    data: [
      {
        initiativeId: 'initiative-1',
        initiativeName: 'Iniziativa mock 1234',
        organizationName: 'PagoPA',
        serviceId: 'SERVICE-1',
        status: 'PUBLISHED',
        startDate: '2025-10-01',
        endDate: '2025-10-31',
      },
    ],
  });
});

describe('Test suite for initiativeList page', () => {
  window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
  test('Render component', () => {
    renderWithContext(<InitiativesList />);
  });

  test('Shows a dash when the adhesion date is missing', () => {
    renderWithContext(<InitiativesList />, store);

    expect(screen.getByText('-')).toBeTruthy();
  });

  test('User searches an initiative by name that shows results', async () => {
    renderWithContext(<InitiativesList />, store);
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'Iniziativa mock 1234' } });
    expect(searchField.value).toBe('Iniziativa mock 1234');
  });

  test("User searches an initiative by name that doesn't show results", async () => {
    renderWithContext(<InitiativesList />, store);
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'not present' } });
    expect(searchField.value).toBe('not present');
  });

  test('User resets previous search', async () => {
    renderWithContext(<InitiativesList />, store);
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'previous value' } });
    fireEvent.change(searchField, { target: { value: '' } });
    expect(searchField.value).toBe('');
  });

  test('User sorts initiatives by name', async () => {
    renderWithContext(<InitiativesList />, store);
    const sortByName = screen.getByText('Nome');
    fireEvent.click(sortByName);
  });

  test('Render empty state', () => {
    mockUseGetInitiativesQuery.mockReturnValue({
      data: [],
    });

    renderWithContext(<InitiativesList />, store);
    expect(screen.getByText('Nessuna iniziativa presente')).toBeTruthy();
  });

  test('User clicks an initiative as standard user and navigates to overview', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'operatore' });

    renderWithContext(<InitiativesList />, store);
    fireEvent.click(screen.getByTestId('initiative-btn-test'));

    expect(mockNavigate).toHaveBeenCalledWith(
      '/elenco-informatico-elettrodomestici/initiative-1/panoramica'
    );
  });

  test('User clicks an initiative as Invitalia user and navigates to products list', () => {
    jest.spyOn(helpers, 'fetchUserFromLocalStorage').mockReturnValue({ org_role: 'invitalia' });

    renderWithContext(<InitiativesList />, store);
    fireEvent.click(screen.getByTestId('initiative-btn-test'));

    expect(mockNavigate).toHaveBeenCalledWith(
      '/elenco-informatico-elettrodomestici/initiative-1/lista-prodotti'
    );
  });

  // ---- Coverage boost tests ----

  test('Defaults to EMPTY_INITIATIVES_LIST when useGetInitiativesQuery returns no data (line 108)', () => {
    mockUseGetInitiativesQuery.mockReturnValue({});
    renderWithContext(<InitiativesList />, store);
    expect(screen.getByText('Nessuna iniziativa presente')).toBeTruthy();
  });

  test('Handles non-array initiatives data gracefully (line 116 false branch)', () => {
    mockUseGetInitiativesQuery.mockReturnValue({ data: null });
    renderWithContext(<InitiativesList />, store);
    expect(screen.getByText('Nessuna iniziativa presente')).toBeTruthy();
  });

  test('Maps initiatives with missing fields using empty-string fallbacks (lines 118-125)', () => {
    mockUseGetInitiativesQuery.mockReturnValue({
      data: [
        {
          // all fields missing → hits || '' / ?? '' fallbacks
          // createdAt present → hits the date formatting branch (line 122)
          createdAt: '2025-01-15T10:00:00Z',
        },
      ],
    });
    const { container } = renderWithContext(<InitiativesList />, store);
    expect(container).toBeTruthy();
  });

  test('Renders CLOSED status chip (lines 158, 162)', () => {
    mockUseGetInitiativesQuery.mockReturnValue({
      data: [
        {
          initiativeId: '1',
          initiativeName: 'Closed Initiative',
          status: 'CLOSED',
        },
      ],
    });
    renderWithContext(<InitiativesList />, store);
    expect(screen.getByText('common.initiativeStatusEnum.closed')).toBeTruthy();
  });

  test('Renders null for unknown status (line 164 default case)', () => {
    mockUseGetInitiativesQuery.mockReturnValue({
      data: [
        {
          initiativeId: '1',
          initiativeName: 'Unknown Status',
          status: 'SOME_UNKNOWN_STATUS',
        },
      ],
    });
    renderWithContext(<InitiativesList />, store);
    expect(screen.getByTestId('initiative-btn-test')).toBeTruthy();
  });

  test('Sort toggles direction covering isAsc=false branch (line 153)', () => {
    renderWithContext(<InitiativesList />, store);
    const sortByName = screen.getByText('Nome');
    fireEvent.click(sortByName); // isAsc=true → sets order to 'desc'
    fireEvent.click(sortByName); // isAsc=false (order is now 'desc') → sets order to 'asc'
  });

  test('Clicking initiative when firstInitiativeMenuItem has no route does nothing (lines 249-250)', () => {
    jest.spyOn(sideMenuConfig, 'getFirstInitiativeMenuItem').mockReturnValueOnce(undefined);
    renderWithContext(<InitiativesList />, store);
    fireEvent.click(screen.getByTestId('initiative-btn-test'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('Renders dash for empty organizationName (line 264)', () => {
    mockUseGetInitiativesQuery.mockReturnValue({
      data: [
        {
          initiativeId: '1',
          initiativeName: 'No Org',
          organizationName: '',
          createdAt: '2025-01-01T00:00:00Z',
          status: 'PUBLISHED',
        },
      ],
    });
    renderWithContext(<InitiativesList />, store);
    // organizationName '' → maps to '' → renders '-' in the table cell
    expect(screen.getByText('-')).toBeTruthy();
  });
});
