import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import {
  InitiativeProvider,
  useInitiativeContext,
} from '../InitiativeContext';
import { getMerchantInitiativeList } from '../../../services/registerService';
import { DEFAULT_INITIATIVE_ID } from '../../../hooks/useInitiativeFromUrl';

jest.mock('../../../services/registerService', () => ({
  getMerchantInitiativeList: jest.fn(),
}));

const mockGetMerchantInitiativeList = getMerchantInitiativeList as jest.Mock;

const Consumer = () => {
  const { initiativeId, initiatives, isLoadingInitiatives } = useInitiativeContext();

  return (
    <div>
      <span data-testid="initiative-id">{initiativeId}</span>
      <span data-testid="initiatives-count">{initiatives.length}</span>
      <span data-testid="is-loading">{String(isLoadingInitiatives)}</span>
      <span data-testid="first-name">{initiatives[0]?.initiativeName ?? ''}</span>
    </div>
  );
};

const renderProvider = (initialEntry: string = '/base/initiative-1/panoramica') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <InitiativeProvider>
        <Consumer />
      </InitiativeProvider>
    </MemoryRouter>
  );

describe('InitiativeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the default context value when used without provider', () => {
    render(<Consumer />);

    expect(screen.getByTestId('initiative-id')).toHaveTextContent(DEFAULT_INITIATIVE_ID);
    expect(screen.getByTestId('initiatives-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('reads initiativeId from URL and exposes loaded initiatives', async () => {
    mockGetMerchantInitiativeList.mockResolvedValue({
      data: [
        {
          initiativeId: 'initiative-1',
          initiativeName: 'Bonus Test',
          startDate: '2025-10-01',
        },
      ],
    });

    renderProvider();

    expect(screen.getByTestId('initiative-id')).toHaveTextContent('initiative-1');

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(mockGetMerchantInitiativeList).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('initiatives-count')).toHaveTextContent('1');
    expect(screen.getByTestId('first-name')).toHaveTextContent('Bonus Test');
  });

  it('falls back to an empty initiatives list when loading fails', async () => {
    mockGetMerchantInitiativeList.mockRejectedValue(new Error('boom'));

    renderProvider('/base/initiative-2/prodotti');

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('initiative-id')).toHaveTextContent('initiative-2');
    expect(screen.getByTestId('initiatives-count')).toHaveTextContent('0');
  });

  it('falls back to an empty initiatives list when response data is missing', async () => {
    mockGetMerchantInitiativeList.mockResolvedValue({});

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('initiatives-count')).toHaveTextContent('0');
  });

  it('does not update context after unmounting during initiative loading', async () => {
    let resolveRequest: (value: unknown) => void = () => undefined;
    mockGetMerchantInitiativeList.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const { unmount } = renderProvider();

    unmount();
    resolveRequest({ data: [{ initiativeId: 'initiative-1', initiativeName: 'Late Initiative' }] });

    await waitFor(() => {
      expect(mockGetMerchantInitiativeList).toHaveBeenCalledTimes(1);
    });
  });
});
