import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductConfirmDialog from '../ProductConfirmDialog';

describe('ProductConfirmDialog', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    const baseProps = {
        open: true,
        title: 'Test Title',
        message: 'Test message',
        onCancel,
        onConfirm,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Confirm',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the dialog when open with title, message and buttons', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
        });

        it('does not render the dialog when open=false', () => {
            render(<ProductConfirmDialog {...baseProps} open={false} />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('renders custom title and message', () => {
            render(
                <ProductConfirmDialog
                    {...baseProps}
                    title="Custom Title"
                    message="Custom Message"
                />
            );
            expect(screen.getByText('Custom Title')).toBeInTheDocument();
            expect(screen.getByText('Custom Message')).toBeInTheDocument();
        });

        it('renders children when provided', () => {
            render(
                <ProductConfirmDialog {...baseProps}>
                    <div data-testid="child">Child Content</div>
                </ProductConfirmDialog>
            );
            expect(screen.getByTestId('child')).toBeInTheDocument();
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });

        it('handles empty title and message', () => {
            render(
                <ProductConfirmDialog
                    {...baseProps}
                    title=""
                    message=""
                />
            );
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('calls onCancel when Cancel is clicked', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onConfirm).not.toHaveBeenCalled();
        });

        it('calls onConfirm when Confirm is clicked', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
            expect(onConfirm).toHaveBeenCalledTimes(1);
            expect(onCancel).not.toHaveBeenCalled();
        });

        it('closes with ESC (onClose → onCancel)', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
            expect(onCancel).toHaveBeenCalledTimes(0);
        });

        it('handles multiple rapid clicks on buttons', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
            const confirmBtn = screen.getByRole('button', { name: 'Confirm' });

            fireEvent.click(cancelBtn);
            fireEvent.click(cancelBtn);
            fireEvent.click(cancelBtn);
            expect(onCancel).toHaveBeenCalledTimes(3);

            fireEvent.click(confirmBtn);
            fireEvent.click(confirmBtn);
            fireEvent.click(confirmBtn);
            expect(onConfirm).toHaveBeenCalledTimes(3);
        });

        it('keeps functionality when toggling open', () => {
            const { rerender } = render(<ProductConfirmDialog {...baseProps} open={false} />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            rerender(<ProductConfirmDialog {...baseProps} open />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
            expect(onConfirm).toHaveBeenCalledTimes(1);
        });
    });

    describe('Complex Children', () => {
        it('renders complex nested children', () => {
            render(
                <ProductConfirmDialog {...baseProps}>
                    <div data-testid="complex">
                        <p>Extra Info</p>
                        <ul>
                            <li>Item 1</li>
                            <li>Item 2</li>
                        </ul>
                        <button type="button">Custom Button</button>
                    </div>
                </ProductConfirmDialog>
            );
            expect(screen.getByTestId('complex')).toBeInTheDocument();
            expect(screen.getByText('Extra Info')).toBeInTheDocument();
            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument();
        });

        it('handles undefined/null children', () => {
            const { rerender } = render(
                <ProductConfirmDialog {...baseProps} children={undefined} />
            );
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            rerender(<ProductConfirmDialog {...baseProps} children={null} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    describe('Button Attributes', () => {
        it('buttons have type="button"', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
            expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('type', 'button');
        });
    });
});
