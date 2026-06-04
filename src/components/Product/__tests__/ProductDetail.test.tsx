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
  default: ({ open, onCancel, onConfirm, onSuccess }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <button onClick={onCancel} data-testid="cancel-confirm">
          cancel
        </button>
        <button onClick={onConfirm} data-testid="confirm">
          confirm
        </button>
        <button onClick={() => onSuccess?.('SUPERVISED')} data-testid="success-supervised">
          success supervised
        </button>
        <button onClick={() => onSuccess?.('REJECTED')} data-testid="success-rejected">
          success rejected
        </button>
        <button onClick={() => onSuccess?.('WAIT_APPROVED')} data-testid="success-wait">
          success wait
        </button>
        <button onClick={() => onSuccess?.('REJECT_APPROVATION')} data-testid="success-reject-approval">
          success reject approval
        </button>
        <button onClick={() => onSuccess?.('ACCEPT_APPROVATION')} data-testid="success-accept-approval">
          success accept approval
        </button>
      </div>
    ) : null,
}));

jest.mock('../ProductModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess, actionType }: any) =>
    open ? (
      <div data-testid="modal">
        <span data-testid="modal-action">{actionType}</span>
        <button onClick={() => onClose?.(false)} data-testid="close-modal-confirmed">
          close confirmed
        </button>
        <button onClick={() => onClose?.(true)} data-testid="close-modal-cancelled">
          close cancelled
        </button>
        <button onClick={() => onSuccess?.()} data-testid="modal-success">
          modal success
        </button>
      </div>
    ) : null,
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

  it.skip('handles confirm restore', async () => {
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

  it('handles confirm restore and refresh callbacks', async () => {
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

    await screen.findByTestId('approvedBtn');

    expect(onUpdate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onWait).toHaveBeenCalled();
  });

  it('falls back to approved message when wait-approved callback is missing', async () => {
    const onApproved = jest.fn();

    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'SUPERVISED' }}
        isInvitaliaUser
        isInvitaliaAdmin={false}
        onShowApprovedMsg={onApproved}
        onShowRejectedMsg={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('acceptApprovationBtn'));
    fireEvent.click(screen.getByTestId('confirm'));

    await screen.findByTestId('acceptApprovationBtn');

    expect(onApproved).toHaveBeenCalled();
  });

  it('renders configured detail fields with formatted and empty values', () => {
    render(
      <ProductDetail
        open
        data={baseData}
        detailFields={[
          { id: 'productName', labelKey: 'custom.productName' },
          { id: 'registrationDate' },
          { id: 'missingField' },
        ]}
        isInvitaliaUser={false}
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByText('custom.productName')).toBeInTheDocument();
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders motivation chronology and skips empty motivations', () => {
    render(
      <ProductDetail
        open
        data={{
          ...baseData,
          statusChangeChronology: [
            {
              role: 'L1',
              updateDate: '2024-01-02T10:30:00Z',
              motivation: 'Needs review',
            },
            {
              role: 'L2',
              updateDate: '2024-01-03T10:30:00Z',
              motivation: '   ',
            },
          ],
        }}
        isInvitaliaUser={false}
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByText('pages.productDetail.motivation')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Needs review')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('   ')).not.toBeInTheDocument();
  });

  it('renders formal motivation header for non-operator users', () => {
    render(
      <ProductDetail
        open
        data={{
          ...baseData,
          formalMotivation: 'Formal reason',
          statusChangeChronology: [
            {
              role: 'L2',
              targetStatus: 'REJECTED',
              updateDate: '2024-02-03T09:15:00Z',
            },
          ],
        }}
        isInvitaliaUser={false}
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('Formal reason')).toBeInTheDocument();
  });

  it('renders formal motivation for operator only when product is rejected', () => {
    const { fetchUserFromLocalStorage } = require('../../../helpers');
    fetchUserFromLocalStorage.mockReturnValueOnce({ org_role: 'operatore' });

    render(
      <ProductDetail
        open
        data={{
          ...baseData,
          status: 'REJECTED',
          formalMotivation: 'Operator visible reason',
          statusChangeChronology: [{ targetStatus: 'REJECTED', updateDate: '2024-02-03T09:15:00Z' }],
        }}
        isInvitaliaUser={false}
        isInvitaliaAdmin={false}
        onShowRejectedMsg={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('Operator visible reason')).toBeInTheDocument();
  });

  it('calls close callbacks when supervision modal closes after confirmation', () => {
    const onUpdate = jest.fn();
    const onClose = jest.fn();

    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'UPLOADED' }}
        isInvitaliaUser
        isInvitaliaAdmin={false}
        onUpdateTable={onUpdate}
        onClose={onClose}
        onShowRejectedMsg={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    fireEvent.click(screen.getByTestId('close-modal-confirmed'));

    expect(onUpdate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call close callbacks when supervision modal is cancelled', () => {
    const onUpdate = jest.fn();
    const onClose = jest.fn();

    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'WAIT_APPROVED' }}
        isInvitaliaUser={false}
        isInvitaliaAdmin
        onUpdateTable={onUpdate}
        onClose={onClose}
        onShowRejectedMsg={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    fireEvent.click(screen.getByTestId('close-modal-cancelled'));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each([
    ['supervisedBtn', 'modal-success', 'onShowSupervisedMsg'],
    ['rejectedBtn', 'modal-success', 'onShowRejectedMsg'],
  ])('fires success callback for %s action', (buttonId, successId, callbackName) => {
    const callbacks: any = {
      onShowSupervisedMsg: jest.fn(),
      onShowRejectedMsg: jest.fn(),
    };

    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'UPLOADED' }}
        isInvitaliaUser
        isInvitaliaAdmin={false}
        {...callbacks}
      />
    );

    fireEvent.click(screen.getByTestId(buttonId));
    fireEvent.click(screen.getByTestId(successId));

    expect(callbacks[callbackName]).toHaveBeenCalled();
  });

  it('fires admin accept-approval success callback', () => {
    const onShowAcceptApprovationMsg = jest.fn();

    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'WAIT_APPROVED' }}
        isInvitaliaUser={false}
        isInvitaliaAdmin
        onShowAcceptApprovationMsg={onShowAcceptApprovationMsg}
        onShowRejectedMsg={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    fireEvent.click(screen.getByTestId('modal-success'));

    expect(onShowAcceptApprovationMsg).toHaveBeenCalled();
  });

  it('fires rejected-approval success callback for admin rejection', () => {
    const onShowRejectedApprovationMsg = jest.fn();

    render(
      <ProductDetail
        open
        data={{ ...baseData, status: 'WAIT_APPROVED' }}
        isInvitaliaUser={false}
        isInvitaliaAdmin
        onShowRejectedApprovationMsg={onShowRejectedApprovationMsg}
        onShowRejectedMsg={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    fireEvent.click(screen.getByTestId('modal-success'));

    expect(onShowRejectedApprovationMsg).toHaveBeenCalled();
  });
});
