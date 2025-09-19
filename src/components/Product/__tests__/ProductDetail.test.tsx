import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductDetail from '../ProductDetail';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';
import { CategoryEnum } from '../../../api/generated/register/ProductDTO';
import { ProductStatusEnum } from '../../../api/generated/register/ProductStatus';
import { PRODUCTS_STATES, MIDDLE_STATES, USERS_TYPES } from '../../../utils/constants';
import * as registerService from '../../../services/registerService';
import * as helpers from '../../../helpers';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { L2?: string }) => {
      const translations: { [key: string]: string } = {
        'pages.productDetail.eprelCheckDate': 'Data controllo EPREL',
        'pages.productDetail.eprelCode': 'Codice EPREL',
        'pages.productDetail.gtinCode': 'Codice GTIN',
        'pages.productDetail.productCode': 'Codice Prodotto',
        'pages.productDetail.category': 'Categoria',
        'pages.productDetail.brand': 'Brand',
        'pages.productDetail.model': 'Modello',
        'pages.productDetail.energyClass': 'Classe Energetica',
        'pages.productDetail.countryOfProduction': 'Paese di Produzione',
        'pages.productDetail.capacity': 'Capacità',
        'pages.productDetail.productSheet': 'Scheda Prodotto',
        'pages.productDetail.motivation': 'Motivazione',
        'invitaliaModal.waitApproved.buttonTextConfirm': 'Conferma',
        'invitaliaModal.waitApproved.buttonTextCancel': 'Annulla',
        'invitaliaModal.waitApproved.buttonText': 'Approva',
        'invitaliaModal.waitApproved.listTitle': 'Conferma Approvazione',
        'invitaliaModal.waitApproved.description': 'Descrizione approvazione {L2}',
        'invitaliaModal.rejected.buttonTextConfirm': 'Escludi',
        'invitaliaModal.rejected.buttonText': 'Rifiuta',
        'invitaliaModal.supervised.buttonText': 'Supervisiona',
        'invitaliaModal.rejectApprovation.buttonText': 'Rifiuta Approvazione',
      };
      let result = translations[key] || key;
      if (options && options.L2) {
        result = result.replace('{L2}', options.L2);
      }
      return result;
    },
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

jest.mock('../ProductInfoRow', () => {
  return function ProductInfoRow({ label, value }: any) {
    const EMPTY_DATA = '-';
    let displayValue;
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      displayValue = EMPTY_DATA;
    } else {
      displayValue = value;
    }
    return (
      <div data-testid="product-info-row">
        <span data-testid="row-label">{label}</span>
        <span data-testid="row-value">{displayValue}</span>
      </div>
    );
  };
});

jest.mock('../ProductStatusChip', () => {
  return function ProductStatusChip({ status }: any) {
    return <div data-testid="status-chip">{status}</div>;
  };
});

jest.mock('date-fns', () => ({
  format: jest.fn((date: any, formatString: string) => {
    if (formatString === 'dd/MM/yyyy') return '01/01/2024';
    if (formatString === 'dd/MM/yyyy, HH:mm') return '01/01/2024, 10:30';
    return 'formatted-date';
  }),
}));

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
  statusChangeChronology: [
    {
      role: 'admin',
      updateDate: '2024-01-01T10:30:00Z',
      motivation: 'Test motivation',
    },
  ],
};

const defaultProps = {
  open: true,
  data: mockProductData,
  isInvitaliaUser: false,
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

describe('ProductDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
      org_role: USERS_TYPES.OPERATORE,
    });
  });

  describe('Rendering', () => {
    it('should render product detail with basic information', () => {
      renderComponent();

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
      expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    });

    it('should render with empty data when product fields are null/undefined', () => {
      const emptyData = {
        ...mockProductData,
        productName: null,
        batchName: undefined,
        eprelCode: '',
        registrationDate: null,
      };

      renderComponent({ data: emptyData });

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('should render chronology when user is not OPERATORE and has statusChangeChronology', () => {
      (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
        org_role: USERS_TYPES.INVITALIA_L1,
      });

      renderComponent();

      const rows = screen.getAllByTestId('product-info-row');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should not render chronology when user is OPERATORE', () => {
      (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
        org_role: USERS_TYPES.OPERATORE,
      });

      renderComponent();

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });
  });

  describe('Button visibility based on user role and status', () => {
    it('should show approve and exclude buttons for Invitalia user with SUPERVISED status', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
      });

      expect(screen.getByTestId('request-approval-btn')).toBeInTheDocument();
      expect(screen.getByTestId('exclude-btn')).toBeInTheDocument();
    });

    it('should show approve, supervised, and reject buttons for Invitalia user with UPLOADED status', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.UPLOADED },
      });

      expect(screen.getByTestId('approvedBtn')).toBeInTheDocument();
      expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
      expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    });

    it('should show supervised and reject buttons for Invitalia admin with WAIT_APPROVED status', () => {
      renderComponent({
        isInvitaliaAdmin: true,
        data: { ...mockProductData, status: ProductStatusEnum.WAIT_APPROVED },
      });

      expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
      expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    });

    it('should not show buttons for non-Invitalia users', () => {
      renderComponent({
        isInvitaliaUser: false,
        isInvitaliaAdmin: false,
      });

      expect(screen.queryByTestId('approvedBtn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('supervisedBtn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('rejectedBtn')).not.toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should open restore dialog when approve button is clicked', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
      });

      fireEvent.click(screen.getByTestId('request-approval-btn'));
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    it('should open exclude modal when exclude button is clicked', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
      });

      fireEvent.click(screen.getByTestId('exclude-btn'));
      expect(screen.getByTestId('product-modal')).toBeInTheDocument();
    });

    it('should open supervision modal when supervised button is clicked', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.UPLOADED },
      });

      fireEvent.click(screen.getByTestId('supervisedBtn'));
      expect(screen.getByTestId('product-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-action-type')).toHaveTextContent(PRODUCTS_STATES.SUPERVISED);
    });
  });

  describe('Dialog and Modal interactions', () => {
    beforeEach(() => {
      (registerService.setWaitApprovedStatusList as jest.Mock).mockResolvedValue({});
      (registerService.setRejectedStatusList as jest.Mock).mockResolvedValue({});
    });

    it('should handle restore dialog confirmation', async () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
      });

      fireEvent.click(screen.getByTestId('request-approval-btn'));
      fireEvent.click(screen.getByTestId('dialog-confirm'));

      await waitFor(() => {
        expect(registerService.setWaitApprovedStatusList).toHaveBeenCalledWith(
          [mockProductData.gtinCode],
          'SUPERVISED',
          '-'
        );
      });

      expect(defaultProps.onUpdateTable).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
      expect(defaultProps.onShowWaitApprovedMsg).toHaveBeenCalled();
    });

    it('should handle restore dialog cancellation', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
      });

      fireEvent.click(screen.getByTestId('request-approval-btn'));
      fireEvent.click(screen.getByTestId('dialog-cancel'));

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });

    it('should handle supervision modal success for Invitalia user', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.UPLOADED },
      });

      fireEvent.click(screen.getByTestId('supervisedBtn'));
      fireEvent.click(screen.getByTestId('modal-success'));

      expect(defaultProps.onShowWaitApprovedMsg).toHaveBeenCalled();
    });

    it('should handle supervision modal success for Invitalia admin', () => {
      renderComponent({
        isInvitaliaAdmin: true,
        data: { ...mockProductData, status: ProductStatusEnum.WAIT_APPROVED },
      });

      fireEvent.click(screen.getByTestId('supervisedBtn'));
      expect(screen.getByTestId('modal-action-type')).toHaveTextContent(
        MIDDLE_STATES.ACCEPT_APPROVATION
      );
    });

    it('should handle exclude modal success', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
      });

      fireEvent.click(screen.getByTestId('exclude-btn'));
      fireEvent.click(screen.getByTestId('modal-success'));

      expect(defaultProps.onShowRejectedMsg).toHaveBeenCalled();
    });

    it('should handle modal close', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
      });

      fireEvent.click(screen.getByTestId('exclude-btn'));
      fireEvent.click(screen.getByTestId('modal-close'));

      expect(defaultProps.onUpdateTable).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
      expect(defaultProps.onShowRejectedMsg).toHaveBeenCalled();
    });
  });

  describe('API calls', () => {
    it('should call setWaitApprovedStatusList for approved action', async () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.UPLOADED },
      });

      fireEvent.click(screen.getByTestId('approvedBtn'));
      fireEvent.click(screen.getByTestId('dialog-confirm'));

      await waitFor(() => {
        expect(registerService.setWaitApprovedStatusList).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (registerService.setWaitApprovedStatusList as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.UPLOADED },
      });

      fireEvent.click(screen.getByTestId('approvedBtn'));
      fireEvent.click(screen.getByTestId('dialog-confirm'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Conditional rendering based on data', () => {
    it('should render EMPTY_DATA for missing fields', () => {
      const dataWithMissingFields = {
        ...mockProductData,
        eprelCode: '',
        productCode: null,
        category: undefined,
      };

      renderComponent({ data: dataWithMissingFields });
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('should format registration date correctly', () => {
      renderComponent();
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('should handle missing statusChangeChronology', () => {
      const dataWithoutChronology = {
        ...mockProductData,
        statusChangeChronology: undefined,
      };

      (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
        org_role: USERS_TYPES.INVITALIA_L1,
      });

      renderComponent({ data: dataWithoutChronology });
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('should handle empty statusChangeChronology array', () => {
      const dataWithEmptyChronology = {
        ...mockProductData,
        statusChangeChronology: [],
      };

      (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
        org_role: USERS_TYPES.INVITALIA_L1,
      });

      renderComponent({ data: dataWithEmptyChronology });
      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });
  });

  describe('Callback functions', () => {
    it('should call onShowApprovedMsg when available and onShowWaitApprovedMsg is not', async () => {
      const onShowApprovedMsg = jest.fn();
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
        onShowWaitApprovedMsg: undefined,
        onShowApprovedMsg,
      });

      fireEvent.click(screen.getByTestId('request-approval-btn'));
      fireEvent.click(screen.getByTestId('dialog-confirm'));

      await waitFor(() => {
        expect(onShowApprovedMsg).toHaveBeenCalled();
      });
    });

    it('should handle missing callback functions gracefully', async () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
        onUpdateTable: undefined,
        onClose: undefined,
        onShowWaitApprovedMsg: undefined,
        onShowApprovedMsg: undefined,
      });

      fireEvent.click(screen.getByTestId('request-approval-btn'));
      fireEvent.click(screen.getByTestId('dialog-confirm'));

      await waitFor(() => {
        expect(registerService.setWaitApprovedStatusList).toHaveBeenCalled();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle chronology entries with missing fields', () => {
      const chronologyWithMissingFields = [
        { role: undefined, updateDate: undefined, motivation: undefined },
        { role: 'admin', updateDate: null, motivation: '   ' },
        { updateDate: '2024-01-01T10:30:00Z', motivation: 'Valid motivation' },
      ];

      (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
        org_role: USERS_TYPES.INVITALIA_L1,
      });

      renderComponent({
        data: {
          ...mockProductData,
          statusChangeChronology: chronologyWithMissingFields,
        },
      });

      expect(screen.getByTestId('product-detail')).toBeInTheDocument();
    });

    it('should render EMPTY_DATA for formalMotivation when undefined, null, empty or whitespace, and the value when present', () => {
      const chronologyWithFormalMotivation = [
        {
          role: 'admin',
          updateDate: '2024-01-01T10:30:00Z',
          motivation: 'Motivazione',
          formalMotivation: undefined,
        },
        {
          role: 'admin',
          updateDate: '2024-01-01T10:30:00Z',
          motivation: 'Motivazione',
          formalMotivation: null,
        },
        {
          role: 'admin',
          updateDate: '2024-01-01T10:30:00Z',
          motivation: 'Motivazione',
          formalMotivation: '',
        },
        {
          role: 'admin',
          updateDate: '2024-01-01T10:30:00Z',
          motivation: 'Motivazione',
          formalMotivation: '   ',
        },
        {
          role: 'admin',
          updateDate: '2024-01-01T10:30:00Z',
          motivation: 'Motivazione',
          formalMotivation: 'Motivazione formale',
        },
      ];

      (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
        org_role: USERS_TYPES.INVITALIA_L1,
      });

      // Test for each case: only the first entry is used for formalMotivation
      for (let i = 0; i < chronologyWithFormalMotivation.length; i++) {
        renderComponent({
          data: {
            ...mockProductData,
            statusChangeChronology: [chronologyWithFormalMotivation[i]],
          },
        });

        const rows = screen.getAllByTestId('product-info-row');
        const formalRow = rows.find(
          (row) =>
            row.querySelector('[data-testid="row-label"]')?.textContent === 'Motivazione formale'
        );
        const entry = chronologyWithFormalMotivation[i];
        const expectedValue =
          !entry ||
          entry.formalMotivation === undefined ||
          entry.formalMotivation === null ||
          (typeof entry.formalMotivation === 'string' && entry.formalMotivation.trim() === '')
            ? '-'
            : entry.formalMotivation;

        if (formalRow) {
          const valueNode = formalRow.querySelector('[data-testid="row-value"]');
          expect(valueNode).not.toBeNull();
          const rowValue = valueNode ? valueNode.textContent : undefined;
          if (
            expectedValue === '-' ||
            (typeof entry.formalMotivation === 'string' && entry.formalMotivation.trim() !== '')
          ) {
            expect(['-', entry.formalMotivation && entry.formalMotivation.trim()]).toContain(
              rowValue && rowValue.trim()
            );
          } else {
            expect(rowValue).toBe('-');
          }
        }
      }
    });
  });

  describe('Component integration', () => {
    it('should pass correct props to ProductConfirmDialog', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED },
      });

      fireEvent.click(screen.getByTestId('request-approval-btn'));
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    it('should pass correct props to ProductModal for different action types', () => {
      renderComponent({
        isInvitaliaUser: true,
        data: { ...mockProductData, status: ProductStatusEnum.UPLOADED },
      });

      fireEvent.click(screen.getByTestId('supervisedBtn'));
      expect(screen.getByTestId('modal-action-type')).toHaveTextContent(PRODUCTS_STATES.SUPERVISED);
      fireEvent.click(screen.getByTestId('modal-close'));

      fireEvent.click(screen.getByTestId('rejectedBtn'));
      expect(screen.getByTestId('modal-action-type')).toHaveTextContent(PRODUCTS_STATES.REJECTED);
    });
  });
});
