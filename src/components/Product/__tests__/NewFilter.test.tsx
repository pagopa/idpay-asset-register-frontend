import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import NewFilter from '../NewFilter';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: () => 'Advanced filters',
    }),
}));

const renderWithTheme = (ui: React.ReactElement) => {
    const theme = createTheme();
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('NewFilter', () => {
    it('renders the button with translation text and icon', () => {
        renderWithTheme(<NewFilter />);
        const btn = screen.getByRole('button', { name: /advanced filters/i });
        expect(btn).toBeInTheDocument();

        // Ensure the MUI icon (svg) is present inside the button
        expect(btn.querySelector('svg')).toBeTruthy();

        // Check typical MUI Button classes applied for variant="text" color="primary"
        expect(btn.className).toMatch(/MuiButton-text/);
        expect(btn.className).toMatch(/MuiButton-textPrimary/);
    });

    it('calls onClick when provided', () => {
        const handleClick = jest.fn();
        renderWithTheme(<NewFilter onClick={handleClick} />);
        fireEvent.click(screen.getByRole('button', { name: /advanced filters/i }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onClick is not provided', () => {
        renderWithTheme(<NewFilter />);
        const btn = screen.getByRole('button', { name: /advanced filters/i });
        expect(() => fireEvent.click(btn)).not.toThrow();
        expect(btn).toBeInTheDocument();
    });
});
