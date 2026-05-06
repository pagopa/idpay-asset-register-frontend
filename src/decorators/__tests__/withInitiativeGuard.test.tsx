/// <reference types="jest" />

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import WithInitiativeGuard from '../withInitiativeGuard';

jest.mock('../../hooks/useInitiativeGuardState', () => ({
  useInitiativeGuardState: jest.fn(),
}));

import { useInitiativeGuardState } from '../../hooks/useInitiativeGuardState';

jest.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
}));

describe('WithInitiativeGuard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    (useInitiativeGuardState as jest.Mock).mockReturnValue({
      initiativeId: undefined,
      initiatives: [],
      isListLoaded: false,
      isValid: false,
    });

    render(
      <WithInitiativeGuard>
        <div data-testid="guarded-content">Content</div>
      </WithInitiativeGuard>
    );

    expect(screen.getByText(/caricamento iniziative/i)).toBeInTheDocument();
  });

  it('should redirect HOME on empty initiatives list', () => {
    (useInitiativeGuardState as jest.Mock).mockReturnValue({
      initiativeId: '1',
      initiatives: [],
      isListLoaded: true,
      isValid: true,
    });

    render(
      <WithInitiativeGuard>
        <div data-testid="guarded-content">Content</div>
      </WithInitiativeGuard>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', expect.stringContaining('/'));
  });

  it('should redirect HOME when initiativeId missing', () => {
    (useInitiativeGuardState as jest.Mock).mockReturnValue({
      initiativeId: undefined,
      initiatives: [{ initiativeId: '1' }],
      isListLoaded: true,
      isValid: false,
    });

    render(
      <WithInitiativeGuard>
        <div data-testid="guarded-content">Content</div>
      </WithInitiativeGuard>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', expect.stringContaining('/'));
  });

  it('should redirect HOME when initiativeId invalid', () => {
    (useInitiativeGuardState as jest.Mock).mockReturnValue({
      initiativeId: '999',
      initiatives: [{ initiativeId: '1' }],
      isListLoaded: true,
      isValid: false,
    });

    render(
      <WithInitiativeGuard>
        <div data-testid="guarded-content">Content</div>
      </WithInitiativeGuard>
    );

    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', expect.stringContaining('/'));
  });

  it('should render children when state is OK', () => {
    (useInitiativeGuardState as jest.Mock).mockReturnValue({
      initiativeId: '1',
      initiatives: [{ initiativeId: '1' }],
      isListLoaded: true,
      isValid: true,
    });

    render(
      <WithInitiativeGuard>
        <div data-testid="guarded-content">Content</div>
      </WithInitiativeGuard>
    );

    expect(screen.getByTestId('guarded-content')).toBeInTheDocument();
  });
});
