import { fireEvent, screen } from '@testing-library/react';
import { store } from '../../../redux/store';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativesList from '../initiativesList';
import * as helpers from '../../../helpers';
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
});
