import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Products from '../Products';

jest.mock('../../../components/Product/ProductDataGrid', () => {
  const Mock = ({ organizationId }: { organizationId: string }) => (
      <div data-testid="product-grid">{organizationId}</div>
  );
  return { __esModule: true, default: Mock };
});

describe('Products', () => {
  it('rende il ProductDataGrid con l’organizationId passato', () => {
    render(<Products organizationId="org-123" />);

    const grid = screen.getByTestId('product-grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveTextContent('org-123');
  });

  it('non rende i children (il componente non li supporta)', () => {
    render(
        <Products organizationId="org-123">
          <div data-testid="child">Child content</div>
        </Products>
    );

    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });
});
