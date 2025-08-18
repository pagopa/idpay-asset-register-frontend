import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProductModal from '../ProductModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'invitaliaModal.supervisioned.title': 'Supervisiona prodotti',
                'invitaliaModal.supervisioned.description': 'Descrizione supervisiona',
                'invitaliaModal.supervisioned.listTitle': 'Lista prodotti supervisiona',
                'invitaliaModal.supervisioned.reasonLabel': 'Motivo supervisiona',
                'invitaliaModal.supervisioned.reasonPlaceholder': 'Inserisci motivo supervisiona',
                'invitaliaModal.supervisioned.buttonText': 'Supervisiona',
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

jest.mock('../../../utils/constants', () => ({
    MAX_LENGTH_DETAILL_PR: 50,
}));

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
        organizationId: 'test-org-id',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // @ts-ignore
        mockTruncateString.mockImplementation((str: string, maxLength: number) =>
            str.length > maxLength ? str.substring(0, maxLength) + '...' : str
        );
    });

    describe('Basic Rendering', () => {
        it('should render dialog when open is true', () => {
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Supervisiona prodotti')).toBeInTheDocument();
        });

        it('should not render dialog when open is false', () => {
            render(<ProductModal status={''} {...defaultProps} open={false} actionType="supervisioned" />);

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('should render close button', () => {
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const closeButton = screen.getByLabelText('close');
            expect(closeButton).toBeInTheDocument();
        });

        it('should render character counter', () => {
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            expect(screen.getByText('0/200')).toBeInTheDocument();
        });
    });

    describe('ActionType: supervisioned', () => {
        it('should render supervisioned modal content', () => {
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            expect(screen.getByText('Supervisiona prodotti')).toBeInTheDocument();
            expect(screen.getByText('Descrizione supervisiona')).toBeInTheDocument();
            expect(screen.getByText('Lista prodotti supervisiona')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Supervisiona' })).toBeInTheDocument();
        });

        it('should have supervisioned button disabled when motivation is empty', () => {
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const supervisionedButton = screen.getByRole('button', { name: 'Supervisiona' });
            expect(supervisionedButton).toBeDisabled();
        });

        it('should enable supervisioned button when motivation is provided', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'Test motivation');

            const supervisionedButton = screen.getByRole('button', { name: 'Supervisiona' });
            expect(supervisionedButton).toBeEnabled();
        });

        it('should call setSupervisionedStatusList when supervisioned button is clicked', async () => {
            const user = userEvent.setup();
            // @ts-ignore
            mockSetSupervisionedStatusList.mockResolvedValue(undefined);

            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" onUpdateTable={mockOnUpdateTable} />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'Test motivation');

            const supervisionedButton = screen.getByRole('button', { name: 'Supervisiona' });
            await user.click(supervisionedButton);

            expect(mockSetSupervisionedStatusList).toHaveBeenCalledWith(
                ['1234567890123'],
                "",
                'Test motivation'
            );
            expect(mockOnClose).toHaveBeenCalled();
            expect(mockOnUpdateTable).toHaveBeenCalled();
        });

        it('should handle supervisioned API error', async () => {
            const user = userEvent.setup();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockSetSupervisionedStatusList.mockRejectedValue(new Error('API Error'));

            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'Test motivation');

            const supervisionedButton = screen.getByRole('button', { name: 'Supervisiona' });
            await user.click(supervisionedButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('API Error'));
                expect(mockOnClose).toHaveBeenCalled();
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('ActionType: rejected', () => {
        it('should render rejected modal content', () => {
            render(<ProductModal status={''} {...defaultProps} actionType="rejected" />);

            expect(screen.getByText('Rifiuta prodotti')).toBeInTheDocument();
            expect(screen.getByText('Descrizione rifiuta')).toBeInTheDocument();
            expect(screen.getByText('Lista prodotti rifiuta')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Rifiuta' })).toBeInTheDocument();
        });

        it('should have rejected button disabled when motivation is empty', () => {
            render(<ProductModal status={''} {...defaultProps} actionType="rejected" />);

            const rejectedButton = screen.getByRole('button', { name: 'Rifiuta' });
            expect(rejectedButton).toBeDisabled();
        });

        it('should enable rejected button when motivation is provided', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={''} {...defaultProps} actionType="rejected" />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'Test motivation');

            const rejectedButton = screen.getByRole('button', { name: 'Rifiuta' });
            expect(rejectedButton).toBeEnabled();
        });

        it('should call setRejectedStatusList when rejected button is clicked', async () => {
            const user = userEvent.setup();
            // @ts-ignore
            mockSetRejectedStatusList.mockResolvedValue(undefined);

            render(<ProductModal status={''} {...defaultProps} actionType="rejected" onUpdateTable={mockOnUpdateTable} />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'Test motivation');

            const rejectedButton = screen.getByRole('button', { name: 'Rifiuta' });
            await user.click(rejectedButton);

            expect(mockOnClose).toHaveBeenCalled();
            await waitFor(() => {
                expect(mockSetRejectedStatusList).toHaveBeenCalledWith(
                    ['1234567890123'],
                    "",
                    'Test motivation'
                );
                expect(mockOnUpdateTable).toHaveBeenCalled();
            });
        });

        it('should handle rejected API error', async () => {
            const user = userEvent.setup();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockSetRejectedStatusList.mockRejectedValue(new Error('API Error'));

            render(<ProductModal status={''} {...defaultProps} actionType="rejected" />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'Test motivation');

            const rejectedButton = screen.getByRole('button', { name: 'Rifiuta' });
            await user.click(rejectedButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('API Error'));
                expect(mockOnClose).toHaveBeenCalled();
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Unknown ActionType', () => {
        it('should render with empty config when actionType is unknown', () => {
            render(<ProductModal status={''} {...defaultProps} actionType="unknown" />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /supervisiona|rifiuta/i })).not.toBeInTheDocument();
        });

        it('should render with undefined actionType', () => {
            render(<ProductModal status={''} {...defaultProps} actionType={undefined} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /supervisiona|rifiuta/i })).not.toBeInTheDocument();
        });
    });

    describe('Product Display Logic', () => {
        it('should display selectedProducts when provided', () => {
            const selectedProducts = [
                { productName: 'Product 1', gtinCode: '111', category: 'Category 1' },
                { productName: 'Product 2', gtinCode: '222', category: 'Category 2' },
            ];

            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    selectedProducts={selectedProducts}
                />
            );

            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
        });

        it('should display category + GTIN when productName is empty in selectedProducts', () => {
            const selectedProducts = [
                { productName: '', gtinCode: '111', category: 'Category 1' },
                { productName: '   ', gtinCode: '222', category: 'Category 2' },
            ];

            render(
                <ProductModal
                    status={''} {...defaultProps}
                    actionType="supervisioned"
                    selectedProducts={selectedProducts}                />
            );

            expect(screen.getByText('Category 1 Codice GTIN/EAN 111')).toBeInTheDocument();
            expect(screen.getByText('Category 2 Codice GTIN/EAN 222')).toBeInTheDocument();
        });

        it('should display GTIN without category when both productName and category are empty', () => {
            const selectedProducts = [
                { productName: '', gtinCode: '111', category: '' },
                { productName: undefined, gtinCode: '222', category: undefined },
            ];

            render(
                <ProductModal
                    status={''} {...defaultProps}
                    actionType="supervisioned"
                    selectedProducts={selectedProducts}                />
            );

            expect(screen.getByText('Codice GTIN/EAN 111')).toBeInTheDocument();
            expect(screen.getByText('Codice GTIN/EAN 222')).toBeInTheDocument();
        });

        it('should truncate long product names in selectedProducts', () => {
            const selectedProducts = [
                { productName: 'Very long product name that should be truncated', gtinCode: '111' },
            ];

            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    selectedProducts={selectedProducts}
                />
            );

            expect(mockTruncateString).toHaveBeenCalledWith(
                'Very long product name that should be truncated',
                50
            );
        });

        it('should display productName when selectedProducts is not provided', () => {
            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    productName="Single Product"
                />
            );

            expect(screen.getByText('Single Product')).toBeInTheDocument();
        });

        it('should display GTIN codes when productName is empty and selectedProducts not provided', () => {
            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    productName=""
                    gtinCodes={['111', '222']}
                />
            );

            expect(screen.getByText('Codice GTIN/EAN 111, 222')).toBeInTheDocument();
        });

        it('should display GTIN codes when productName is whitespace only', () => {
            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    productName="   "
                    gtinCodes={['111', '222']}
                />
            );

            expect(screen.getByText('Codice GTIN/EAN 111, 222')).toBeInTheDocument();
        });

        it('should truncate long productName', () => {
            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    productName="Very long single product name that should be truncated"
                />
            );

            expect(mockTruncateString).toHaveBeenCalledWith(
                'Very long single product name that should be truncated',
                50
            );
        });

        it('should display empty selectedProducts array', () => {
            render(
                <ProductModal
                    status={''} {...defaultProps}
                    actionType="supervisioned"
                    selectedProducts={[]}
                    productName="Fallback Product"
                />
            );

            expect(screen.getByText('Fallback Product')).toBeInTheDocument();
        });
    });

    describe('TextField Interactions', () => {
        it('should update motivation state when typing', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'New motivation');

            expect(textField).toHaveValue('New motivation');
            expect(screen.getByText('14/200')).toBeInTheDocument();
        });

        it('should respect maxLength of 200 characters', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const textField = screen.getByRole('textbox');
            const longText = 'a'.repeat(250);

            await user.type(textField, longText);

            expect(textField.getAttribute('maxlength')).toBe('200');
        });

        it('should display correct character count', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, '12345');

            expect(screen.getByText('5/200')).toBeInTheDocument();
        });

        it('should clear motivation when modal reopens', () => {
            const { rerender } = render(<ProductModal status={''} {...defaultProps} open={false} actionType="supervisioned" />);

            rerender(<ProductModal status={''} {...defaultProps} open={true} actionType="supervisioned" />);

            const textField = screen.getByRole('textbox');
            expect(textField).toHaveValue('');
        });
    });

    describe('Close Button Interactions', () => {
        it('should call onClose when close button is clicked', async () => {
            const user = userEvent.setup();
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const closeButton = screen.getByLabelText('close');
            await user.click(closeButton);

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should call onUpdateTable when close button is clicked and onUpdateTable is provided', async () => {
            const user = userEvent.setup();
            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    onUpdateTable={mockOnUpdateTable}
                />
            );

            const closeButton = screen.getByLabelText('close');
            await user.click(closeButton);

            expect(mockOnClose).toHaveBeenCalled();
            expect(mockOnUpdateTable).toHaveBeenCalled();
        });

        it('should call onClose when dialog backdrop is clicked', async () => {
            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const dialog = screen.getByRole('dialog');
            fireEvent.click(dialog.parentElement!);

            expect(mockOnClose).toHaveBeenCalledTimes(0);
        });
    });

    describe('API Calls Without onUpdateTable', () => {
        it('should handle supervisioned API call without onUpdateTable', async () => {
            const user = userEvent.setup();
            // @ts-ignore
            mockSetSupervisionedStatusList.mockResolvedValue(undefined);

            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'Test motivation');

            const supervisionedButton = screen.getByRole('button', { name: 'Supervisiona' });
            await user.click(supervisionedButton);

            expect(mockSetSupervisionedStatusList).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should handle rejected API call without onUpdateTable', async () => {
            const user = userEvent.setup();
            // @ts-ignore
            mockSetRejectedStatusList.mockResolvedValue(undefined);

            render(<ProductModal status={''} {...defaultProps} actionType="rejected" />);

            const textField = screen.getByRole('textbox');
            await user.type(textField, 'Test motivation');

            const rejectedButton = screen.getByRole('button', { name: 'Rifiuta' });
            await user.click(rejectedButton);

            expect(mockOnClose).toHaveBeenCalled();
            await waitFor(() => {
                expect(mockSetRejectedStatusList).toHaveBeenCalled();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple GTIN codes', () => {
            render(
                <ProductModal
                    status={''} {...defaultProps}
                    actionType="supervisioned"
                    gtinCodes={['111', '222', '333']}
                    productName=""
                />
            );

            expect(screen.getByText('Codice GTIN/EAN 111, 222, 333')).toBeInTheDocument();
        });

        it('should handle single GTIN code in array', () => {
            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    gtinCodes={['111']}
                    productName=""
                />
            );

            expect(screen.getByText('Codice GTIN/EAN 111')).toBeInTheDocument();
        });

        it('should handle empty GTIN codes array', () => {
            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    gtinCodes={[]}
                    productName=""
                />
            );

            expect(screen.getByText('Supervisiona prodotti')).toBeInTheDocument();
        });

        it('should render without optional props', () => {
            const minimalProps = {
                open: true,
                onClose: mockOnClose,
                gtinCodes: ['123'],
                organizationId: 'org-id',
            };

            render(<ProductModal status={''} {...minimalProps} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle selectedProducts with mix of filled and empty productNames', () => {
            const selectedProducts = [
                { productName: 'Product 1', gtinCode: '111', category: 'Cat1' },
                { productName: '', gtinCode: '222', category: 'Cat2' },
                { productName: 'Product 3', gtinCode: '333' },
                { productName: '', gtinCode: '444' },
            ];

            render(
                <ProductModal
                    status={''}
                    {...defaultProps}
                    actionType="supervisioned"
                    selectedProducts={selectedProducts}
                />
            );

            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Cat2 Codice GTIN/EAN 222')).toBeInTheDocument();
            expect(screen.getByText('Product 3')).toBeInTheDocument();
            expect(screen.getByText('Codice GTIN/EAN 444')).toBeInTheDocument();
        });

        it('should handle form submission with different motivation lengths', async () => {
            const user = userEvent.setup();
            // @ts-ignore
            mockSetSupervisionedStatusList.mockResolvedValue(undefined);

            render(<ProductModal status={''} {...defaultProps} actionType="supervisioned" />);

            const textField = screen.getByRole('textbox');
            const supervisionedButton = screen.getByRole('button', { name: 'Supervisiona' });

            await user.type(textField, 'a');
            expect(supervisionedButton).toBeEnabled();

            await user.clear(textField);
            await user.type(textField, 'This is a longer motivation text');
            expect(supervisionedButton).toBeEnabled();
            expect(screen.getByText('Supervisiona prodotti')).toBeInTheDocument();
        });
    });
});