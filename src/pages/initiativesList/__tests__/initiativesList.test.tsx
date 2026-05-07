import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { store } from '../../../redux/store';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativesList from '../initiativesList';

// Tipi jest non sempre inclusi nel tsconfig del progetto: import esplicito per TS/IDE
import { beforeEach, describe, expect, test, jest } from '@jest/globals';

const mockUseGetInitiativesQuery = jest.fn();

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => mockUseGetInitiativesQuery(),
}));

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
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
  // fix typing: scrollTo è overloadata (options | x,y)
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
});
