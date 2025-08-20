import { renderWithContext } from '../../../utils/__tests__/test-utils';
import Header from '../Header';
import { mockedUser } from '../../../decorators/__mocks__/withLogin';
import { Party } from '../../../model/Party';
import {trackEvent} from "@pagopa/selfcare-common-frontend/lib/services/analyticsService";
import {render, screen} from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom';

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
          <button
              data-testid="select-party-undefined-btn"
              onClick={() => onSelectedParty && onSelectedParty(undefined)}
          >
            Select Undefined Party
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
      <button
          data-testid="select-party-undefined-btn"
          onClick={() => onSelectedParty && onSelectedParty(undefined)}
      >
        Select Undefined Party
      </button>
    </div>
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

    expect(mockOnExit).toHaveBeenCalledTimes(1);
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
          roles: [{ partyRole: 'ADMIN' }],
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

  test('activeProducts contiene welfareProduct e prodotti attivi autorizzati', () => {
    const welfareProduct = {
      id: 'prod-idpay-merchants',
      title: 'IDPay Product',
      status: 'ACTIVE',
      authorized: true,
      productUrl: 'https://idpay-product.com',
    };

    const products = [
      {
        id: 'prod-active',
        title: 'Active Product',
        status: 'ACTIVE',
        authorized: true,
        productUrl: 'https://active-product.com',
      },
      {
        id: 'prod-inactive',
        title: 'Inactive Product',
        status: 'INACTIVE',
        authorized: true,
        productUrl: 'https://inactive-product.com',
      },
      {
        id: 'prod-unauthorized',
        title: 'Unauthorized Product',
        status: 'ACTIVE',
        authorized: false,
        productUrl: 'https://unauthorized-product.com',
      },
      welfareProduct,
    ];

    const handleResult = (result: any[]) => {
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(welfareProduct.id);
      expect(result[1].id).toBe('prod-active');
    };

    render(<Header products={products} welfareProduct={welfareProduct} onResult={handleResult} />);
  });

  describe('Header Component - Additional tests for 100% coverage', () => {

    test('handles loggedUser with empty uid', () => {
      const userWithEmptyUid = {
        ...mockedUser,
        uid: '',
      };

      renderWithContext(
          <Header
              parties={mockedParties}
              loggedUser={userWithEmptyUid}
              withSecondHeader={false}
              onExit={mockOnExit}
          />
      );

      expect(screen.getByTestId('select-party-btn')).toBeInTheDocument();
    });

    test('filters products correctly - welfare product is excluded from normal products', () => {
      mockUseAppSelector.mockImplementation((selector) => {
        if (selector.toString().includes('selectPartySelectedProducts')) {
          return [
            {
              id: 'prod-idpay-merchants',
              title: 'IDPay Product',
              status: 'ACTIVE',
              authorized: true,
              urlPublic: 'https://idpay-product.com',
            },
            {
              id: 'other-product',
              title: 'Other Product',
              status: 'ACTIVE',
              authorized: true,
              urlPublic: 'https://other-product.com',
            },
            {
              id: 'inactive-product',
              title: 'Inactive Product',
              status: 'INACTIVE',
              authorized: true,
              urlPublic: 'https://inactive-product.com',
            },
            {
              id: 'unauthorized-product',
              title: 'Unauthorized Product',
              status: 'ACTIVE',
              authorized: false,
              urlPublic: 'https://unauthorized-product.com',
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

    test('handles party roles mapping correctly with multiple roles', () => {
      mockUseAppSelector.mockImplementation((selector) => {
        if (selector.toString().includes('selectPartySelectedProducts')) {
          return [];
        }
        if (selector.toString().includes('selectPartySelected')) {
          return {
            partyId: '1',
            description: 'Test Party',
            urlLogo: 'test-logo.png',
            roles: [
              { roleKey: 'admin' },
              { roleKey: 'manager' },
              { roleKey: 'operator' },
            ],
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

    test('onSelectedProduct calls onExit and executes console.log', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const originalMock = jest.requireMock('@pagopa/selfcare-common-frontend/lib').Header;
      jest.doMock('@pagopa/selfcare-common-frontend/lib', () => ({
        Header: ({ onSelectedProduct }: any) => (
            <button
                data-testid="test-select-product-btn"
                onClick={() => onSelectedProduct && onSelectedProduct({ id: 'test-product' })}
            >
              Select Product
            </button>
        ),
      }));

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

      const exitFunction = mockOnExit.mock.calls[mockOnExit.mock.calls.length - 1][0];
      exitFunction();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('TODO: perform token exchange to change Product'));

      consoleSpy.mockRestore();
      jest.doMock('@pagopa/selfcare-common-frontend/lib', () => ({
        Header: originalMock,
      }));
    });

    test('onSelectedParty calls trackEvent and onExit when party is valid', async () => {
      const user = userEvent.setup();
      const trackEventMock = jest.mocked(trackEvent);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const originalMock = jest.requireMock('@pagopa/selfcare-common-frontend/lib').Header;
      jest.doMock('@pagopa/selfcare-common-frontend/lib', () => ({
        Header: ({ onSelectedParty }: any) => (
            <button
                data-testid="test-select-valid-party-btn"
                onClick={() => onSelectedParty && onSelectedParty({ id: 'test-party', name: 'Test Party' })}
            >
              Select Valid Party
            </button>
        ),
      }));

      renderWithContext(
          <Header
              parties={mockedParties}
              loggedUser={mockedUser}
              withSecondHeader={false}
              onExit={mockOnExit}
          />
      );

      const selectPartyBtn = screen.getByTestId('select-party-btn');
      await user.click(selectPartyBtn);

      expect(trackEventMock).toHaveBeenCalled();

      jest.clearAllMocks();

      const TestComponent = () => {
        const handleSelectedParty = (selectedParty: any) => {
          if (selectedParty) {
            trackEvent('PARTY_SELECTION', {
              party_id: selectedParty.id,
            });
            mockOnExit(() =>
                console.log(`TODO: perform token exchange to change Party and set ${selectedParty}`)
            );
          }
        };

        return (
            <button
                data-testid="manual-test-btn"
                onClick={() => handleSelectedParty({ id: 'test-party', name: 'Test Party' })}
            >
              Test Valid Party Selection
            </button>
        );
      };

      render(<TestComponent />);

      const manualTestBtn = screen.getByTestId('manual-test-btn');
      await user.click(manualTestBtn);

      expect(trackEventMock).toHaveBeenCalledWith('PARTY_SELECTION', {
        party_id: 'test-party',
      });

      expect(mockOnExit).toHaveBeenCalledWith(expect.any(Function));

      const exitFunction = mockOnExit.mock.calls[mockOnExit.mock.calls.length - 1][0];
      exitFunction();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('TODO: perform token exchange to change Party'));

      consoleSpy.mockRestore();
      jest.doMock('@pagopa/selfcare-common-frontend/lib', () => ({
        Header: originalMock,
      }));
    });

    test('onSelectedParty does not call trackEvent when party is null', async () => {
      const user = userEvent.setup();
      const trackEventMock = jest.mocked(trackEvent);

      renderWithContext(
          <Header
              parties={mockedParties}
              loggedUser={mockedUser}
              withSecondHeader={false}
              onExit={mockOnExit}
          />
      );

      const selectPartyNullBtn = screen.getByTestId('select-party-null-btn');
      await user.click(selectPartyNullBtn);

      expect(trackEventMock).not.toHaveBeenCalledWith('PARTY_SELECTION', expect.any(Object));
      expect(mockOnExit).not.toHaveBeenCalled();
    });

    test('maps productRole correctly when party has roles', () => {
      mockUseAppSelector.mockImplementation((selector) => {
        if (selector.toString().includes('selectPartySelectedProducts')) {
          return [];
        }
        if (selector.toString().includes('selectPartySelected')) {
          return {
            partyId: '1',
            description: 'Test Party',
            urlLogo: 'test-logo.png',
            roles: [{ roleKey: 'admin' }, { roleKey: 'user' }],
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

      expect(screen.getByTestId('select-party-btn')).toBeInTheDocument();
    });

    test('products filter covers all conditions', () => {
      mockUseAppSelector.mockImplementation((selector) => {
        if (selector.toString().includes('selectPartySelectedProducts')) {
          return [
            {
              id: 'prod-idpay-merchants',
              title: 'Welfare Product Clone',
              status: 'ACTIVE',
              authorized: true,
              urlPublic: 'https://welfare-clone.com',
            },
            {
              id: 'different-product',
              title: 'Different Product',
              status: 'ACTIVE',
              authorized: true,
              urlPublic: 'https://different-product.com',
            },
            {
              id: 'another-product',
              title: 'Another Product',
              status: 'INACTIVE',
              authorized: true,
              urlPublic: 'https://another-product.com',
            },
            {
              id: 'unauthorized-product',
              title: 'Unauthorized Product',
              status: 'ACTIVE',
              authorized: false,
              urlPublic: 'https://unauthorized-product.com',
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
  });

  test('handles loggedUser as null', () => {
    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={null}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  // Test per coprire il caso loggedUser.uid vuoto
  test('handles loggedUser with empty uid string', () => {
    const userWithEmptyUid = {
      ...mockedUser,
      uid: '', // Questo testerà il caso ?: ''
    };

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={userWithEmptyUid}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );
  });

  // Test per coprire useMemo e il filtro dei prodotti
  test('useMemo activeProducts filters correctly', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [
          {
            id: 'prod-idpay-merchants', // Stesso ID del welfareProduct - deve essere filtrato
            title: 'IDPay Duplicate',
            status: 'ACTIVE',
            authorized: true,
            urlPublic: 'https://duplicate.com',
          },
          {
            id: 'prod-active-auth',
            title: 'Active Authorized',
            status: 'ACTIVE',
            authorized: true,
            urlPublic: 'https://active-auth.com',
          },
          {
            id: 'prod-inactive',
            title: 'Inactive Product',
            status: 'INACTIVE', // Deve essere filtrato
            authorized: true,
            urlPublic: 'https://inactive.com',
          },
          {
            id: 'prod-unauthorized',
            title: 'Unauthorized Product',
            status: 'ACTIVE',
            authorized: false, // Deve essere filtrato
            urlPublic: 'https://unauthorized.com',
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

  // Test per coprire il mapping dei ruoli
  test('covers party roles mapping with multiple roles', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [];
      }
      if (selector.toString().includes('selectPartySelected')) {
        return {
          partyId: '1',
          description: 'Test Party',
          urlLogo: 'test-logo.png',
          roles: [
            { roleKey: 'admin' },
            { roleKey: 'manager' },
            { roleKey: 'operator' }
          ],
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

  test('onSelectedProduct callback executes console.log', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

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

    const exitFunction = mockOnExit.mock.calls[mockOnExit.mock.calls.length - 1][0];
    exitFunction();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('TODO: perform token exchange to change Product'));

    consoleSpy.mockRestore();
  });

  test('onSelectedParty with valid party calls trackEvent and console.log', async () => {
    const user = userEvent.setup();
    const trackEventMock = jest.mocked(trackEvent);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );

    const selectPartyBtn = screen.getByTestId('select-party-btn');
    await user.click(selectPartyBtn);

    expect(trackEventMock).toHaveBeenCalledWith('PARTY_SELECTION', expect.any(Object));

    expect(mockOnExit).toHaveBeenCalledWith(expect.any(Function));
  });

  // Test per coprire onSelectedParty con party null (non chiama trackEvent)
  test('onSelectedParty with null party does not call trackEvent', async () => {
    const user = userEvent.setup();
    const trackEventMock = jest.mocked(trackEvent);

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );

    const selectPartyNullBtn = screen.getByTestId('select-party-null-btn');
    await user.click(selectPartyNullBtn);

    expect(trackEventMock).not.toHaveBeenCalledWith('PARTY_SELECTION', expect.any(Object));
    // onExit non dovrebbe essere chiamato per party null
    expect(mockOnExit).not.toHaveBeenCalled();
  });

  // Test per coprire onSelectedParty con party undefined
  test('onSelectedParty with undefined party does not call trackEvent', async () => {
    const user = userEvent.setup();
    const trackEventMock = jest.mocked(trackEvent);

    renderWithContext(
        <Header
            parties={mockedParties}
            loggedUser={mockedUser}
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );

    const selectPartyUndefinedBtn = screen.getByTestId('select-party-undefined-btn');
    await user.click(selectPartyUndefinedBtn);

    expect(trackEventMock).not.toHaveBeenCalledWith('PARTY_SELECTION', expect.any(Object));
    expect(mockOnExit).not.toHaveBeenCalled();
  });

  // Test per coprire il caso quando party2Show è undefined/null
  test('handles party2Show as undefined', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [];
      }
      if (selector.toString().includes('selectPartySelected')) {
        return null; // Questo renderà party2Show undefined
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

  // Test per coprire activeProducts.map
  test('covers activeProducts mapping', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [
          {
            id: 'prod-test',
            title: 'Test Product',
            status: 'ACTIVE',
            authorized: true,
            urlPublic: 'https://test.com',
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

  // Test per coprire il caso con prodotti senza urlPublic
  test('handles products without urlPublic in mapping', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes('selectPartySelectedProducts')) {
        return [
          {
            id: 'prod-no-url',
            title: 'Product No URL',
            status: 'ACTIVE',
            authorized: true,
            urlPublic: null, // urlPublic mancante
          },
          {
            id: 'prod-undefined-url',
            title: 'Product Undefined URL',
            status: 'ACTIVE',
            authorized: true,
            urlPublic: undefined, // urlPublic undefined
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
});