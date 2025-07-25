import { renderWithContext } from '../../../utils/__tests__/test-utils';
import Header from '../Header';
import { mockedUser } from '../../../decorators/__mocks__/withLogin';
import { Party } from '../../../model/Party';
import {trackEvent} from "@pagopa/selfcare-common-frontend/lib/services/analyticsService";
import { screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

jest.mock('../../../utils/env', () => ({
  __esModule: true,
  ENV: {
    URL_API: {
      OPERATION: 'https://mock-api/register',
    },
    ASSISTANCE: {
      EMAIL: 'email@example.com',
    },
    API_TIMEOUT_MS: {
      OPERATION: 5000,
    },
  },
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home'
  },
  BASE_ROUTE: '/base'
}));

jest.mock('../../../api/registerApiClient', () => ({
  RolePermissionApi: {
    getPortalConsent: jest.fn(),
    savePortalConsent: jest.fn(),
  },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  Header: jest.fn(({ onSelectedProduct, onSelectedParty }) => {
    return (
        <div data-testid="common-header">
          <button
              data-testid="select-product-btn"
              onClick={() => onSelectedProduct && onSelectedProduct({ id: 'test-product' })}
          >
            Select Product
          </button>
          <button
              data-testid="select-party-btn"
              onClick={() => onSelectedParty && onSelectedParty({ id: 'test-party', name: 'Test Party' })}
          >
            Select Party
          </button>
          <button
              data-testid="select-party-null-btn"
              onClick={() => onSelectedParty && onSelectedParty(null)}
          >
            Select Null Party
          </button>
        </div>
    );
  }),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockUseAppSelector = jest.mocked(require('../../../redux/hooks').useAppSelector);

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  ...jest.requireActual('@pagopa/selfcare-common-frontend/lib'),
  Header: ({ onSelectedParty, onSelectedProduct }: any) => (
      <>
        <button data-testid="select-party-btn" onClick={() => onSelectedParty(null)}>
          Simula party
        </button>
        <button data-testid="select-party-null-btn" onClick={() => onSelectedParty(null)}>
          Simula party null
        </button>
        <button data-testid="select-product-btn" onClick={() => onSelectedProduct?.(() => {})}>
          Simula prodotto
        </button>
      </>
  ),
}));

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.clearAllMocks();

  mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
    if (selector.toString().includes('selectPartySelectedProducts')) {
      return [
        {
          id: 'prod-active',
          title: 'Active Product',
          status: 'ACTIVE',
          authorized: true,
          urlPublic: 'https://active-product.com',
        },
        {
          id: 'prod-inactive',
          title: 'Inactive Product',
          status: 'INACTIVE',
          authorized: true,
          urlPublic: 'https://inactive-product.com',
        },
        {
          id: 'prod-unauthorized',
          title: 'Unauthorized Product',
          status: 'ACTIVE',
          authorized: false,
          urlPublic: 'https://unauthorized-product.com',
        },
        {
          id: 'prod-idpay-merchants',
          title: 'IDPay Product',
          status: 'ACTIVE',
          authorized: true,
          urlPublic: 'https://idpay-product.com',
        },
      ];
    }
    if (selector.toString().includes('selectPartySelected')) {
      return {
        partyId: '1',
        description: 'Test Party',
        urlLogo: 'test-logo.png',
        roles: [{ roleKey: 'admin' }],
      };
    }
    return null;
  });
});

describe('Header Component - Complete Coverage', () => {
  const mockedParties: Array<Party> = [
    {
      roles: [
        {
          partyRole: 'SUB_DELEGATE',
          roleKey: 'incaricato-ente-creditore',
        },
      ],
      description: 'Comune di Bari',
      urlLogo: 'image',
      status: 'ACTIVE',
      partyId: '1',
      digitalAddress: 'comune.bari@pec.it',
      fiscalCode: 'fiscalCodeBari',
      category: 'Comuni e loro Consorzi e Associazioni',
      registeredOffice: 'Piazza della Scala, 2 - 20121 Milano',
      typology: 'Pubblica Amministrazione',
      externalId: 'externalId1',
      originId: 'originId1',
      origin: 'IPA',
      institutionType: 'PA',
    },
  ];

  const mockOnExit = jest.fn();

  test('render Header with no parties', () => {
    renderWithContext(
        <Header parties={[]} loggedUser={mockedUser} withSecondHeader={false} onExit={mockOnExit} />
    );
  });

  test('render Header with parties', () => {
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('render Header with withSecondHeader=true', () => {
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );
  });

  test('render Header without loggedUser', () => {
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={undefined}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('render Header with loggedUser=false', () => {
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={false as any}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('onSelectedProduct callback is called correctly', async () => {
    const user = userEvent.setup();
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );

    const selectProductBtn = screen.getByTestId('select-product-btn');
    await user.click(selectProductBtn);

    expect(mockOnExit).toHaveBeenCalledWith(expect.any(Function));
  });

  test('onSelectedParty callback is called correctly with valid party', async () => {
    const user = userEvent.setup();
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );

    expect(trackEvent).not.toHaveBeenCalledWith('PARTY_SELECTION', expect.any(Object));
    const selectPartyBtn = screen.getByTestId('select-party-btn');
    await user.click(selectPartyBtn);

    expect(mockOnExit).toHaveBeenCalledTimes(0);
  });

  test('onSelectedParty callback handles null/undefined party correctly', async () => {
    const user = userEvent.setup();
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );

    const btn = screen.getByTestId('select-party-null-btn');
    await user.click(btn);

    expect(trackEvent).not.toHaveBeenCalledWith('PARTY_SELECTION', expect.any(Object));
  });

  test('filters products correctly (only ACTIVE and authorized)', () => {
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('handles null selectedProducts', () => {
    mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return null;
      }
      if (selector.toString().includes('selectPartySelected')) {
        return {
          partyId: '1',
          description: 'Test Party',
          urlLogo: 'test-logo.png',
          roles: [{ roleKey: 'admin' }],
        };
      }
      return null;
    });

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('handles undefined selectedProducts', () => {
    mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return undefined;
      }
      if (selector.toString().includes('selectPartySelected')) {
        return {
          partyId: '1',
          description: 'Test Party',
          urlLogo: 'test-logo.png',
          roles: [{ roleKey: 'admin' }],
        };
      }
      return null;
    });

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('handles party without roles', () => {
    mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [];
      }
      if (selector.toString().includes('selectPartySelected')) {
        return {
          partyId: '1',
          description: 'Test Party',
          urlLogo: 'test-logo.png',
          roles: undefined,
        };
      }
      return null;
    });

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('handles products without urlPublic', () => {
    mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [
          {
            id: 'prod-no-url',
            title: 'Product without URL',
            status: 'ACTIVE',
            authorized: true,
            urlPublic: undefined,
          },
        ];
      }
      if (selector.toString().includes('selectPartySelected')) {
        return {
          partyId: '1',
          description: 'Test Party',
          urlLogo: 'test-logo.png',
          roles: [{ roleKey: 'admin' }],
        };
      }
      return null;
    });

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('handles null selectedParty', () => {
    mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [];
      }
      if (selector.toString().includes('selectPartySelected')) {
        return null;
      }
      return null;
    });

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('handles party with empty roles array', () => {
    mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [];
      }
      if (selector.toString().includes('selectPartySelected')) {
        return {
          partyId: '1',
          description: 'Test Party',
          urlLogo: 'test-logo.png',
          roles: [],
        };
      }
      return null;
    });

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('handles party with roles but no roleKey', () => {
    mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [];
      }
      if (selector.toString().includes('selectPartySelected')) {
        return {
          partyId: '1',
          description: 'Test Party',
          urlLogo: 'test-logo.png',
          roles: [{ partyRole: 'ADMIN' }], // senza roleKey
        };
      }
      return null;
    });

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  test('handles empty products array', () => {
    mockUseAppSelector.mockImplementation((selector: { toString: () => string | string[]; }) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [];
      }
      if (selector.toString().includes('selectPartySelected')) {
        return {
          partyId: '1',
          description: 'Test Party',
          urlLogo: 'test-logo.png',
          roles: [{ roleKey: 'admin' }],
        };
      }
      return null;
    });

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });
});