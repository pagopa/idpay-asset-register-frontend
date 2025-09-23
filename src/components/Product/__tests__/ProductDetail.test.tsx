import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductDetail from '../ProductDetail';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';
import { ProductStatusEnum } from '../../../api/generated/register/ProductStatus';
import { CategoryEnum } from '../../../api/generated/register/ProductDTO';
import { PRODUCTS_STATES, USERS_TYPES } from '../../../utils/constants';
import * as registerService from '../../../services/registerService';
import * as helpers from '../../../helpers';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../services/registerService', () => ({
  setRejectedStatusList: jest.fn(),
  setWaitApprovedStatusList: jest.fn(),
}));

jest.mock('../../../helpers', () => ({
  fetchUserFromLocalStorage: jest.fn(),
  truncateString: jest.fn((str: string) => str),
}));

jest.mock('../ProductConfirmDialog', () => {
  return function ProductConfirmDialog({ open, onCancel, onConfirm }: any) {
    return open ? (
      <div data-testid="confirm-dialog">
        <button onClick={onCancel} data-testid="dialog-cancel">
          Cancel
        </button>
        <button onClick={onConfirm} data-testid="dialog-confirm">
          Confirm
        </button>
      </div>
    ) : null;
  };
});

jest.mock('../ProductModal', () => {
  return function ProductModal({ open, onClose, onSuccess, actionType }: any) {
    return open ? (
      <div data-testid="product-modal">
        <span data-testid="modal-action-type">{actionType}</span>
        <button
          onClick={() => {
            onSuccess?.(actionType);
            onClose?.();
          }}
          data-testid="modal-success"
        >
          Success
        </button>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
      </div>
    ) : null;
  };
});

const theme = createTheme();

const mockProductData: ProductDTO = {
  gtinCode: '1234567890123',
  productName: 'Test Product',
  batchName: 'Test Batch',
  registrationDate: new Date(1672531200000),
  eprelCode: 'EPREL123',
  productCode: 'PROD123',
  category: CategoryEnum.Lavatrice,
  brand: 'Test Brand',
  model: 'Test Model',
  energyClass: 'A++',
  countryOfProduction: 'Italy',
  capacity: '100L',
  status: ProductStatusEnum.UPLOADED,
  statusChangeChronology: [],
};

const defaultProps = {
  open: true,
  data: mockProductData,
  isInvitaliaUser: true,
  isInvitaliaAdmin: false,
  onUpdateTable: jest.fn(),
  onClose: jest.fn(),
  onShowApprovedMsg: jest.fn(),
  onShowRejectedMsg: jest.fn(),
  onShowWaitApprovedMsg: jest.fn(),
};

const renderComponent = (props = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(
    <ThemeProvider theme={theme}>
      <ProductDetail {...combinedProps} />
    </ThemeProvider>
  );
};

describe('ProductDetail msgResult logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_role: USERS_TYPES.INVITALIA_L1,
    });
  });

  it('should call onShowWaitApprovedMsg only after confirming the approve dialog', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('approvedBtn'));
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-confirm'));

    await waitFor(() => {
      expect(defaultProps.onShowWaitApprovedMsg).toHaveBeenCalledTimes(1);
    });
  });

  it('should NOT call onShowRejectedMsg if exclude modal is cancelled', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-close'));

    expect(defaultProps.onShowRejectedMsg).not.toHaveBeenCalled();
  });

  it('should call onShowRejectedMsg only after confirming the exclude modal', async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    expect(screen.getByTestId('product-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('modal-success'));

    await waitFor(() => {
      expect(defaultProps.onShowRejectedMsg).toHaveBeenCalledTimes(1);
    });
  });
});
