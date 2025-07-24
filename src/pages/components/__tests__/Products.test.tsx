import { render, screen } from '@testing-library/react';
import Products from '../Products';
import '@testing-library/jest-dom';

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

    expect(screen.getByText('pages.products.title')).toBeInTheDocument();
    expect(screen.getByText('pages.products.subtitle')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <Products>
        <div data-testid="child">Child content</div>
      </Products>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
