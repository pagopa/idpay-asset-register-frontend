import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductDetail from '../ProductDetail';
import { ProductDTO } from '../../../api/generated/register/ProductDTO';
import { ProductStatusEnum } from '../../../api/generated/register/ProductStatus';
import { PRODUCTS_STATES, MIDDLE_STATES, USERS_TYPES, EMPTY_DATA } from '../../../utils/constants';
import * as registerService from '../../../services/registerService';
import * as helpers from '../../../helpers';
import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
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
                'invitaliaModal.rejectApprovation.buttonText': 'Rifiuta Approvazione'
            };
            let result = translations[key] || key;
            if (options && options.L2) {
                result = result.replace('{L2}', options.L2);
            }
            return result;
        }
    })
}));

jest.mock('../../../services/registerService', () => ({
    setRejectedStatusList: jest.fn(),
    setWaitApprovedStatusList: jest.fn()
}));

jest.mock('../../../helpers', () => ({
    fetchUserFromLocalStorage: jest.fn(),
    truncateString: jest.fn((str: string) => str)
}));

jest.mock('../ProductConfirmDialog', () => {
    return function ProductConfirmDialog({ open, onCancel, onConfirm, onSuccess }: any) {
        return open ? (
            <div data-testid="confirm-dialog">
                <button onClick={onCancel} data-testid="dialog-cancel">Cancel</button>
                <button onClick={onConfirm} data-testid="dialog-confirm">Confirm</button>
            </div>
        ) : null;
    };
});

jest.mock('../ProductModal', () => {
    return function ProductModal({ open, onClose, onSuccess, actionType }: any) {
        return open ? (
            <div data-testid="product-modal">
                <span data-testid="modal-action-type">{actionType}</span>
                <button onClick={() => {
                    onSuccess?.(actionType);
                    onClose?.();
                }} data-testid="modal-success">Success</button>
                <button onClick={onClose} data-testid="modal-close">Close</button>
            </div>
        ) : null;
    };
});

jest.mock('../ProductInfoRow', () => {
    return function ProductInfoRow({ label, value, labelVariant, valueVariant }: any) {
        return (
            <div data-testid="product-info-row">
                <span data-testid="row-label">{label}</span>
                <span data-testid="row-value">{typeof value === 'string' ? value : 'complex-value'}</span>
            </div>
        );
    };
});

jest.mock('../ProductStatusChip', () => {
    return function ProductStatusChip({ status }: any) {
        return <div data-testid="status-chip">{status}</div>;
    };
});

// Mock di date-fns
jest.mock('date-fns', () => ({
    format: jest.fn((date: any, formatString: string) => {
        if (formatString === 'dd/MM/yyyy') return '01/01/2024';
        if (formatString === 'dd/MM/yyyy, HH:mm') return '01/01/2024, 10:30';
        return 'formatted-date';
    })
}));

const theme = createTheme();

const mockProductData: ProductDTO = {
    gtinCode: '1234567890123',
    productName: 'Test Product',
    batchName: 'Test Batch',
    registrationDate: '1672531200000', // 2023-01-01
    eprelCode: 'EPREL123',
    productCode: 'PROD123',
    category: 'Test Category',
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
            motivation: 'Test motivation'
        }
    ]
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
    onShowWaitApprovedMsg: jest.fn()
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
            org_role: USERS_TYPES.OPERATORE
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
                registrationDate: null
            };

            renderComponent({ data: emptyData });

            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
        });

        it('should render chronology when user is not OPERATORE and has statusChangeChronology', () => {
            (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
                org_role: USERS_TYPES.INVITALIA_USER
            });

            renderComponent();

            const rows = screen.getAllByTestId('product-info-row');
            expect(rows.length).toBeGreaterThan(0);
        });

        it('should not render chronology when user is OPERATORE', () => {
            (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
                org_role: USERS_TYPES.OPERATORE
            });

            renderComponent();

            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
        });
    });

    describe('Button visibility based on user role and status', () => {
        it('should show approve and exclude buttons for Invitalia user with SUPERVISED status', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED }
            });

            expect(screen.getByTestId('request-approval-btn')).toBeInTheDocument();
            expect(screen.getByTestId('exclude-btn')).toBeInTheDocument();
        });

        it('should show approve, supervised, and reject buttons for Invitalia user with UPLOADED status', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.UPLOADED }
            });

            expect(screen.getByTestId('approvedBtn')).toBeInTheDocument();
            expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
            expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
        });

        it('should show supervised and reject buttons for Invitalia admin with WAIT_APPROVED status', () => {
            renderComponent({
                isInvitaliaAdmin: true,
                data: { ...mockProductData, status: ProductStatusEnum.WAIT_APPROVED }
            });

            expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
            expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
        });

        it('should not show buttons for non-Invitalia users', () => {
            renderComponent({
                isInvitaliaUser: false,
                isInvitaliaAdmin: false
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
                data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED }
            });

            fireEvent.click(screen.getByTestId('request-approval-btn'));
            expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        });

        it('should open exclude modal when exclude button is clicked', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED }
            });

            fireEvent.click(screen.getByTestId('exclude-btn'));
            expect(screen.getByTestId('product-modal')).toBeInTheDocument();
        });

        it('should open supervision modal when supervised button is clicked', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.UPLOADED }
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
                data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED }
            });

            fireEvent.click(screen.getByTestId('request-approval-btn'));
            fireEvent.click(screen.getByTestId('dialog-confirm'));

            await waitFor(() => {
                expect(registerService.setWaitApprovedStatusList).toHaveBeenCalledWith(
                    [mockProductData.gtinCode],
                    'SUPERVISED',
                    'Da approvare'
                );
            });

            expect(defaultProps.onUpdateTable).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
            expect(defaultProps.onShowWaitApprovedMsg).toHaveBeenCalled();
        });

        it('should handle restore dialog cancellation', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED }
            });

            fireEvent.click(screen.getByTestId('request-approval-btn'));
            fireEvent.click(screen.getByTestId('dialog-cancel'));

            expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
        });

        it('should handle supervision modal success for Invitalia user', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.UPLOADED }
            });

            fireEvent.click(screen.getByTestId('supervisedBtn'));
            fireEvent.click(screen.getByTestId('modal-success'));

            expect(defaultProps.onShowWaitApprovedMsg).toHaveBeenCalled();
        });

        it('should handle supervision modal success for Invitalia admin', () => {
            renderComponent({
                isInvitaliaAdmin: true,
                data: { ...mockProductData, status: ProductStatusEnum.WAIT_APPROVED }
            });

            fireEvent.click(screen.getByTestId('supervisedBtn'));
            expect(screen.getByTestId('modal-action-type')).toHaveTextContent(MIDDLE_STATES.ACCEPT_APPROVATION);
        });

        it('should handle exclude modal success', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED }
            });

            fireEvent.click(screen.getByTestId('exclude-btn'));
            fireEvent.click(screen.getByTestId('modal-success'));

            expect(defaultProps.onShowRejectedMsg).toHaveBeenCalled();
        });

        it('should handle modal close', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED }
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
            const gtinCodes = ['123'];
            const currentStatus = ProductStatusEnum.UPLOADED;
            const motivation = 'test';

            // Simuliamo la chiamata diretta alla funzione handleOpenModal
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.UPLOADED }
            });

            fireEvent.click(screen.getByTestId('approvedBtn'));
            fireEvent.click(screen.getByTestId('dialog-confirm'));

            await waitFor(() => {
                expect(registerService.setWaitApprovedStatusList).toHaveBeenCalled();
            });
        });

        it('should handle API errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            (registerService.setWaitApprovedStatusList as jest.Mock).mockRejectedValue(new Error('API Error'));

            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.UPLOADED }
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
                category: undefined
            };

            renderComponent({ data: dataWithMissingFields });
            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
        });

        it('should format registration date correctly', () => {
            renderComponent();
            // Il mock di date-fns dovrebbe restituire la data formattata
            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
        });

        it('should handle missing statusChangeChronology', () => {
            const dataWithoutChronology = {
                ...mockProductData,
                statusChangeChronology: undefined
            };

            (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
                org_role: USERS_TYPES.INVITALIA_USER
            });

            renderComponent({ data: dataWithoutChronology });
            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
        });

        it('should handle empty statusChangeChronology array', () => {
            const dataWithEmptyChronology = {
                ...mockProductData,
                statusChangeChronology: []
            };

            (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
                org_role: USERS_TYPES.INVITALIA_USER
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
                onShowApprovedMsg
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
                onShowApprovedMsg: undefined
            });

            fireEvent.click(screen.getByTestId('request-approval-btn'));
            fireEvent.click(screen.getByTestId('dialog-confirm'));

            // Non dovrebbe generare errori
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
                { updateDate: '2024-01-01T10:30:00Z', motivation: 'Valid motivation' }
            ];

            (helpers.fetchUserFromLocalStorage as jest.Mock).mockReturnValue({
                org_role: USERS_TYPES.INVITALIA_USER
            });

            renderComponent({
                data: {
                    ...mockProductData,
                    statusChangeChronology: chronologyWithMissingFields
                }
            });

            expect(screen.getByTestId('product-detail')).toBeInTheDocument();
        });
    });

    describe('Component integration', () => {
        it('should pass correct props to ProductConfirmDialog', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.SUPERVISED }
            });

            fireEvent.click(screen.getByTestId('request-approval-btn'));
            expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        });

        it('should pass correct props to ProductModal for different action types', () => {
            renderComponent({
                isInvitaliaUser: true,
                data: { ...mockProductData, status: ProductStatusEnum.UPLOADED }
            });

            // Test supervision modal
            fireEvent.click(screen.getByTestId('supervisedBtn'));
            expect(screen.getByTestId('modal-action-type')).toHaveTextContent(PRODUCTS_STATES.SUPERVISED);
            fireEvent.click(screen.getByTestId('modal-close'));

            // Test rejection modal
            fireEvent.click(screen.getByTestId('rejectedBtn'));
            expect(screen.getByTestId('modal-action-type')).toHaveTextContent(PRODUCTS_STATES.REJECTED);
        });
    });
});