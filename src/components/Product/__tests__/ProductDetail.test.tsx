import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductDetail from '../ProductDetail';
import { ProductDTO, CategoryEnum } from '../../../api/generated/register/ProductDTO';
import { ProductStatusEnum } from '../../../api/generated/register/ProductStatus';
import { MIDDLE_STATES, PRODUCTS_STATES, USERS_TYPES } from '../../../utils/constants';
import * as helpers from '../../../helpers';
import * as registerService from '../../../services/registerService';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, _?: any) => k,
  }),
}));

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: jest.fn(),
  truncateString: jest.fn((s: string) => s),
}));

jest.mock('../../../services/registerService', () => ({
  setRejectedStatusList: jest.fn(),
  setWaitApprovedStatusList: jest.fn(),
}));

const ProductConfirmDialog = ({ open, onCancel, onConfirm, onSuccess }: any) =>
  open ? (
    <div data-testid="confirm-dialog">
      <button data-testid="dialog-cancel" onClick={onCancel}>
        Cancel
      </button>
      <button
        data-testid="dialog-confirm"
        onClick={async () => {
          await onConfirm?.();
          onSuccess?.();
        }}
      >
        Confirm
      </button>
    </div>
  ) : null;

// Se ProductDetail importa ProductConfirmDialog, si può fare:
// jest.mock('../ProductConfirmDialog', () => ({ __esModule: true, default: ProductConfirmDialog }));

jest.mock('../ProductInfoRow', () => ({
  __esModule: true,
  default: ({ label, value }: any) => (
    <div data-testid="product-info-row">
      <span data-testid="row-label">{label}</span>
      <span data-testid="row-value">{typeof value === 'string' ? value : 'node'}</span>
      {typeof value !== 'string' ? value : null}
    </div>
  ),
}));

jest.mock('../ProductStatusChip', () => ({
  __esModule: true,
  default: ({ status }: any) => <div data-testid="status-chip">{String(status)}</div>,
}));

jest.mock('../ProductModal', () => {
  return function ProductModal({ open, onClose, onSuccess, actionType }: any) {
    if (!open) return null;
    return (
      <div data-testid="product-modal">
        <div data-testid="modal-action">{String(actionType)}</div>
        <button
          data-testid="modal-success"
          onClick={() => {
            onSuccess?.(actionType);
            onClose?.();
          }}
        >
          Success
        </button>
        <button data-testid="modal-close" onClick={() => onClose?.()}>
          Close
        </button>
      </div>
    );
  };
});

const theme = createTheme();

const baseData = (over: Partial<ProductDTO> = {}): ProductDTO => ({
  gtinCode: 'GTIN-001',
  productName: 'Prod',
  batchName: 'Batch',
  registrationDate: '2024-01-01T00:00:00.000Z',
  eprelCode: 'EPREL',
  productCode: 'P1',
  category: CategoryEnum.Lavatrice,
  brand: 'B',
  model: 'M',
  energyClass: 'A',
  countryOfProduction: 'IT',
  capacity: '10',
  status: ProductStatusEnum.UPLOADED,
  statusChangeChronology: [],
  ...over,
});

const renderCmp = (
  props: Partial<React.ComponentProps<typeof ProductDetail>> = {},
  data?: ProductDTO
) => {
  const allProps: React.ComponentProps<typeof ProductDetail> = {
    open: true,
    data: data ?? baseData(),
    isInvitaliaUser: true,
    isInvitaliaAdmin: false,
    onUpdateTable: jest.fn(),
    onClose: jest.fn(),
    onShowApprovedMsg: jest.fn(),
    onShowRejectedMsg: jest.fn(),
    onShowWaitApprovedMsg: jest.fn(),
    onShowSupervisedMsg: jest.fn(),
    onShowRejectedApprovationMsg: jest.fn(),
    onShowAcceptApprovationMsg: jest.fn(),
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <ProductDetail {...allProps} />
    </ThemeProvider>
  );
};

describe('ProductDetail.extra', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_role: USERS_TYPES.INVITALIA_L1,
    });
  });

  it('renders chronology + formalMotivation blocks when present (non OPERATORE)', () => {
    const data = baseData({
      statusChangeChronology: [
        { role: 'L1', motivation: '   ', updateDate: '2024-05-05T10:00:00Z' },
        { role: 'L1', motivation: 'Reason OK', updateDate: '2024-05-06T11:00:00Z' },
      ] as any,
      formalMotivation: 'Formal OK',
    });

    renderCmp({}, data);

    expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    expect(screen.getAllByTestId('product-info-row').length).toBeGreaterThan(0);

    expect(screen.getByText('pages.productDetail.motivation')).toBeInTheDocument();
    expect(screen.getByText('pages.productDetail.motivationFormal')).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: /Motivazione formale/ })).toHaveValue('Formal OK');
  });

  it('Invitalia L1 + SUPERVISED: shows accept/reject buttons; confirm approve calls waitApproved API and waitApproved message', async () => {
    const data = baseData({ status: ProductStatusEnum.SUPERVISED });

    renderCmp({}, data);

    const accept = screen.getByTestId('acceptApprovationBtn');
    const reject = screen.getByTestId('rejectApprovationBtn');
    expect(accept).toBeInTheDocument();
    expect(reject).toBeInTheDocument();

    fireEvent.click(accept);
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-confirm'));

    await waitFor(() => {
      expect(registerService.setWaitApprovedStatusList).toHaveBeenCalledTimes(1);
    });
  });

  it('Invitalia L1 + UPLOADED: open Supervised modal then close (not cancelled) triggers onUpdateTable/onClose; success triggers onShowSupervisedMsg', async () => {
    const onUpdateTable = jest.fn();
    const onClose = jest.fn();
    const onShowSupervisedMsg = jest.fn();
    renderCmp({ onUpdateTable, onClose, onShowSupervisedMsg });

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-action')).toHaveTextContent(PRODUCTS_STATES.SUPERVISED);

    fireEvent.click(screen.getByTestId('modal-close'));
    expect(onUpdateTable).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    fireEvent.click(screen.getByTestId('modal-success'));
    await waitFor(() => {
      expect(onShowSupervisedMsg).toHaveBeenCalledTimes(1);
    });
  });

  it('Invitalia L2 + WAIT_APPROVED: shows AcceptApprovation and RejectApprovation flows', async () => {
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_role: USERS_TYPES.INVITALIA_L2,
    });

    const onShowAccept = jest.fn();
    const onShowRejectApp = jest.fn();
    renderCmp(
      {
        isInvitaliaUser: false,
        isInvitaliaAdmin: true,
        onShowAcceptApprovationMsg: onShowAccept,
        onShowRejectedApprovationMsg: onShowRejectApp,
      },
      baseData({ status: ProductStatusEnum.WAIT_APPROVED })
    );

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    expect(screen.getByTestId('modal-action')).toHaveTextContent(MIDDLE_STATES.ACCEPT_APPROVATION);
    fireEvent.click(screen.getByTestId('modal-success'));
    await waitFor(() => expect(onShowAccept).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    expect(screen.getByTestId('modal-action')).toHaveTextContent(MIDDLE_STATES.REJECT_APPROVATION);
    fireEvent.click(screen.getByTestId('modal-success'));
    await waitFor(() => expect(onShowRejectApp).toHaveBeenCalledTimes(1));
  });

  it('Confirm dialog approve on UPLOADED calls waitApproved API and shows waitApproved (prefers onShowWaitApprovedMsg over onShowApprovedMsg)', async () => {
    const onShowApproved = jest.fn();
    const onShowWait = jest.fn();
    renderCmp({ onShowApprovedMsg: onShowApproved, onShowWaitApprovedMsg: onShowWait });

    fireEvent.click(screen.getByTestId('approvedBtn'));
    fireEvent.click(screen.getByTestId('dialog-confirm'));

    await waitFor(() => {
      expect(registerService.setWaitApprovedStatusList).toHaveBeenCalledTimes(1);
      expect(onShowWait).toHaveBeenCalledTimes(1);
      expect(onShowApproved).not.toHaveBeenCalled();
    });
  });

  it('Exclude flow (L1 + UPLOADED): opening and success triggers onShowRejectedMsg via handleSuccess', async () => {
    const onShowRejected = jest.fn();
    renderCmp({ onShowRejectedMsg: onShowRejected });

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-action')).toHaveTextContent(PRODUCTS_STATES.REJECTED);

    fireEvent.click(screen.getByTestId('modal-success'));
    await waitFor(() => {
      expect(onShowRejected).toHaveBeenCalledTimes(1);
    });
  });
});
