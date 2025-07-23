import React from 'react';
import { render, screen } from '@testing-library/react';
import withSelectedPartyProducts, { WithSelectedPartyProductsProps } from '../withSelectedPartyProducts';
import { useSelectedPartyProducts } from '../../hooks/useSelectedPartyProducts';
import { Product } from '../../model/Product';
import { Party } from '../../model/Party';
import '@testing-library/jest-dom';

// Mock del decorator withRetrievedValue
jest.mock('@pagopa/selfcare-common-frontend/lib/decorators/withRetrievedValue');
const mockWithRetrievedValue = require('@pagopa/selfcare-common-frontend/lib/decorators/withRetrievedValue').default;

// Mock del decorator withSelectedParty
jest.mock('../withSelectedParty', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const mockWithSelectedParty = require('../withSelectedParty').default;

// Mock dell'hook useSelectedPartyProducts
jest.mock('../../hooks/useSelectedPartyProducts');
const mockUseSelectedPartyProducts = useSelectedPartyProducts as jest.MockedFunction<typeof useSelectedPartyProducts>;

// Componente di test che utilizza il decorator
interface TestComponentProps extends WithSelectedPartyProductsProps {
  testProp?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ party, products, testProp }) => (
    <div>
      <div data-testid="party-id">{party.partyId}</div>
      <div data-testid="products-count">{products.length}</div>
      <div data-testid="first-product-title">{products[0]?.title}</div>
      {testProp && <div data-testid="test-prop">{testProp}</div>}
    </div>
);

// Mock data
const mockParty: Party = {
  partyId: 'test-party-id',
  description: 'Test Party Description',
  digitalAddress: 'test@example.com',
  category: 'PA',
  externalId: 'ext-123',
  fiscalCode: 'FC123456789',
  institutionType: 'PA',
  origin: 'IPA',
  originId: 'origin-123',
  status: 'ACTIVE',
  urlLogo: 'https://example.com/logo.png',
  roles: [],
  registeredOffice: '',
  typology: ''
};

const mockProducts: Product[] = [
  {
    id: 'product-1',
    title: 'Product 1',
    description: 'First product description',
    status: 'ACTIVE',
    urlBO: 'https://example.com/product1',
    urlPublic: 'https://example.com/public/product1',
    logo: 'https://example.com/logo1.png',
    roles: [],
    imageUrl: '',
    subProducts: []
  },
  {
    id: 'product-2',
    title: 'Product 2',
    description: 'Second product description',
    status: 'ACTIVE',
    urlBO: 'https://example.com/product2',
    urlPublic: 'https://example.com/public/product2',
    logo: 'https://example.com/logo2.png',
    roles: [],
    imageUrl: '',
    subProducts: []
  }
];

describe('withSelectedPartyProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock di withRetrievedValue
    mockWithRetrievedValue.mockImplementation((key: string, hook: any, Component: any) => {
      return (props: any) => {
        const retrievedValue = hook();
        const componentProps = { ...props, [key]: retrievedValue };
        return <Component {...componentProps} />;
      };
    });

    // Mock di withSelectedParty
    mockWithSelectedParty.mockImplementation((Component: any) => {
      return (props: any) => {
        const componentProps = { ...props, party: mockParty };
        return <Component {...componentProps} />;
      };
    });

    // Mock dell'hook useSelectedPartyProducts
    mockUseSelectedPartyProducts.mockReturnValue(mockProducts);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should compose withSelectedParty and withRetrievedValue decorators correctly', () => {
    // Act
    const WrappedComponent = withSelectedPartyProducts(TestComponent);
    render(<WrappedComponent testProp="test-value" />);

    // Assert
    expect(mockWithRetrievedValue).toHaveBeenCalledWith(
        'products',
        useSelectedPartyProducts,
        TestComponent
    );
    expect(mockWithSelectedParty).toHaveBeenCalled();
  });

  it('should pass both party and products data to wrapped component', () => {
    // Act
    const WrappedComponent = withSelectedPartyProducts(TestComponent);
    render(<WrappedComponent testProp="test-value" />);

    // Assert
    expect(screen.getByTestId('party-id')).toHaveTextContent('test-party-id');
    expect(screen.getByTestId('products-count')).toHaveTextContent('2');
    expect(screen.getByTestId('first-product-title')).toHaveTextContent('Product 1');
    expect(screen.getByTestId('test-prop')).toHaveTextContent('test-value');
  });

  it('should omit party, products and reload props from component props type', () => {
    // Arrange
    const WrappedComponent = withSelectedPartyProducts(TestComponent);

    // Act & Assert - Verifica che TypeScript non richieda le props omesse
    const props = { testProp: 'test' };

    render(<WrappedComponent {...props} />);

    expect(screen.getByTestId('test-prop')).toHaveTextContent('test');
  });

  it('should handle empty products array', () => {
    // Arrange
    mockUseSelectedPartyProducts.mockReturnValue([]);

    // Act
    const WrappedComponent = withSelectedPartyProducts(TestComponent);
    render(<WrappedComponent testProp="empty-test" />);

    // Assert
    expect(screen.getByTestId('products-count')).toHaveTextContent('0');
    expect(screen.getByTestId('party-id')).toHaveTextContent('test-party-id');
    expect(screen.getByTestId('test-prop')).toHaveTextContent('empty-test');
  });

  it('should work with different component types', () => {
    // Arrange
    interface AnotherComponentProps extends WithSelectedPartyProductsProps {
      customProp: boolean;
    }

    const AnotherComponent: React.FC<AnotherComponentProps> = ({ party, products, customProp }) => (
        <div>
          <span data-testid="custom-prop">{customProp.toString()}</span>
          <span data-testid="party-description">{party.description}</span>
          <span data-testid="products-titles">
          {products.map(p => p.title).join(', ')}
        </span>
        </div>
    );

    // Act
    const WrappedAnotherComponent = withSelectedPartyProducts(AnotherComponent);
    render(<WrappedAnotherComponent customProp={true} />);

    // Assert
    expect(screen.getByTestId('custom-prop')).toHaveTextContent('true');
    expect(screen.getByTestId('party-description')).toHaveTextContent('Test Party Description');
    expect(screen.getByTestId('products-titles')).toHaveTextContent('Product 1, Product 2');
  });

  it('should call decorators in the correct order', () => {
    // Arrange
    const mockInnerComponent = jest.fn(() => <div>Mock Component</div>);

    // Act
    withSelectedPartyProducts(mockInnerComponent);

    // Assert
    // Verifica che withSelectedParty sia chiamato con il risultato di withRetrievedValue
    expect(mockWithSelectedParty).toHaveBeenCalledWith(
        expect.any(Function) // Il componente wrappato da withRetrievedValue
    );
    expect(mockWithRetrievedValue).toHaveBeenCalledWith(
        'products',
        useSelectedPartyProducts,
        mockInnerComponent
    );
  });

  it('should handle products with different structures', () => {
    // Arrange
    const differentProducts: Product[] = [
      {
        id: 'special-product',
        title: 'Special Product',
        description: 'A special product',
        status: 'TESTING',
        urlBO: 'https://example.com/special',
        urlPublic: null,
        logo: null
      }
    ];

    mockUseSelectedPartyProducts.mockReturnValue(differentProducts);

    // Act
    const WrappedComponent = withSelectedPartyProducts(TestComponent);
    render(<WrappedComponent />);

    // Assert
    expect(screen.getByTestId('products-count')).toHaveTextContent('1');
    expect(screen.getByTestId('first-product-title')).toHaveTextContent('Special Product');
  });
});