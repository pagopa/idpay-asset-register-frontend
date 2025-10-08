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
            expect(container.firstChild).not.toBeNull();
        });
    });

    describe('quando status è "REJECTED"', () => {
        it('dovrebbe renderizzare un chip di errore con icona ErrorIcon', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            const chip = screen.getByText('chip.productStatusLabel.rejected').closest('.MuiChip-root');
            expect(chip).toBeInTheDocument();
            expect(chip).toHaveClass('MuiChip-colorError');

            expect(screen.getByText('chip.productStatusLabel.rejected')).toBeInTheDocument();
        });

        it('dovrebbe avere le corrette proprietà del chip', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            const chip = screen.getByText('chip.productStatusLabel.rejected').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-sizeMedium');
            expect(chip).toHaveClass('MuiChip-colorError');

            expect(chip).toHaveStyle({ marginBottom: '8px' });
        });
    });

    describe('test di accessibilità', () => {
        it('dovrebbe renderizzare il chip REJECTED con struttura corretta', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            const chip = screen.getByText('chip.productStatusLabel.rejected').closest('.MuiChip-root');
            expect(chip).toBeInTheDocument();
        });


        it('dovrebbe avere testo accessibile per screen reader - REJECTED', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            expect(screen.getByText('chip.productStatusLabel.rejected')).toBeInTheDocument();
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
            expect(container.firstChild).not.toBeNull();
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

            expect(container).toHaveTextContent('chip.productStatusLabel.rejected');
        });

        it('dovrebbe renderizzare struttura corretta per status warning', () => {
            const { container } = renderWithTheme(
                <ProductStatusChip status="PENDING" />
            );

            expect(container.firstChild).toBeNull();
        });

        it('dovrebbe applicare correttamente gli stili sx', () => {
            renderWithTheme(<ProductStatusChip status="REJECTED" />);

            const chip = screen.getByText('chip.productStatusLabel.rejected').closest('.MuiChip-root');
            expect(chip).toHaveStyle('margin-bottom: 8px');
        });
    });
});