import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductStatusActionBar from '../ProductStatusActionBar';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../../utils/constants';
import { ProductDTO } from '../../../api/generated/register';

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (k: string) => k }),
}));

const buildProduct = (status: string, gtin: string): ProductDTO =>
  ({
    gtinCode: gtin,
    status,
    productName: 'Test',
    category: 'Cat',
  } as unknown as ProductDTO);

describe('ProductStatusActionBar – 100% coverage', () => {
  const renderBar = (props: Partial<React.ComponentProps<typeof ProductStatusActionBar>> = {}) => {
    const defaultProps = {
      tableData: [buildProduct(PRODUCTS_STATES.UPLOADED, '1')],
      selected: ['1'],
      isInvitaliaUser: true,
      isInvitaliaAdmin: false,
      hookLoading: false,
      handleOpenModalWithStatusCheck: jest.fn(),
    };

    return render(<ProductStatusActionBar {...defaultProps} {...props} />);
  };

  describe('render guards', () => {
    it('returns null when no tableData', () => {
      const { container } = renderBar({ tableData: [] });
      expect(container.firstChild).toBeNull();
    });

    it('returns null when loading', () => {
      const { container } = renderBar({ hookLoading: true });
      expect(container.firstChild).toBeNull();
    });

    it('returns null when no selection', () => {
      const { container } = renderBar({ selected: [] });
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Invitalia user – normal state (UPLOADED)', () => {
    it('renders all three buttons enabled', () => {
      renderBar();

      expect(screen.getByTestId('rejectedBtn')).toBeEnabled();
      expect(screen.getByTestId('waitApprovedBtn')).toBeEnabled();
      expect(screen.getByTestId('supervisedBtn')).toBeEnabled();
    });

    it('calls correct actions', () => {
      const handler = jest.fn();
      renderBar({ handleOpenModalWithStatusCheck: handler });

      fireEvent.click(screen.getByTestId('rejectedBtn'));
      fireEvent.click(screen.getByTestId('supervisedBtn'));
      fireEvent.click(screen.getByTestId('waitApprovedBtn'));

      expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.REJECTED);
      expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.SUPERVISED);
      expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.WAIT_APPROVED);
    });
  });

  describe('Invitalia user – disabled states', () => {
    it('disables buttons when status WAIT_APPROVED', () => {
      renderBar({
        tableData: [buildProduct(PRODUCTS_STATES.WAIT_APPROVED, '1')],
      });

      expect(screen.getByTestId('rejectedBtn')).toBeDisabled();
      expect(screen.getByTestId('waitApprovedBtn')).toBeDisabled();
    });

    it('disables buttons when status REJECTED', () => {
      renderBar({
        tableData: [buildProduct(PRODUCTS_STATES.REJECTED, '1')],
      });

      expect(screen.getByTestId('rejectedBtn')).toBeDisabled();
      expect(screen.getByTestId('waitApprovedBtn')).toBeDisabled();
    });

    it('disables buttons when status APPROVED', () => {
      renderBar({
        tableData: [buildProduct(PRODUCTS_STATES.APPROVED, '1')],
      });

      expect(screen.getByTestId('rejectedBtn')).toBeDisabled();
      expect(screen.getByTestId('waitApprovedBtn')).toBeDisabled();
    });

    it('does not render supervised button when already supervised', () => {
      renderBar({
        tableData: [buildProduct(PRODUCTS_STATES.SUPERVISED, '1')],
      });

      expect(screen.queryByTestId('supervisedBtn')).not.toBeInTheDocument();
    });
  });

  describe('Non Invitalia user', () => {
    it('does not render supervised button', () => {
      renderBar({ isInvitaliaUser: false });

      expect(screen.queryByTestId('supervisedBtn')).not.toBeInTheDocument();
    });

    it('uses middle states on click', () => {
      const handler = jest.fn();
      renderBar({
        isInvitaliaUser: false,
        handleOpenModalWithStatusCheck: handler,
      });

      fireEvent.click(screen.getByTestId('rejectedBtn'));
      fireEvent.click(screen.getByTestId('waitApprovedBtn'));

      expect(handler).toHaveBeenCalledWith(MIDDLE_STATES.REJECT_APPROVATION);
      expect(handler).toHaveBeenCalledWith(MIDDLE_STATES.ACCEPT_APPROVATION);
    });
  });

  describe('multiple selections – mixed statuses logic', () => {
    it('disables when one of selected is WAIT_APPROVED', () => {
      renderBar({
        tableData: [
          buildProduct(PRODUCTS_STATES.UPLOADED, '1'),
          buildProduct(PRODUCTS_STATES.WAIT_APPROVED, '2'),
        ],
        selected: ['1', '2'],
      });

      expect(screen.getByTestId('rejectedBtn')).toBeDisabled();
      expect(screen.getByTestId('waitApprovedBtn')).toBeDisabled();
    });

    it('keeps enabled if none are blocking states', () => {
      renderBar({
        tableData: [
          buildProduct(PRODUCTS_STATES.UPLOADED, '1'),
          buildProduct(PRODUCTS_STATES.UPLOADED, '2'),
        ],
        selected: ['1', '2'],
      });

      expect(screen.getByTestId('rejectedBtn')).toBeEnabled();
      expect(screen.getByTestId('waitApprovedBtn')).toBeEnabled();
      expect(screen.getByTestId('supervisedBtn')).toBeEnabled();
    });
  });
});
