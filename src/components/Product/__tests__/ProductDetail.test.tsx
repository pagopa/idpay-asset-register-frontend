/// <reference types="jest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetail from '../ProductDetail';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (k: string) => k }),
}));

jest.mock('../../../hooks/useInitiativeConfig', () => ({
  useInitiativeConfig: () => ({
    config: { tables: { products: { style: { lengths: { detail: 20 } } } } },
  }),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: jest.fn(() => ({ org_role: 'ADMIN' })),
  truncateString: jest.fn((v: string) => v),
}));

jest.mock('../../../services/registerService', () => ({
  setRejectedStatusList: jest.fn(() => Promise.resolve()),
  setWaitApprovedStatusList: jest.fn(() => Promise.resolve()),
}));

jest.mock('../ProductStatusChip', () => ({
  __esModule: true,
  default: ({ status }: any) => <div data-testid="status">{status}</div>,
}));

jest.mock('../ProductInfoRow', () => ({
  __esModule: true,
  default: ({ label, value }: any) => (
    <div>
      <span>{label}</span>
      <div>{value}</div>
    </div>
  ),
}));

jest.mock('../ProductConfirmDialog', () => ({
  __esModule: true,
  default: ({ onConfirm }: any) => (
    <button onClick={onConfirm} data-testid="confirm">
      confirm
    </button>
  ),
}));

jest.mock('../ProductModal', () => ({
  __esModule: true,
  default: () => <div data-testid="modal">modal</div>,
}));

const baseData: any = {
  gtinCode: '123',
  productName: 'Product A',
  batchName: 'Batch A',
  registrationDate: '2024-01-01',
  status: 'UPLOADED',
  category: 'Cat',
  brand: 'Brand',
  model: 'Model',
  energyClass: 'A',
  countryOfProduction: 'IT',
  capacity: '100L',
};

describe('ProductDetail', () => {
  it('renders supervised buttons for invitalia user', () => {
    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'SUPERVISED' }}
        isInvitaliaUser
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByTestId('acceptApprovationBtn')).toBeInTheDocument();
    expect(screen.getByTestId('rejectApprovationBtn')).toBeInTheDocument();
  });

  it('renders admin buttons for WAIT_APPROVED', () => {
    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'WAIT_APPROVED' }}
        isInvitaliaUser={false}
        isInvitaliaAdmin
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
  });

  it('does not render action section when not invitalia', () => {
    render(
      <ProductDetail
        open
        data={baseData}
        isInvitaliaUser={false}
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.queryByTestId('approvedBtn')).not.toBeInTheDocument();
  });

  it('handles supervision modal branch', () => {
    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'UPLOADED' }}
        isInvitaliaUser
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    const supervised = screen.getByTestId('supervisedBtn');
    fireEvent.click(supervised);
    expect(screen.getAllByTestId('modal').length).toBeGreaterThan(0);
  });
  it('renders base information', () => {
    render(
      <ProductDetail
        open
        data={baseData}
        isInvitaliaUser={false}
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByTestId('status')).toHaveTextContent('UPLOADED');
    expect(screen.getByText('Product A')).toBeInTheDocument();
  });

  it('renders action buttons for invitalia user', () => {
    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'UPLOADED' }}
        isInvitaliaUser
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByTestId('approvedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
  });

  it('handles confirm restore', async () => {
    const onUpdate = jest.fn();
    const onClose = jest.fn();
    const onWait = jest.fn();

    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'UPLOADED' }}
        isInvitaliaUser
        isInvitaliaAdmin={false}
        onUpdateTable={onUpdate}
        onClose={onClose}
        onShowWaitApprovedMsg={onWait}
        onShowRejectedMsg={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('approvedBtn'));
    fireEvent.click(screen.getByTestId('confirm'));

    await Promise.resolve();

    expect(onUpdate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onWait).toHaveBeenCalled();
  });

  it('renders formal motivation when present', () => {
    render(
      <ProductDetail
        open
        data={{ ...baseData, formalMotivation: 'Reason', status: 'REJECTED' }}
        isInvitaliaUser={false}
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByText('Reason')).toBeInTheDocument();
  });
});
