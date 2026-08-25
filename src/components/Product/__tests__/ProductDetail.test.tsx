import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductDetail from '../ProductDetail';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (k: string) => k }),
}));

jest.mock('../../../hooks/useInitiativeConfig', () => ({
  useInitiativeConfig: jest.fn(() => ({
    config: {
      tables: { products: { style: { lengths: { detail: 20 } } } },
      templates: { categories: { cookinghobs: { name: 'Piano cottura' } } },
    },
  })),
}));

const { useInitiativeConfig } = require('../../../hooks/useInitiativeConfig');

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

jest.mock('../../../api/registerApiClient', () => ({
  RegisterApi: {
    setRejectedStatusList: jest.fn(() => Promise.resolve()),
    setWaitApprovedStatusList: jest.fn(() => Promise.resolve()),
  },
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
        <button
          onClick={() => onSuccess?.('REJECT_APPROVATION')}
          data-testid="success-reject-approval"
        >
          success reject approval
        </button>
        <button
          onClick={() => onSuccess?.('ACCEPT_APPROVATION')}
          data-testid="success-accept-approval"
        >
          success accept approval
        </button>
      </div>
    ) : null,
}));

jest.mock('../ProductModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onSuccess, actionType, selectedProducts }: any) =>
    open ? (
      <div data-testid="modal">
        <span data-testid="modal-action">{actionType}</span>
        <span data-testid="modal-gtin-length">{(selectedProducts?.[0]?.gtinCode ?? '').length}</span>
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

type RenderDetailOptions = {
  data?: any;
  isInvitaliaUser?: boolean;
  isInvitaliaAdmin?: boolean;
  detailFields?: Array<any>;
  onShowRejectedMsg?: any;
  [extraProp: string]: any;
};

const renderDetail = (options: RenderDetailOptions = {}) => {
  const {
    data = baseData,
    isInvitaliaUser = false,
    isInvitaliaAdmin = false,
    detailFields,
    onShowRejectedMsg = jest.fn(),
    ...rest
  } = options;

  return render(
    <ProductDetail
      open
      data={data}
      detailFields={detailFields}
      isInvitaliaUser={isInvitaliaUser}
      isInvitaliaAdmin={isInvitaliaAdmin}
      onShowRejectedMsg={onShowRejectedMsg}
      {...rest}
    />
  );
};

const invitaliaUploaded = { data: { ...baseData, status: 'UPLOADED' }, isInvitaliaUser: true };
const invitaliaSupervised = { data: { ...baseData, status: 'SUPERVISED' }, isInvitaliaUser: true };
const adminWaitApproved = {
  data: { ...baseData, status: 'WAIT_APPROVED' },
  isInvitaliaAdmin: true,
};

const buildRejectedFormalData = (formalMotivation: string, extraChronology: any = {}) => ({
  ...baseData,
  status: 'REJECTED',
  formalMotivation,
  statusChangeChronology: [
    { role: 'L2', targetStatus: 'REJECTED', updateDate: '2024-02-03T09:15:00Z', ...extraChronology },
  ],
});

const clickSequence = (...testIds: Array<string>) => {
  testIds.forEach((id) => fireEvent.click(screen.getByTestId(id)));
};

describe('ProductDetail', () => {
  beforeEach(() => {
    useInitiativeConfig.mockReturnValue({
      config: {
        tables: { products: { style: { lengths: { detail: 20 } } } },
        templates: { categories: { cookinghobs: { name: 'Piano cottura' } } },
      },
    });
  });

  it('renders supervised buttons for invitalia user', () => {
    renderDetail(invitaliaSupervised);

    expect(screen.getByTestId('acceptApprovationBtn')).toBeInTheDocument();
    expect(screen.getByTestId('rejectApprovationBtn')).toBeInTheDocument();
  });

  it('renders admin buttons for WAIT_APPROVED', () => {
    renderDetail(adminWaitApproved);

    expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
  });

  it('does not render action section when not invitalia', () => {
    renderDetail();

    expect(screen.queryByTestId('approvedBtn')).not.toBeInTheDocument();
  });

  it('handles supervision modal branch', () => {
    renderDetail(invitaliaUploaded);

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    expect(screen.getAllByTestId('modal').length).toBeGreaterThan(0);
  });

  it('disables invitalia actions when initiative is closed', () => {
    renderDetail({ ...invitaliaUploaded, isInitiativeClosed: true });

    const approvedBtn = screen.getByTestId('approvedBtn');
    const supervisedBtn = screen.getByTestId('supervisedBtn');
    const rejectedBtn = screen.getByTestId('rejectedBtn');

    expect(approvedBtn).toBeDisabled();
    expect(supervisedBtn).toBeDisabled();
    expect(rejectedBtn).toBeDisabled();

    fireEvent.click(approvedBtn);
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('renders base information', () => {
    renderDetail();

    expect(screen.getByTestId('status')).toHaveTextContent('UPLOADED');
    expect(screen.getByText('Product A')).toBeInTheDocument();
  });

  it('renders action buttons for invitalia user', () => {
    renderDetail(invitaliaUploaded);

    expect(screen.getByTestId('approvedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
  });

  it.skip('handles confirm restore', async () => {
    const onUpdate = jest.fn();
    const onClose = jest.fn();
    const onWait = jest.fn();

    renderDetail({
      ...invitaliaUploaded,
      onUpdateTable: onUpdate,
      onClose,
      onShowWaitApprovedMsg: onWait,
    });

    clickSequence('approvedBtn', 'confirm');
    await Promise.resolve();

    expect(onUpdate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onWait).toHaveBeenCalled();
  });

  it('renders formal motivation when present', () => {
    renderDetail({ data: { ...baseData, formalMotivation: 'Reason', status: 'REJECTED' } });

    expect(screen.getByText('Reason')).toBeInTheDocument();
  });

  it('handles confirm restore and refresh callbacks', async () => {
    const onUpdate = jest.fn();
    const onClose = jest.fn();
    const onWait = jest.fn();

    renderDetail({
      ...invitaliaUploaded,
      onUpdateTable: onUpdate,
      onClose,
      onShowWaitApprovedMsg: onWait,
    });

    clickSequence('approvedBtn', 'confirm');
    await screen.findByTestId('approvedBtn');

    expect(onUpdate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onWait).toHaveBeenCalled();
  });

  it('falls back to approved message when wait-approved callback is missing', async () => {
    const onApproved = jest.fn();

    renderDetail({ ...invitaliaSupervised, onShowApprovedMsg: onApproved });

    clickSequence('acceptApprovationBtn', 'confirm');
    await screen.findByTestId('acceptApprovationBtn');

    expect(onApproved).toHaveBeenCalled();
  });

  it('renders configured detail fields with formatted and empty values', () => {
    renderDetail({
      detailFields: [
        { id: 'productName', labelKey: 'custom.productName' },
        { id: 'registrationDate' },
        { id: 'missingField' },
      ],
    });

    expect(screen.getByText('custom.productName')).toBeInTheDocument();
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders motivation chronology and skips empty motivations', () => {
    renderDetail({
      data: {
        ...baseData,
        statusChangeChronology: [
          { role: 'L1', updateDate: '2024-01-02T10:30:00Z', motivation: 'Needs review' },
          { role: 'L2', updateDate: '2024-01-03T10:30:00Z', motivation: '   ' },
        ],
      },
    });

    expect(screen.getByText('pages.productDetail.motivation')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Needs review')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('   ')).not.toBeInTheDocument();
  });

  it('renders formal motivation header for non-operator users', () => {
    renderDetail({ data: buildRejectedFormalData('Formal reason') });

    expect(screen.getByDisplayValue('Formal reason')).toBeInTheDocument();
  });

  it('renders formal motivation for operator only when product is rejected', () => {
    const { fetchUserFromLocalStorage } = require('../../../helpers');
    fetchUserFromLocalStorage.mockReturnValueOnce({ org_role: 'operatore' });

    renderDetail({ data: buildRejectedFormalData('Operator visible reason', { role: undefined }) });

    expect(screen.getByDisplayValue('Operator visible reason')).toBeInTheDocument();
  });



  it.each([
    ['supervisedBtn', 'modal-success', 'onShowSupervisedMsg'],
    ['rejectedBtn', 'modal-success', 'onShowRejectedMsg'],
  ])('fires success callback for %s action', (buttonId, successId, callbackName) => {
    const callbacks: any = {
      onShowSupervisedMsg: jest.fn(),
      onShowRejectedMsg: jest.fn(),
    };

    renderDetail({ ...invitaliaUploaded, ...callbacks });

    clickSequence(buttonId, successId);

    expect(callbacks[callbackName]).toHaveBeenCalled();
  });

  it.each([
    ['accept', 'supervisedBtn', 'onShowAcceptApprovationMsg'],
    ['reject', 'rejectedBtn', 'onShowRejectedApprovationMsg'],
  ])('fires admin %s-approval success callback', (_label, buttonId, callbackName) => {
    const callback = jest.fn();
    renderDetail({ ...adminWaitApproved, [callbackName]: callback });

    clickSequence(buttonId, 'modal-success');

    expect(callback).toHaveBeenCalled();
  });

  it('handles confirm restore error branch and shows generic error', async () => {
    const registerService = require('../../../services/registerService');
    registerService.setWaitApprovedStatusList.mockImplementationOnce(() =>
      Promise.reject(new Error('error'))
    );

    const onClose = jest.fn();
    const onShowGenericError = jest.fn();

    renderDetail({ ...invitaliaUploaded, onClose, onShowGenericError });

    clickSequence('approvedBtn', 'confirm');
    await screen.findByTestId('approvedBtn');

    expect(onClose).not.toHaveBeenCalled();
    expect(onShowGenericError).toHaveBeenCalled();
  });

  it('cancels confirm dialog when onCancel fired', () => {
    renderDetail(invitaliaUploaded);

    fireEvent.click(screen.getByTestId('approvedBtn'));
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('cancel-confirm'));
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('renders cooking hobs check date label for registrationDate field', () => {
    renderDetail({
      data: { ...baseData, category: 'Piano cottura' },
      detailFields: [{ id: 'registrationDate' }],
    });

    expect(screen.getByText('pages.productDetail.checkDate')).toBeInTheDocument();
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
  });

  it('renders productSheet header field', () => {
    renderDetail({ detailFields: [{ id: 'productSheet' }] });

    expect(screen.getByText('pages.productDetail.productSheet')).toBeInTheDocument();
  });

  it('renders default eprel label when cooking hobs config is missing', () => {
    useInitiativeConfig.mockReturnValueOnce({
      config: {
        tables: { products: { style: { lengths: { detail: 20 } } } },
        templates: { categories: {} },
      },
    });

    renderDetail({
      data: { ...baseData, category: 'Piano cottura' },
      detailFields: [{ id: 'registrationDate' }],
    });

    expect(screen.getByText('pages.productDetail.eprelCheckDate')).toBeInTheDocument();
  });

  it('renders batchName custom field', () => {
    renderDetail({ detailFields: [{ id: 'batchName' }] });

    expect(screen.getByText('Batch A')).toBeInTheDocument();
  });

  it('renders empty data for missing registrationDate in base rows', () => {
    renderDetail({ data: { ...baseData, registrationDate: undefined } });

    expect(screen.getByText('pages.productDetail.eprelCheckDate')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });

  it('uses detail max length fallback when config length is missing', () => {
    const { truncateString } = require('../../../helpers');
    truncateString.mockClear();

    useInitiativeConfig.mockReturnValueOnce({
      config: {
        templates: { categories: { cookinghobs: { name: 'Piano cottura' } } },
      },
    });

    renderDetail({ data: buildRejectedFormalData('Formal reason') });

    expect(truncateString).toHaveBeenCalledWith(expect.any(String), 40);
  });

  it('calls wait-approved API with empty gtin when gtinCode is undefined', async () => {
    const registerService = require('../../../services/registerService');

    renderDetail({
      ...invitaliaUploaded,
      data: { ...baseData, status: 'UPLOADED', gtinCode: undefined },
    });

    clickSequence('approvedBtn', 'confirm');

    await waitFor(() => {
      expect(registerService.setWaitApprovedStatusList).toHaveBeenCalled();
    });
    expect(registerService.setWaitApprovedStatusList).toHaveBeenCalledWith(
      'initiative-1',
      [''],
      'UPLOADED',
      '-',
      )
  });

  it('closes supervision modal and maps empty gtin in selectedProducts', () => {
    renderDetail({
      ...invitaliaUploaded,
      data: { ...baseData, status: 'UPLOADED', gtinCode: undefined },
    });

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    expect(screen.getByTestId('modal-gtin-length')).toHaveTextContent('0');
    fireEvent.click(screen.getByTestId('close-modal-confirmed'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('closes exclude modal and maps empty gtin in selectedProducts', () => {
    renderDetail({
      ...invitaliaUploaded,
      data: { ...baseData, status: 'UPLOADED', gtinCode: undefined },
    });

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    expect(screen.getByTestId('modal-gtin-length')).toHaveTextContent('0');
    fireEvent.click(screen.getByTestId('close-modal-cancelled'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('does not fail on modal success when no message callbacks are provided', () => {
    renderDetail({
      ...invitaliaUploaded,
      onShowRejectedMsg: undefined,
      onShowApprovedMsg: undefined,
      onShowWaitApprovedMsg: undefined,
      onShowSupervisedMsg: undefined,
      onShowRejectedApprovationMsg: undefined,
      onShowAcceptApprovationMsg: undefined,
    });

    clickSequence('rejectedBtn', 'modal-success');

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
  });

  it('renders formal motivation header with role for non-operator user', () => {
    renderDetail({ data: buildRejectedFormalData('Formal reason with role') });

    expect(screen.getByDisplayValue('Formal reason with role')).toBeInTheDocument();
  });

  it('renders formal motivation header without role for non-operator user', () => {
    renderDetail({
      data: buildRejectedFormalData('Formal reason no role', {
        role: undefined,
        updateDate: 'invalid-date',
      }),
    });

    expect(screen.getByDisplayValue('Formal reason no role')).toBeInTheDocument();
  });



  it('renders formal motivation with chronology missing updateDate (invalid date branch)', () => {
    renderDetail({
      data: buildRejectedFormalData('No date reason', { updateDate: undefined }),
    });

    expect(screen.getByDisplayValue('No date reason')).toBeInTheDocument();
  });

  it('does not render formal motivation for operator when not rejected', () => {
    const { fetchUserFromLocalStorage } = require('../../../helpers');
    fetchUserFromLocalStorage.mockReturnValueOnce({ org_role: 'operatore' });

    renderDetail({
      data: { ...baseData, status: 'UPLOADED', formalMotivation: 'Hidden reason' },
    });

    expect(screen.queryByDisplayValue('Hidden reason')).not.toBeInTheDocument();
  });
});
