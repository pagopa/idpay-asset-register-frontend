import React from 'react';
import { render, screen } from '@testing-library/react';
import withSelectedParty, { WithSelectedPartyProps } from '../withSelectedParty';
import { useSelectedParty } from '../../hooks/useSelectedParty';
import { Party } from '../../model/Party';
import withRetrievedValue from '@pagopa/selfcare-common-frontend/lib/decorators/withRetrievedValue';

jest.mock('../../hooks/useSelectedParty');
jest.mock('@pagopa/selfcare-common-frontend/lib/decorators/withRetrievedValue');

const mockUseSelectedParty = useSelectedParty as jest.MockedFunction<typeof useSelectedParty>;
const mockWithRetrievedValue = withRetrievedValue as jest.MockedFunction<typeof withRetrievedValue>;

const mockParty: Party = {
    partyId: 'party-123',
    externalId: 'ext-123',
    originId: 'origin-123',
    origin: 'IPA',
    description: 'Test Party',
    digitalAddress: 'test@example.com',
    status: 'ACTIVE',
    roles: [
        {
            partyRole: 'MANAGER',
            roleKey: 'admin',
        },
    ],
    fiscalCode: 'IT12345678901',
    registeredOffice: 'Via Test 123, Roma',
    typology: 'PA',
    category: 'L37',
    urlLogo: 'https://example.com/logo.png',
    institutionType: 'PA',
};

interface TestComponentProps extends WithSelectedPartyProps {
    additionalProp?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ party, additionalProp }) => (
    <div>
        <span data-testid="party-id">{party.partyId}</span>
        <span data-testid="party-description">{party.description}</span>
        {additionalProp && <span data-testid="additional-prop">{additionalProp}</span>}
    </div>
);
TestComponent.displayName = 'TestComponent';

describe('withSelectedParty Decorator', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
            const WrappedWithValue: React.FC<any> = (props) => {
                return <Component {...props} party={mockParty} />;
            };
            return WrappedWithValue;
        });
    });

    describe('Decorator Functionality', () => {
        it('should call withRetrievedValue with correct parameters', () => {
            const WrappedComponent = withSelectedParty(TestComponent);

            expect(mockWithRetrievedValue).toHaveBeenCalledTimes(1);
            expect(mockWithRetrievedValue).toHaveBeenCalledWith(
                'party',
                useSelectedParty,
                TestComponent
            );
        });

        it('should return a component', () => {
            const WrappedComponent = withSelectedParty(TestComponent);

            expect(WrappedComponent).toBeDefined();
            expect(typeof WrappedComponent).toBe('function');
        });
    });

    describe('Component Rendering', () => {
        it('should render wrapped component with party prop', () => {
            const WrappedComponent = withSelectedParty(TestComponent);

            render(<WrappedComponent />);

            expect(screen.getByTestId('party-id')).toHaveTextContent('party-123');
            expect(screen.getByTestId('party-description')).toHaveTextContent('Test Party');
        });

        it('should forward additional props to wrapped component', () => {
            const WrappedComponent = withSelectedParty(TestComponent);

            render(<WrappedComponent additionalProp="test-value" />);

            expect(screen.getByTestId('additional-prop')).toHaveTextContent('test-value');
            expect(screen.getByTestId('party-id')).toHaveTextContent('party-123');
        });
    });

    describe('Type Safety', () => {
        it('should omit party prop from component props type', () => {
            const WrappedComponent = withSelectedParty(TestComponent);

            const element = <WrappedComponent additionalProp="test" />;

            expect(element).toBeDefined();
        });

        it('should accept component with only party prop', () => {
            const SimpleComponent: React.FC<WithSelectedPartyProps> = ({ party }) => (
                <div>{party.description}</div>
            );

            const WrappedComponent = withSelectedParty(SimpleComponent);

            expect(WrappedComponent).toBeDefined();
        });

        it('should accept component with party and additional props', () => {
            interface ExtendedProps extends WithSelectedPartyProps {
                customProp: string;
                optionalProp?: number;
            }

            const ExtendedComponent: React.FC<ExtendedProps> = ({ party, customProp, optionalProp }) => (
                <div>
                    <span>{party.description}</span>
                    <span>{customProp}</span>
                    {optionalProp && <span>{optionalProp}</span>}
                </div>
            );

            const WrappedComponent = withSelectedParty(ExtendedComponent);

            expect(WrappedComponent).toBeDefined();
        });
    });

    describe('Integration with withRetrievedValue', () => {
        it('should pass useSelectedParty hook to withRetrievedValue', () => {
            withSelectedParty(TestComponent);

            const callArgs = mockWithRetrievedValue.mock.calls[0];
            expect(callArgs[1]).toBe(useSelectedParty);
        });

        it('should use "party" as the property key', () => {
            withSelectedParty(TestComponent);

            const callArgs = mockWithRetrievedValue.mock.calls[0];
            expect(callArgs[0]).toBe('party');
        });

        it('should pass the original component to withRetrievedValue', () => {
            withSelectedParty(TestComponent);

            const callArgs = mockWithRetrievedValue.mock.calls[0];
            expect(callArgs[2]).toBe(TestComponent);
        });
    });

    describe('Different Party Scenarios', () => {
        it('should handle party with minimal required fields', () => {
            const minimalParty: Party = {
                partyId: 'min-123',
                externalId: 'ext-min',
                originId: 'origin-min',
                origin: 'IPA',
                description: 'Minimal Party',
                digitalAddress: 'minimal@example.com',
                status: 'PENDING',
                roles: [],
                fiscalCode: 'IT00000000000',
                registeredOffice: 'Via Minimal',
                typology: 'GSP',
            };

            mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
                const WrappedWithValue: React.FC<any> = (props) => {
                    return <Component {...props} party={minimalParty} />;
                };
                return WrappedWithValue;
            });

            const WrappedComponent = withSelectedParty(TestComponent);

            render(<WrappedComponent />);

            expect(screen.getByTestId('party-id')).toHaveTextContent('min-123');
            expect(screen.getByTestId('party-description')).toHaveTextContent('Minimal Party');
        });

        it('should handle party with all optional fields', () => {
            const completeParty: Party = {
                ...mockParty,
                category: 'L37',
                urlLogo: 'https://example.com/complete-logo.png',
                institutionType: 'PA',
            };

            mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
                const WrappedWithValue: React.FC<any> = (props) => {
                    return <Component {...props} party={completeParty} />;
                };
                return WrappedWithValue;
            });

            const WrappedComponent = withSelectedParty(TestComponent);

            render(<WrappedComponent />);

            expect(screen.getByTestId('party-id')).toHaveTextContent('party-123');
        });

        it('should handle party with different statuses', () => {
            const statuses: Array<'ACTIVE' | 'PENDING' | 'SUSPENDED'> = [
                'ACTIVE',
                'PENDING',
                'SUSPENDED',
            ];

            statuses.forEach((status) => {
                const partyWithStatus: Party = {
                    ...mockParty,
                    status,
                };

                mockWithRetrievedValue.mockImplementation((key, hook, Component) => {
                    const WrappedWithValue: React.FC<any> = (props) => {
                        return <Component {...props} party={partyWithStatus} />;
                    };
                    return WrappedWithValue;
                });

                const WrappedComponent = withSelectedParty(TestComponent);
                const { unmount } = render(<WrappedComponent />);

                expect(screen.getByTestId('party-id')).toHaveTextContent('party-123');

                unmount();
            });
        });
    });

    describe('Component Display Name', () => {
        it('should work with components that have displayName', () => {
            const ComponentWithDisplayName: React.FC<WithSelectedPartyProps> = ({ party }) => (
                <div>{party.description}</div>
            );
            ComponentWithDisplayName.displayName = 'CustomDisplayName';

            const WrappedComponent = withSelectedParty(ComponentWithDisplayName);

            expect(mockWithRetrievedValue).toHaveBeenCalledWith(
                'party',
                useSelectedParty,
                ComponentWithDisplayName
            );
        });

        it('should work with anonymous components', () => {
            const WrappedComponent = withSelectedParty(({ party }: WithSelectedPartyProps) => (
                <div>{party.description}</div>
            ));

            expect(WrappedComponent).toBeDefined();
        });
    });

    describe('Multiple Instances', () => {
        it('should allow wrapping multiple different components', () => {
            const Component1: React.FC<WithSelectedPartyProps> = ({ party }) => (
                <div data-testid="comp1">{party.description}</div>
            );

            const Component2: React.FC<WithSelectedPartyProps> = ({ party }) => (
                <div data-testid="comp2">{party.partyId}</div>
            );

            const Wrapped1 = withSelectedParty(Component1);
            const Wrapped2 = withSelectedParty(Component2);

            expect(mockWithRetrievedValue).toHaveBeenCalledTimes(2);
            expect(Wrapped1).toBeDefined();
            expect(Wrapped2).toBeDefined();
        });
    });

    describe('WithSelectedPartyProps Type', () => {
        it('should define party prop correctly', () => {
            const validProps: WithSelectedPartyProps = {
                party: mockParty,
            };

            expect(validProps.party).toEqual(mockParty);
        });

        it('should require party prop', () => {
            const validProps: WithSelectedPartyProps = {
                party: mockParty,
            };

            expect(validProps).toHaveProperty('party');
        });
    });
});