import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductBulkActionDialog from '../ProductBulkActionDialog';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../../utils/constants';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../ProductDataGrid.helpers', () => ({
  handleModalSuccess: jest.fn(),
}));

const defaultProps = {
  open: true,
  action: PRODUCTS_STATES.REJECTED,
  selected: ['1'],
  tableData: [{ gtinCode: '1', status: PRODUCTS_STATES.REJECTED }] as any,
  isInvitaliaUser: true,
  onClose: jest.fn(),
  onConfirm: jest.fn().mockResolvedValue(undefined),
  setShowMsgRejected: jest.fn(),
  setShowMsgApproved: jest.fn(),
  setShowMsgWaitApproved: jest.fn(),
};

describe('ProductBulkActionDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when action is undefined', () => {
    const { container } = render(
      <ProductBulkActionDialog {...defaultProps} action={undefined} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog with reason field when required', () => {
    render(<ProductBulkActionDialog {...defaultProps} />);
    expect(
      screen.getByText('invitaliaModal.rejected.title')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('invitaliaModal.rejected.reasonLabel')
    ).toBeInTheDocument();
  });

  it('does not call onConfirm if reason required and empty', async () => {
    render(<ProductBulkActionDialog {...defaultProps} />);
    fireEvent.click(
      screen.getByText('invitaliaModal.rejected.buttonTextConfirm')
    );
    await waitFor(() => {
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });
  });

  it('calls onConfirm and handleModalSuccess when confirmed with reason', async () => {
    render(<ProductBulkActionDialog {...defaultProps} />);
    const input = screen.getByLabelText(
      'invitaliaModal.rejected.reasonLabel'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'reason' } });

    fireEvent.click(
      screen.getByText('invitaliaModal.rejected.buttonTextConfirm')
    );

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledWith(
        PRODUCTS_STATES.REJECTED,
        'reason'
      );
    });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows loading spinner when confirming', async () => {
    const slowConfirm = jest.fn(
      (): Promise<void> =>
        new Promise<void>((resolve) => setTimeout(() => resolve(), 50))
    );

    render(
      <ProductBulkActionDialog
        {...defaultProps}
        onConfirm={slowConfirm}
      />
    );

    fireEvent.change(
      screen.getByLabelText('invitaliaModal.rejected.reasonLabel'),
      { target: { value: 'reason' } }
    );

    fireEvent.click(
      screen.getByText('invitaliaModal.rejected.buttonTextConfirm')
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(slowConfirm).toHaveBeenCalled();
    });
  });

  it('renders without reason field when not required', () => {
    render(
      <ProductBulkActionDialog
        {...defaultProps}
        action={PRODUCTS_STATES.WAIT_APPROVED}
      />
    );

    expect(
      screen.queryByLabelText('invitaliaModal.waitApproved.reasonLabel')
    ).not.toBeInTheDocument();
  });

  it('handles middle state reject approvation action', async () => {
    render(
      <ProductBulkActionDialog
        {...defaultProps}
        action={MIDDLE_STATES.REJECT_APPROVATION}
      />
    );

    fireEvent.change(
      screen.getByLabelText(
        'invitaliaModal.rejectApprovation.reasonLabel'
      ),
      { target: { value: 'reason' } }
    );

    fireEvent.click(
      screen.getByText(
        'invitaliaModal.rejectApprovation.buttonTextConfirm'
      )
    );

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledWith(
        MIDDLE_STATES.REJECT_APPROVATION,
        'reason'
      );
    });
  });
});
