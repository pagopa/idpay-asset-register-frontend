import React from 'react';
import { render, screen } from '@testing-library/react';
import withSelectedPartyProducts, {
    WithSelectedPartyProductsProps,
} from '../withSelectedPartyProducts';
import { useSelectedPartyProducts } from '../../hooks/useSelectedPartyProducts';
import { Product } from '../../model/Product';
import { Party } from '../../model/Party';
import withRetrievedValue from '@pagopa/selfcare-common-frontend/lib/decorators/withRetrievedValue';

jest.mock('../../hooks/useSelectedPartyProducts');
jest.mock('@pagopa/selfcare-common-frontend/lib/decorators/withRetrievedValue');
jest.mock('../withSelectedParty', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockUseSelectedPartyProducts = useSelectedPartyProducts as jest.MockedFunction<typeof useSelectedPartyProducts>;
const mockWithRetrievedValue = withRetrievedValue as jest.MockedFunction<typeof withRetrievedValue>;

import withSelectedParty from '../withSelectedParty';
const mockWithSelectedParty = withSelectedParty as jest.MockedFunction<typeof withSelectedParty>;

const mockParty: Party = {
    partyId: 'party-123',
    externalId: 'ext-123',
    originId: 'origin-123',
    origin: 'IPA',
    description: 'Test Party',
    digitalAddress: 'test@example.com',
    status: 'ACTIVE',
    roles: [{ partyRole: 'MANAGER', roleKey: 'admin' }],
    fiscalCode: 'IT12345678901',
    registeredOffice: 'Via Test 123, Roma',
    typology: 'PA',
};

const mockProducts: Array<Product> = [
    {
        id: 'prod-001',
        title: 'Product 1',
        description: 'Description 1',
        urlBO: 'https://bo1.example.com',
        roles: [],
        status: 'ACTIVE',
        imageUrl: 'https://example.com/img1.png',
        subProducts: [],
    },
    {
        id: 'prod-002',
        title: 'Product 2',
        description: 'Description 2',
        urlBO: 'https://bo2.example.com',
        roles: [],
        status: 'INACTIVE',
        imageUrl: 'https://example.com/img2.png',
        subProducts: [],
    },
];

interface TestComponentProps extends WithSelectedPartyProductsProps {
    additionalProp?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ party, products, additionalProp }) => (
    <div>
        <span data-testid="party-id">{party.partyId}</span>
        <span data-testid="products-count">{products.length}</span>
        {products.map((product) => (
            <div key={product.id} data-testid={`product-${product.id}`}>
                {product.title}
            </div>
        ))}
        {additionalProp && <span data-testid="additional-prop">{additionalProp}</span>}
    </div>
);
TestComponent.displayName = 'TestComponent';

describe('withSelectedPartyProducts Decorator', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
            const WrappedWithValue: React.FC<any> = (props) => {
                return <Component {...props} products={mockProducts} />;
            };
            return WrappedWithValue;
        });

        mockWithSelectedParty.mockImplementation((Component) => {
            const WrappedWithParty: React.FC<any> = (props) => {
                return <Component {...props} party={mockParty} />;
            };
            return WrappedWithParty;
        });
    });

    describe('Decorator Composition', () => {
        it('should call withRetrievedValue with correct parameters', () => {
            withSelectedPartyProducts(TestComponent);

            expect(mockWithRetrievedValue).toHaveBeenCalledTimes(1);
            expect(mockWithRetrievedValue).toHaveBeenCalledWith(
                'products',
                useSelectedPartyProducts,
                TestComponent
            );
        });

        it('should call withSelectedParty after withRetrievedValue', () => {
            withSelectedPartyProducts(TestComponent);

            expect(mockWithRetrievedValue).toHaveBeenCalledTimes(1);
            expect(mockWithSelectedParty).toHaveBeenCalledTimes(1);
        });

        it('should pass result of withRetrievedValue to withSelectedParty', () => {
            const mockWrappedComponent = jest.fn(() => null);
            mockWithRetrievedValue.mockReturnValue(mockWrappedComponent as any);

            withSelectedPartyProducts(TestComponent);

            expect(mockWithSelectedParty).toHaveBeenCalledWith(mockWrappedComponent);
        });

        it('should return the result of withSelectedParty', () => {
            const mockFinalComponent = jest.fn(() => null);
            mockWithSelectedParty.mockReturnValue(mockFinalComponent as any);

            const result = withSelectedPartyProducts(TestComponent);

            expect(result).toBe(mockFinalComponent);
        });
    });

    describe('Component Rendering', () => {
        it('should render wrapped component with party and products props', () => {
            const WrappedComponent = withSelectedPartyProducts(TestComponent);

            render(<WrappedComponent />);

            expect(screen.getByTestId('party-id')).toHaveTextContent('party-123');
            expect(screen.getByTestId('products-count')).toHaveTextContent('2');
            expect(screen.getByTestId('product-prod-001')).toHaveTextContent('Product 1');
            expect(screen.getByTestId('product-prod-002')).toHaveTextContent('Product 2');
        });

        it('should forward additional props to wrapped component', () => {
            const WrappedComponent = withSelectedPartyProducts(TestComponent);

            render(<WrappedComponent additionalProp="test-value" />);

            expect(screen.getByTestId('additional-prop')).toHaveTextContent('test-value');
            expect(screen.getByTestId('party-id')).toHaveTextContent('party-123');
            expect(screen.getByTestId('products-count')).toHaveTextContent('2');
        });

        it('should handle empty products array', () => {
            mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
                const WrappedWithValue: React.FC<any> = (props) => {
                    return <Component {...props} products={[]} />;
                };
                return WrappedWithValue;
            });

            const WrappedComponent = withSelectedPartyProducts(TestComponent);

            render(<WrappedComponent />);

            expect(screen.getByTestId('products-count')).toHaveTextContent('0');
        });
    });

    describe('Type Safety', () => {
        it('should omit party and products props from component props type', () => {
            const WrappedComponent = withSelectedPartyProducts(TestComponent);
            const element = <WrappedComponent additionalProp="test" />;

            expect(element).toBeDefined();
        });

        it('should accept component with only required props', () => {
            const SimpleComponent: React.FC<WithSelectedPartyProductsProps> = ({ party, products }) => (
                <div>
                    <span>{party.description}</span>
                    <span>{products.length}</span>
                </div>
            );

            const WrappedComponent = withSelectedPartyProducts(SimpleComponent);

            expect(WrappedComponent).toBeDefined();
        });
    });

    describe('Different Products Scenarios', () => {
        it('should handle single product', () => {
            const singleProduct: Array<Product> = [
                {
                    id: 'single-001',
                    title: 'Single Product',
                    description: 'Single Description',
                    urlBO: 'https://bo.example.com',
                    roles: [],
                    status: 'ACTIVE',
                    imageUrl: 'https://example.com/img.png',
                    subProducts: [],
                },
            ];

            mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
                const WrappedWithValue: React.FC<any> = (props) => {
                    return <Component {...props} products={singleProduct} />;
                };
                return WrappedWithValue;
            });

            const WrappedComponent = withSelectedPartyProducts(TestComponent);

            render(<WrappedComponent />);

            expect(screen.getByTestId('products-count')).toHaveTextContent('1');
            expect(screen.getByTestId('product-single-001')).toHaveTextContent('Single Product');
        });

        it('should handle products with different statuses', () => {
            const productsWithStatuses: Array<Product> = [
                { ...mockProducts[0], status: 'ACTIVE' },
                { ...mockProducts[1], status: 'INACTIVE' },
                {
                    id: 'prod-003',
                    title: 'Product 3',
                    description: 'Description 3',
                    urlBO: 'https://bo3.example.com',
                    roles: [],
                    status: 'PENDING',
                    imageUrl: 'https://example.com/img3.png',
                    subProducts: [],
                },
            ];

            mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
                const WrappedWithValue: React.FC<any> = (props) => {
                    return <Component {...props} products={productsWithStatuses} />;
                };
                return WrappedWithValue;
            });

            const WrappedComponent = withSelectedPartyProducts(TestComponent);

            render(<WrappedComponent />);

            expect(screen.getByTestId('products-count')).toHaveTextContent('3');
        });
    });

    describe('Integration with Hooks', () => {
        it('should use useSelectedPartyProducts hook', () => {
            withSelectedPartyProducts(TestComponent);

            const callArgs = mockWithRetrievedValue.mock.calls[0];
            expect(callArgs[1]).toBe(useSelectedPartyProducts);
        });

        it('should use "products" as the property key', () => {
            withSelectedPartyProducts(TestComponent);

            const callArgs = mockWithRetrievedValue.mock.calls[0];
            expect(callArgs[0]).toBe('products');
        });
    });

    describe('Multiple Instances', () => {
        it('should allow wrapping multiple different components', () => {
            const Component1: React.FC<WithSelectedPartyProductsProps> = ({ party, products }) => (
                <div data-testid="comp1">
                    {party.description} - {products.length}
                </div>
            );

            const Component2: React.FC<WithSelectedPartyProductsProps> = ({ party, products }) => (
                <div data-testid="comp2">
                    {party.partyId} - {products[0]?.title}
                </div>
            );

            const Wrapped1 = withSelectedPartyProducts(Component1);
            const Wrapped2 = withSelectedPartyProducts(Component2);

            expect(mockWithRetrievedValue).toHaveBeenCalledTimes(2);
            expect(mockWithSelectedParty).toHaveBeenCalledTimes(2);
            expect(Wrapped1).toBeDefined();
            expect(Wrapped2).toBeDefined();
        });
    });

    describe('WithSelectedPartyProductsProps Type', () => {
        it('should define party and products props correctly', () => {
            const validProps: WithSelectedPartyProductsProps = {
                party: mockParty,
                products: mockProducts,
            };

            expect(validProps.party).toEqual(mockParty);
            expect(validProps.products).toEqual(mockProducts);
        });

        it('should require both party and products props', () => {
            const validProps: WithSelectedPartyProductsProps = {
                party: mockParty,
                products: mockProducts,
            };

            expect(validProps).toHaveProperty('party');
            expect(validProps).toHaveProperty('products');
        });
    });

    describe('Decorator Chain Order', () => {
        it('should apply decorators in correct order (withRetrievedValue then withSelectedParty)', () => {
            const callOrder: string[] = [];

            mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
                callOrder.push('withRetrievedValue');
                return Component;
            });

            mockWithSelectedParty.mockImplementation((Component) => {
                callOrder.push('withSelectedParty');
                return Component;
            });

            withSelectedPartyProducts(TestComponent);

            expect(callOrder).toEqual(['withRetrievedValue', 'withSelectedParty']);
        });
    });
});