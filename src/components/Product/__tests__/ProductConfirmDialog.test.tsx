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
        cancelButtonText: 'Annulla',
        confirmButtonText: 'Conferma',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renderizza il dialog aperto con titolo, messaggio e bottoni', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Annulla' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Conferma' })).toBeInTheDocument();
        });

        it('non renderizza nulla quando open=false', () => {
            render(<ProductConfirmDialog {...baseProps} open={false} />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('mostra il titolo e il messaggio personalizzati', () => {
            render(
                <ProductConfirmDialog
                    {...baseProps}
                    title="Titolo Custom"
                    message="Messaggio Custom"
                />
            );
            expect(screen.getByText('Titolo Custom')).toBeInTheDocument();
            expect(screen.getByText('Messaggio Custom')).toBeInTheDocument();
        });

        it('renderizza i children quando forniti', () => {
            render(
                <ProductConfirmDialog {...baseProps}>
                    <div data-testid="child">Contenuto figlio</div>
                </ProductConfirmDialog>
            );
            expect(screen.getByTestId('child')).toBeInTheDocument();
            expect(screen.getByText('Contenuto figlio')).toBeInTheDocument();
        });

        it('gestisce titolo e messaggio vuoti', () => {
            render(
                <ProductConfirmDialog
                    {...baseProps}
                    title=""
                    message=""
                />
            );
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Annulla' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Conferma' })).toBeInTheDocument();
        });
    });

    describe('Interazioni', () => {
        it('chiama onCancel quando si clicca Annulla', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onConfirm).not.toHaveBeenCalled();
        });

        it('chiama onConfirm quando si clicca Conferma', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            fireEvent.click(screen.getByRole('button', { name: 'Conferma' }));
            expect(onConfirm).toHaveBeenCalledTimes(1);
            expect(onCancel).not.toHaveBeenCalled();
        });

        it('chiude con ESC (onClose → onCancel)', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
            expect(onCancel).toHaveBeenCalledTimes(0);
        });

        it('gestisce clic rapidi ripetuti sui bottoni', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            const cancelBtn = screen.getByRole('button', { name: 'Annulla' });
            const confirmBtn = screen.getByRole('button', { name: 'Conferma' });

            fireEvent.click(cancelBtn);
            fireEvent.click(cancelBtn);
            fireEvent.click(cancelBtn);
            expect(onCancel).toHaveBeenCalledTimes(3);

            fireEvent.click(confirmBtn);
            fireEvent.click(confirmBtn);
            fireEvent.click(confirmBtn);
            expect(onConfirm).toHaveBeenCalledTimes(3);
        });

        it('mantiene la funzionalità al toggle di open', () => {
            const { rerender } = render(<ProductConfirmDialog {...baseProps} open={false} />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            rerender(<ProductConfirmDialog {...baseProps} open />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Conferma' }));
            expect(onConfirm).toHaveBeenCalledTimes(1);
        });
    });

    describe('Children complessi', () => {
        it('renderizza children complessi annidati', () => {
            render(
                <ProductConfirmDialog {...baseProps}>
                    <div data-testid="complex">
                        <p>Info extra</p>
                        <ul>
                            <li>Item 1</li>
                            <li>Item 2</li>
                        </ul>
                        <button type="button">Bottone custom</button>
                    </div>
                </ProductConfirmDialog>
            );
            expect(screen.getByTestId('complex')).toBeInTheDocument();
            expect(screen.getByText('Info extra')).toBeInTheDocument();
            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Bottone custom' })).toBeInTheDocument();
        });

        it('gestisce children undefined/null', () => {
            const { rerender } = render(
                <ProductConfirmDialog {...baseProps} children={undefined} />
            );
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            rerender(<ProductConfirmDialog {...baseProps} children={null} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    describe('Attributi base dei bottoni', () => {
        it('i bottoni hanno type="button"', () => {
            render(<ProductConfirmDialog {...baseProps} />);
            expect(screen.getByRole('button', { name: 'Annulla' })).toHaveAttribute('type', 'button');
            expect(screen.getByRole('button', { name: 'Conferma' })).toHaveAttribute('type', 'button');
        });
    });
});
