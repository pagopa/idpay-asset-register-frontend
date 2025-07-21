import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Products from "../../components/Products";

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
    withTranslation: () => (Component: any) => {
        Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
        return Component;
    },
}));

describe('Products component', () => {
    it('renders title and subtitle correctly', () => {
        render(<Products />);

        const title = screen.getByRole('heading', { level: 4 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('pages.products.title');

        const subtitle = screen.getByText('pages.products.subtitle');
        expect(subtitle).toBeInTheDocument();
    });

    it('renders children correctly', () => {
        render(
            <Products>
                <div data-testid="child">Contenuto figlio</div>
            </Products>
        );

        const child = screen.getByTestId('child');
        expect(child).toBeInTheDocument();
        expect(child).toHaveTextContent('Contenuto figlio');
    });

    it('renders the TitleBox with correct props', () => {
        const { container } = render(<Products />);
        const heading = screen.getByRole('heading', { level: 4 });

        expect(heading).toHaveTextContent('pages.products.title');
        expect(container.querySelector('p')).toHaveTextContent('pages.products.subtitle');
    });
});
