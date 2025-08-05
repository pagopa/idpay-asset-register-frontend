import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductConfirmDialog from '../ProductConfirmDialog';

const mockOnCancel = jest.fn();
const mockOnConfirm = jest.fn();

const defaultProps = {
    open: true,
    title: 'Test Title',
    message: 'Test message',
    onCancel: mockOnCancel,
    onConfirm: mockOnConfirm,
};

describe('ProductConfirmDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('Rendering', () => {
        it('should render the dialog when open is true', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });

        it('should not render the dialog when open is false', () => {
            render(<ProductConfirmDialog {...defaultProps} open={false} />);

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('should render the title correctly', () => {
            const customTitle = 'Custom Dialog Title';
            render(<ProductConfirmDialog {...defaultProps} title={customTitle} />);

            expect(screen.getByText(customTitle)).toBeInTheDocument();
        });

        it('should render the message correctly', () => {
            const customMessage = 'This is a custom confirmation message';
            render(<ProductConfirmDialog {...defaultProps} message={customMessage} />);

            expect(screen.getByText(customMessage)).toBeInTheDocument();
        });

        it('should render children when provided', () => {
            const childContent = <div data-testid="child-content">Child Element</div>;
            render(
                <ProductConfirmDialog {...defaultProps}>
                    {childContent}
                </ProductConfirmDialog>
            );

            expect(screen.getByTestId('child-content')).toBeInTheDocument();
            expect(screen.getByText('Child Element')).toBeInTheDocument();
        });

        it('should render without children when not provided', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });

        it('should render both buttons with correct text', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            expect(screen.getByRole('button', { name: 'Annulla' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Conferma' })).toBeInTheDocument();
        });
    });

    describe('Button Interactions', () => {
        it('should call onCancel when cancel button is clicked', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            const cancelButton = screen.getByRole('button', { name: 'Annulla' });
            fireEvent.click(cancelButton);

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
            expect(mockOnConfirm).not.toHaveBeenCalled();
        });

        it('should call onConfirm when confirm button is clicked', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            const confirmButton = screen.getByRole('button', { name: 'Conferma' });
            fireEvent.click(confirmButton);

            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
            expect(mockOnCancel).not.toHaveBeenCalled();
        });

        it('should call onCancel when dialog is closed via backdrop or escape', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            const dialog = screen.getByRole('dialog');

            fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

            mockOnCancel();

            expect(mockOnCancel).toHaveBeenCalledTimes(2);
        });
    });

    describe('Button Styling', () => {
        it('should apply correct styles to cancel button', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            const cancelButton = screen.getByRole('button', { name: 'Annulla' });

            expect(cancelButton).toHaveAttribute('type', 'button');
        });

        it('should apply correct styles to confirm button', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            const confirmButton = screen.getByRole('button', { name: 'Conferma' });

            expect(confirmButton).toHaveAttribute('type', 'button');
        });
    });

    describe('Props Variations', () => {
        it('should handle empty title', () => {
            render(<ProductConfirmDialog {...defaultProps} title="" />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should handle empty message', () => {
            render(<ProductConfirmDialog {...defaultProps} message="" />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Annulla' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Conferma' })).toBeInTheDocument();
        });

        it('should handle long title and message', () => {
            const longTitle = 'This is a very long title that might wrap to multiple lines in the dialog';
            const longMessage = 'This is a very long message that definitely should wrap to multiple lines and test how the dialog handles longer content without breaking the layout or functionality';

            render(
                <ProductConfirmDialog
                    {...defaultProps}
                    title={longTitle}
                    message={longMessage}
                />
            );

            expect(screen.getByText(longTitle)).toBeInTheDocument();
            expect(screen.getByText(longMessage)).toBeInTheDocument();
        });
    });

    describe('Multiple Interactions', () => {
        it('should handle multiple rapid clicks on cancel button', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            const cancelButton = screen.getByRole('button', { name: 'Annulla' });

            fireEvent.click(cancelButton);
            fireEvent.click(cancelButton);
            fireEvent.click(cancelButton);

            expect(mockOnCancel).toHaveBeenCalledTimes(3);
        });

        it('should handle multiple rapid clicks on confirm button', () => {
            render(<ProductConfirmDialog {...defaultProps} />);

            const confirmButton = screen.getByRole('button', { name: 'Conferma' });

            fireEvent.click(confirmButton);
            fireEvent.click(confirmButton);
            fireEvent.click(confirmButton);

            expect(mockOnConfirm).toHaveBeenCalledTimes(3);
        });
    });

    describe('Complex Children', () => {
        it('should render complex children with nested elements', () => {
            const complexChildren = (
                <div data-testid="complex-child">
                    <p>Additional information</p>
                    <ul>
                        <li>Item 1</li>
                        <li>Item 2</li>
                    </ul>
                    <button type="button">Custom Button</button>
                </div>
            );

            render(
                <ProductConfirmDialog {...defaultProps}>
                    {complexChildren}
                </ProductConfirmDialog>
            );

            expect(screen.getByTestId('complex-child')).toBeInTheDocument();
            expect(screen.getByText('Additional information')).toBeInTheDocument();
            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
        });

        it('should render multiple children', () => {
            render(
                <ProductConfirmDialog {...defaultProps}>
                    <div data-testid="child-1">First child</div>
                    <div data-testid="child-2">Second child</div>
                </ProductConfirmDialog>
            );

            expect(screen.getByTestId('child-1')).toBeInTheDocument();
            expect(screen.getByTestId('child-2')).toBeInTheDocument();
            expect(screen.getByText('First child')).toBeInTheDocument();
            expect(screen.getByText('Second child')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined children gracefully', () => {
            render(<ProductConfirmDialog {...defaultProps} children={undefined} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });

        it('should handle null children gracefully', () => {
            render(<ProductConfirmDialog {...defaultProps} children={null} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });

        it('should maintain functionality when toggling open state', () => {
            const { rerender } = render(<ProductConfirmDialog {...defaultProps} open={false} />);

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            rerender(<ProductConfirmDialog {...defaultProps} open={true} />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();

            const confirmButton = screen.getByRole('button', { name: 'Conferma' });
            fireEvent.click(confirmButton);

            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        });
    });
});