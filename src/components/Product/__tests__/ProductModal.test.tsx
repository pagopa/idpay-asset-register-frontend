import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProductModal from '../ProductModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'invitaliaModal.supervised.title': 'Supervisiona prodotti',
                'invitaliaModal.supervised.description': 'Descrizione supervisiona',
                'invitaliaModal.supervised.listTitle': 'Lista prodotti supervisiona',
                'invitaliaModal.supervised.reasonLabel': 'Motivo supervisiona',
                'invitaliaModal.supervised.reasonPlaceholder': 'Inserisci motivo supervisiona',
                'invitaliaModal.supervised.buttonText': 'Supervisiona',
                'invitaliaModal.rejected.title': 'Rifiuta prodotti',
                'invitaliaModal.rejected.description': 'Descrizione rifiuta',
                'invitaliaModal.rejected.listTitle': 'Lista prodotti rifiuta',
                'invitaliaModal.rejected.reasonLabel': 'Motivo rifiuta',
                'invitaliaModal.rejected.reasonPlaceholder': 'Inserisci motivo rifiuta',
                'invitaliaModal.rejected.buttonText': 'Rifiuta',
            };
            return translations[key] || key;
        },
    }),
}));

jest.mock('../../../services/registerService', () => ({
    setSupervisionedStatusList: jest.fn(),
    setRejectedStatusList: jest.fn(),
}));

jest.mock('../../../utils/constants', () => {
    const actual = jest.requireActual('../../../utils/constants');
    return {
        ...actual,
        MAX_LENGTH_DETAILL_PR: 50,
    };
});


jest.mock('../../../helpers', () => ({
    truncateString: jest.fn((str: string, maxLength: number) =>
        str.length > maxLength ? str.substring(0, maxLength) + '...' : str
    ),
}));

import { setSupervisionedStatusList, setRejectedStatusList } from '../../../services/registerService';
import { truncateString } from '../../../helpers';

const mockSetSupervisionedStatusList = setSupervisionedStatusList as jest.MockedFunction<typeof setSupervisionedStatusList>;
const mockSetRejectedStatusList = setRejectedStatusList as jest.MockedFunction<typeof setRejectedStatusList>;
const mockTruncateString = truncateString as jest.MockedFunction<typeof truncateString>;

describe('ProductModal', () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateTable = jest.fn();

    const defaultProps = {
        open: true,
        onClose: mockOnClose,
        gtinCodes: ['1234567890123'],
    };

    const supervisedStatus = 'SUPERVISED' as unknown as any;
    const rejectedStatus = 'REJECTED' as unknown as any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockTruncateString.mockImplementation((str: string, maxLength: number) =>
            str.length > maxLength ? str.substring(0, maxLength) + '...' : str
        );
    });

    describe('Basic Rendering', () => {
        it('renders dialog when open is true', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Supervisiona prodotti')).toBeInTheDocument();
            expect(screen.getByText('0/200')).toBeInTheDocument();
            expect(screen.getByLabelText('close')).toBeInTheDocument();
        });

        it('does not render dialog when open is false', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} open={false} actionType="supervised" />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('ActionType: supervised', () => {
        it('renders supervised content', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            expect(screen.getByText('Supervisiona prodotti')).toBeInTheDocument();
            expect(screen.getByText('Descrizione supervisiona')).toBeInTheDocument();
            expect(screen.getByText('Lista prodotti supervisiona')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Supervisiona' })).toBeInTheDocument();
        });

        it('disables button when motivation is empty, enables when provided', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            const btn = screen.getByRole('button', { name: 'Supervisiona' });
            expect(btn).toBeDisabled();
            await user.type(screen.getByRole('textbox'), 'Motivo');
            expect(btn).toBeEnabled();
        });

        it('calls setSupervisionedStatusList with correct args and closes, then updates table', async () => {
            const user = userEvent.setup();
            mockSetSupervisionedStatusList.mockResolvedValue(undefined);
            render(
                <ProductModal
                    status={supervisedStatus}
                    {...defaultProps}
                    actionType="supervised"
                    onUpdateTable={mockOnUpdateTable}
                />
            );
            await user.type(screen.getByRole('textbox'), 'Test motivation');
            await user.click(screen.getByRole('button', { name: 'Supervisiona' }));
            expect(mockSetSupervisionedStatusList).toHaveBeenCalledWith(['1234567890123'], supervisedStatus, 'Test motivation');
            expect(mockOnClose).toHaveBeenCalled();
            expect(mockOnUpdateTable).toHaveBeenCalled();
        });

        it('handles API error (logs error and closes)', async () => {
            const user = userEvent.setup();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockSetSupervisionedStatusList.mockRejectedValue(new Error('API Error'));
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            await user.type(screen.getByRole('textbox'), 'Test motivation');
            await user.click(screen.getByRole('button', { name: 'Supervisiona' }));
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled();
                expect(mockOnClose).toHaveBeenCalled();
            });
            consoleErrorSpy.mockRestore();
        });
    });

    describe('ActionType: rejected', () => {
        it('renders rejected content', () => {
            render(<ProductModal status={rejectedStatus} {...defaultProps} actionType="rejected" />);
            expect(screen.getByText('Rifiuta prodotti')).toBeInTheDocument();
            expect(screen.getByText('Descrizione rifiuta')).toBeInTheDocument();
            expect(screen.getByText('Lista prodotti rifiuta')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Rifiuta' })).toBeInTheDocument();
        });

        it('disables button when motivation is empty, enables when provided', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={rejectedStatus} {...defaultProps} actionType="rejected" />);
            const btn = screen.getByRole('button', { name: 'Rifiuta' });
            expect(btn).toBeDisabled();
            await user.type(screen.getByRole('textbox'), 'Motivo');
            expect(btn).toBeEnabled();
        });

        it('calls setRejectedStatusList, closes first, then updates table', async () => {
            const user = userEvent.setup();
            mockSetRejectedStatusList.mockResolvedValue(undefined);
            render(
                <ProductModal
                    status={rejectedStatus}
                    {...defaultProps}
                    actionType="rejected"
                    onUpdateTable={mockOnUpdateTable}
                />
            );
            await user.type(screen.getByRole('textbox'), 'Motivo rifiuto');
            await user.click(screen.getByRole('button', { name: 'Rifiuta' }));
            expect(mockOnClose).toHaveBeenCalled();
            await waitFor(() => {
                expect(mockSetRejectedStatusList).toHaveBeenCalledWith(['1234567890123'], rejectedStatus, 'Motivo rifiuto');
                expect(mockOnUpdateTable).toHaveBeenCalled();
            });
        });

        it('handles API error (logs error and closes)', async () => {
            const user = userEvent.setup();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockSetRejectedStatusList.mockRejectedValue(new Error('API Error'));
            render(<ProductModal status={rejectedStatus} {...defaultProps} actionType="rejected" />);
            await user.type(screen.getByRole('textbox'), 'Motivo rifiuto');
            await user.click(screen.getByRole('button', { name: 'Rifiuta' }));
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled();
                expect(mockOnClose).toHaveBeenCalled();
            });
            consoleErrorSpy.mockRestore();
        });
    });

    describe('Unknown/undefined actionType', () => {
        it('renders without action buttons if actionType is unknown', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType={'unknown' as any} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Supervisiona|Rifiuta/i })).not.toBeInTheDocument();
        });

        it('renders without action buttons if actionType is undefined', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType={undefined} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Supervisiona|Rifiuta/i })).not.toBeInTheDocument();
        });
    });

    describe('Product display logic', () => {
        it('shows selectedProducts when provided', () => {
            const selectedProducts = [
                { productName: 'Product 1', gtinCode: '111', category: 'Cat 1' },
                { productName: 'Product 2', gtinCode: '222', category: 'Cat 2' },
            ];
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" selectedProducts={selectedProducts} />);
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
        });

        it('shows category + GTIN when productName is empty', () => {
            const selectedProducts = [
                { productName: '', gtinCode: '111', category: 'Category 1' },
                { productName: '   ', gtinCode: '222', category: 'Category 2' },
            ];
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" selectedProducts={selectedProducts} />);
            expect(screen.getByText('Category 1 Codice GTIN/EAN 111')).toBeInTheDocument();
            expect(screen.getByText('Category 2 Codice GTIN/EAN 222')).toBeInTheDocument();
        });

        it('shows just GTIN when both productName and category are empty', () => {
            const selectedProducts = [
                { productName: '', gtinCode: '111', category: '' },
                { productName: undefined, gtinCode: '222', category: undefined },
            ];
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" selectedProducts={selectedProducts} />);
            expect(screen.getByText('Codice GTIN/EAN 111')).toBeInTheDocument();
            expect(screen.getByText('Codice GTIN/EAN 222')).toBeInTheDocument();
        });

        it('truncates long product names in selectedProducts', () => {
            const selectedProducts = [{ productName: 'Very long product name that should be truncated', gtinCode: '111' }];
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" selectedProducts={selectedProducts} />);
            expect(mockTruncateString).toHaveBeenCalledWith('Very long product name that should be truncated', 50);
        });

        it('shows productName when selectedProducts not provided', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" productName="Single Product" />);
            expect(screen.getByText('Single Product')).toBeInTheDocument();
        });

        it('shows GTIN codes when productName is empty and no selectedProducts', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" productName="" gtinCodes={['111', '222']} />);
            expect(screen.getByText('Codice GTIN/EAN 111, 222')).toBeInTheDocument();
        });

        it('shows GTIN codes when productName is whitespace only', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" productName="   " gtinCodes={['111', '222']} />);
            expect(screen.getByText('Codice GTIN/EAN 111, 222')).toBeInTheDocument();
        });

        it('truncates long single productName', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" productName="Very long single product name that should be truncated" />);
            expect(mockTruncateString).toHaveBeenCalledWith('Very long single product name that should be truncated', 50);
        });

        it('handles empty selectedProducts array with productName fallback', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" selectedProducts={[]} productName="Fallback Product" />);
            expect(screen.getByText('Fallback Product')).toBeInTheDocument();
        });
    });

    describe('TextField interactions', () => {
        it('updates motivation and counter', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            const tf = screen.getByRole('textbox');
            await user.type(tf, 'New motivation');
            expect(tf).toHaveValue('New motivation');
            expect(screen.getByText('14/200')).toBeInTheDocument();
        });

        it('respects maxLength 200', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            const tf = screen.getByRole('textbox');
            const longText = 'a'.repeat(250);
            await user.type(tf, longText);
            expect(tf.getAttribute('maxlength')).toBe('200');
        });

        it('shows correct character count', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            const tf = screen.getByRole('textbox');
            await user.type(tf, '12345');
            expect(screen.getByText('5/200')).toBeInTheDocument();
        });

        it('clears motivation when modal reopens', () => {
            const { rerender } = render(<ProductModal status={supervisedStatus} {...defaultProps} open={false} actionType="supervised" />);
            rerender(<ProductModal status={supervisedStatus} {...defaultProps} open={true} actionType="supervised" />);
            expect(screen.getByRole('textbox')).toHaveValue('');
        });
    });

    describe('Close button', () => {
        it('calls onClose when close icon clicked', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            await user.click(screen.getByLabelText('close'));
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('calls onUpdateTable if provided when close icon clicked', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" onUpdateTable={mockOnUpdateTable} />);
            await user.click(screen.getByLabelText('close'));
            expect(mockOnClose).toHaveBeenCalled();
            expect(mockOnUpdateTable).toHaveBeenCalled();
        });
    });

    describe('API calls without onUpdateTable', () => {
        it('handles supervised call without onUpdateTable', async () => {
            const user = userEvent.setup();
            mockSetSupervisionedStatusList.mockResolvedValue(undefined);
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            await user.type(screen.getByRole('textbox'), 'Motivo');
            await user.click(screen.getByRole('button', { name: 'Supervisiona' }));
            expect(mockSetSupervisionedStatusList).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('handles rejected call without onUpdateTable', async () => {
            const user = userEvent.setup();
            mockSetRejectedStatusList.mockResolvedValue(undefined);
            render(<ProductModal status={rejectedStatus} {...defaultProps} actionType="rejected" />);
            await user.type(screen.getByRole('textbox'), 'Motivo');
            await user.click(screen.getByRole('button', { name: 'Rifiuta' }));
            expect(mockOnClose).toHaveBeenCalled();
            await waitFor(() => expect(mockSetRejectedStatusList).toHaveBeenCalled());
        });
    });

    describe('Edge cases', () => {
        it('handles multiple GTIN codes', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" gtinCodes={['111', '222', '333']} productName="" />);
            expect(screen.getByText('Codice GTIN/EAN 111, 222, 333')).toBeInTheDocument();
        });

        it('handles single GTIN in array', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" gtinCodes={['111']} productName="" />);
            expect(screen.getByText('Codice GTIN/EAN 111')).toBeInTheDocument();
        });

        it('handles empty GTIN array', () => {
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" gtinCodes={[]} productName="" />);
            expect(screen.getByText('Supervisiona prodotti')).toBeInTheDocument();
        });

        it('renders with minimal required props', () => {
            const minimalProps = { open: true, onClose: mockOnClose, gtinCodes: ['123'] };
            render(<ProductModal status={supervisedStatus} {...minimalProps} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('handles mixed selectedProducts cases', () => {
            const selectedProducts = [
                { productName: 'Product 1', gtinCode: '111', category: 'Cat1' },
                { productName: '', gtinCode: '222', category: 'Cat2' },
                { productName: 'Product 3', gtinCode: '333' },
                { productName: '', gtinCode: '444' },
            ];
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" selectedProducts={selectedProducts} />);
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Cat2 Codice GTIN/EAN 222')).toBeInTheDocument();
            expect(screen.getByText('Product 3')).toBeInTheDocument();
            expect(screen.getByText('Codice GTIN/EAN 444')).toBeInTheDocument();
        });

        it('submits with different motivation lengths', async () => {
            const user = userEvent.setup();
            mockSetSupervisionedStatusList.mockResolvedValue(undefined);
            render(<ProductModal status={supervisedStatus} {...defaultProps} actionType="supervised" />);
            const tf = screen.getByRole('textbox');
            const btn = screen.getByRole('button', { name: 'Supervisiona' });
            await user.type(tf, 'a');
            expect(btn).toBeEnabled();
            await user.clear(tf);
            await user.type(tf, 'This is a longer motivation text');
            expect(btn).toBeEnabled();
            expect(screen.getByText('Supervisiona prodotti')).toBeInTheDocument();
        });
    });
});
