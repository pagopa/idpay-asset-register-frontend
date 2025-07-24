import React from 'react';
import { render, screen } from '@testing-library/react';
import withSelectedParty, { WithSelectedPartyProps } from '../withSelectedParty';
import { useSelectedParty } from '../../hooks/useSelectedParty';
import { Party } from '../../model/Party';
import '@testing-library/jest-dom';

jest.mock('../../utils/env', () => ({
  __esModule: true,
  default: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    API_TIMEOUT_MS: {
      OPERATION: 5000,
    },
  },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/decorators/withRetrievedValue');
const mockWithRetrievedValue = require('@pagopa/selfcare-common-frontend/lib/decorators/withRetrievedValue').default;

jest.mock('../../hooks/useSelectedParty');
const mockUseSelectedParty = useSelectedParty as jest.MockedFunction<typeof useSelectedParty>;

interface TestComponentProps extends WithSelectedPartyProps {
  testProp?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ party, testProp }) => (
    <div>
      <div data-testid="party-id">{party.partyId}</div>
      <div data-testid="party-description">{party.description}</div>
      {testProp && <div data-testid="test-prop">{testProp}</div>}
    </div>
);

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

describe('withSelectedParty', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockWithRetrievedValue.mockImplementation((key: string, hook: any, Component: any) => {
      return (props: any) => {
        const retrievedValue = hook();
        const componentProps = {...props, [key]: retrievedValue};
        return <Component {...componentProps} />;
      };
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should wrap component with withRetrievedValue using correct parameters', () => {
    mockUseSelectedParty.mockReturnValue(mockParty);

    // Act
    const WrappedComponent = withSelectedParty(TestComponent);
    render(<WrappedComponent testProp="test-value" />);

    // Assert
    expect(mockWithRetrievedValue).toHaveBeenCalledWith(
        'party',
        useSelectedParty,
        TestComponent
    );
  });

  it('should pass party data to wrapped component', () => {
    // Arrange
    mockUseSelectedParty.mockReturnValue(mockParty);

    // Act
    const WrappedComponent = withSelectedParty(TestComponent);
    render(<WrappedComponent testProp="test-value" />);

    // Assert
    expect(screen.getByTestId('party-id')).toHaveTextContent('test-party-id');
    expect(screen.getByTestId('party-description')).toHaveTextContent('Test Party Description');
    expect(screen.getByTestId('test-prop')).toHaveTextContent('test-value');
  });

  it('should omit party and reload props from component props type', () => {
    // Arrange
    mockUseSelectedParty.mockReturnValue(mockParty);
    const WrappedComponent = withSelectedParty(TestComponent);

    // Act & Assert - Questo test verifica che TypeScript non richieda le props 'party' e 'reload'
    const props = { testProp: 'test' };

    // Se il tipo è corretto, questo non dovrebbe causare errori di TypeScript
    render(<WrappedComponent {...props} />);

    expect(screen.getByTestId('test-prop')).toHaveTextContent('test');
  });

  it('should handle different component types', () => {
    // Arrange
    interface AnotherComponentProps extends WithSelectedPartyProps {
      customProp: number;
    }

    const AnotherComponent: React.FC<AnotherComponentProps> = ({ party, customProp }) => (
        <div>
          <span data-testid="custom-prop">{customProp}</span>
          <span data-testid="party-fiscal-code">{party.fiscalCode}</span>
        </div>
    );

    mockUseSelectedParty.mockReturnValue(mockParty);

    // Act
    const WrappedAnotherComponent = withSelectedParty(AnotherComponent);
    render(<WrappedAnotherComponent customProp={42} />);

    // Assert
    expect(mockWithRetrievedValue).toHaveBeenCalledWith(
        'party',
        useSelectedParty,
        AnotherComponent
    );
    expect(screen.getByTestId('custom-prop')).toHaveTextContent('42');
    expect(screen.getByTestId('party-fiscal-code')).toHaveTextContent('FC123456789');
  });

  it('should maintain component display name or function name', () => {
    // Arrange
    const NamedComponent = function MyCustomComponent({ party }: WithSelectedPartyProps) {
      return <div data-testid="named-component">{party.description}</div>;
    };

    mockUseSelectedParty.mockReturnValue(mockParty);

    const WrappedComponent = withSelectedParty(NamedComponent);

    // Assert
    // Verifichiamo che il decorator sia stato chiamato con il componente corretto
    expect(mockWithRetrievedValue).toHaveBeenCalledWith(
        'party',
        useSelectedParty,
        NamedComponent
    );
  });
});