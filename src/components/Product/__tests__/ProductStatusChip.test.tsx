import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import ProductStatusChip from '../ProductStatusChip';

jest.mock('@mui/icons-material/Warning', () => {
    return (props: any) => (
        <span data-testid="warning-icon" {...props}>warning-icon</span>
    );
});

jest.mock('@mui/icons-material/Error', () => {
    return (props: any) => (
        <span data-testid="error-icon" {...props}>error-icon</span>
    );
});

const theme = createTheme();
const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

describe('ProductStatusChip', () => {
    describe('quando status è undefined', () => {
        it('dovrebbe non renderizzare nulla', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status={undefined} />
            );
            expect(container.firstChild).toBeNull();
        });
    });

    describe('quando status è null (coercizione a undefined)', () => {
        it('dovrebbe non renderizzare nulla', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status={null as any} />
            );
            expect(container.firstChild).toBeNull();
        });
    });

    describe('quando status è una stringa vuota', () => {
        it('dovrebbe non renderizzare nulla', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status="" />
            );
            expect(container.firstChild).toBeNull();
        });
    });

    describe('quando status è "APPROVED"', () => {
        it('dovrebbe non renderizzare nulla', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status="APPROVED" />
            );
            expect(container.firstChild).toBeNull();
        });
    });

    describe('quando status è "REJECTED"', () => {
        it('dovrebbe renderizzare un chip di errore con icona ErrorIcon', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            const chip = screen.getByText('Prodotto Escluso').closest('.MuiChip-root');
            expect(chip).toBeInTheDocument();
            expect(chip).toHaveClass('MuiChip-colorError');

            const errorIcon = screen.getByTestId('error-icon');
            expect(errorIcon).toBeInTheDocument();
            expect(errorIcon).toHaveAttribute('color', 'error');

            expect(screen.getByText('Prodotto Escluso')).toBeInTheDocument();
        });

        it('dovrebbe avere le corrette proprietà del chip', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            const chip = screen.getByText('Prodotto Escluso').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-sizeMedium');
            expect(chip).toHaveClass('MuiChip-colorError');

            expect(chip).toHaveStyle({ marginBottom: '8px' });
        });
    });

    describe('quando status è qualsiasi altro valore', () => {
        const testCases = [
            'PENDING',
            'IN_REVIEW',
            'FLAGGED',
            'UNKNOWN_STATUS',
            'random-string',
            '123',
            'null',
            'undefined'
        ];

        testCases.forEach((status) => {
            it(`dovrebbe renderizzare un chip di warning per status "${status}"`, () => {
                renderWithTheme(<ProductStatusChip status={status} />);

                const chip = screen.getByText('Prodotto contrassegnato').closest('.MuiChip-root');
                expect(chip).toBeInTheDocument();
                expect(chip).toHaveClass('MuiChip-colorWarning');

                const warningIcon = screen.getByTestId('warning-icon');
                expect(warningIcon).toBeInTheDocument();
                expect(warningIcon).toHaveAttribute('color', 'warning');

                expect(screen.getByText('Prodotto contrassegnato')).toBeInTheDocument();
            });
        });

        it('dovrebbe avere le corrette proprietà del chip per status warning', () => {
            renderWithTheme(<ProductStatusChip status="PENDING" />);

            const chip = screen.getByText('Prodotto contrassegnato').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-sizeMedium');
            expect(chip).toHaveClass('MuiChip-colorWarning');

            expect(chip).toHaveStyle({ marginBottom: '8px' });
        });
    });

    describe('test sui case edge', () => {
        it('dovrebbe gestire correttamente status con spazi', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status="   " />
            );
            expect(container.firstChild).not.toBeNull();
            expect(screen.getByText('Prodotto contrassegnato')).toBeInTheDocument();
        });

        it('dovrebbe essere case-sensitive per APPROVED', () => {
            renderWithTheme(<ProductStatusChip status="approved" />);

            expect(screen.getByText('Prodotto contrassegnato')).toBeInTheDocument();
            expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
        });

        it('dovrebbe essere case-sensitive per REJECTED', () => {
            renderWithTheme(<ProductStatusChip status="rejected" />);

            expect(screen.getByText('Prodotto contrassegnato')).toBeInTheDocument();
            expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
        });
    });

    describe('test di accessibilità', () => {
        it('dovrebbe renderizzare il chip REJECTED con struttura corretta', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            const chip = screen.getByText('Prodotto Escluso').closest('.MuiChip-root');
            expect(chip).toBeInTheDocument();
        });

        it('dovrebbe renderizzare il chip warning con struttura corretta', () => {
            renderWithTheme(<ProductStatusChip status="PENDING" />);

            const chip = screen.getByText('Prodotto contrassegnato').closest('.MuiChip-root');
            expect(chip).toBeInTheDocument();
        });

        it('dovrebbe avere testo accessibile per screen reader - REJECTED', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            expect(screen.getByText('Prodotto Escluso')).toBeInTheDocument();
        });

        it('dovrebbe avere testo accessibile per screen reader - WARNING', () => {
            renderWithTheme(<ProductStatusChip status="PENDING" />);

            expect(screen.getByText('Prodotto contrassegnato')).toBeInTheDocument();
        });
    });

    describe('test di rendering completo', () => {
        it('dovrebbe non renderizzare nulla per status undefined', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status={undefined} />
            );
            expect(container.firstChild).toBeNull();
            expect(container.innerHTML).toBe('');
        });

        it('dovrebbe non renderizzare nulla per status APPROVED', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status="APPROVED" />
            );
            expect(container.firstChild).toBeNull();
            expect(container.innerHTML).toBe('');
        });

        it('dovrebbe renderizzare struttura corretta per status REJECTED', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status="REJECTED" />
            );

            expect(container.firstChild).not.toBeNull();

            const chip = container.querySelector('.MuiChip-root');
            expect(chip).toBeInTheDocument();
            expect(chip).toHaveClass('MuiChip-colorError');
            expect(chip).toHaveClass('MuiChip-sizeMedium');

            expect(container).toHaveTextContent('Prodotto Escluso');

            expect(container.querySelector('[data-testid="error-icon"]')).toBeInTheDocument();
        });

        it('dovrebbe renderizzare struttura corretta per status warning', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status="PENDING" />
            );

            expect(container.firstChild).not.toBeNull();

            const chip = container.querySelector('.MuiChip-root');
            expect(chip).toBeInTheDocument();
            expect(chip).toHaveClass('MuiChip-colorWarning');
            expect(chip).toHaveClass('MuiChip-sizeMedium');

            expect(container).toHaveTextContent('Prodotto contrassegnato');

            expect(container.querySelector('[data-testid="warning-icon"]')).toBeInTheDocument();
        });

        it('dovrebbe applicare correttamente gli stili sx', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            const chip = screen.getByText('Prodotto Escluso').closest('.MuiChip-root');
            expect(chip).toHaveStyle('margin-bottom: 8px');
        });
    });
});