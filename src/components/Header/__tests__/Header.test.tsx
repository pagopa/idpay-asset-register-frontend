import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { useAppSelector } from '../../../redux/hooks';
import { partiesSelectors } from '../../../redux/slices/partiesSlice';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { ENV } from '../../../utils/env';
import CustomHeader from '../CustomHeader';

jest.mock('react-i18next');
jest.mock('../../../redux/hooks');
jest.mock('../../../redux/slices/partiesSlice');
jest.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService');
jest.mock('@pagopa/selfcare-common-frontend/lib/config/env');
jest.mock('../../../utils/env');
jest.mock('../CustomHeader', () => {
  return jest.fn(() => <div data-testid="custom-header">Custom Header</div>);
});

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<typeof useAppSelector>;
const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>;

describe('Header Component', () => {
  const mockT = (key: string) => key;
  const mockOnExit = jest.fn();

  const mockLoggedUser = {
    uid: 'user-123',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
  };

  const mockSelectedParty = {
    partyId: 'party-1',
    description: 'Party One',
    roles: [
      { roleKey: 'admin' },
      { roleKey: 'user' },
    ],
    urlLogo: 'https://example.com/logo.png',
  };

  const mockProducts = [
    {
      id: 'prod-1',
      title: 'Product 1',
      urlPublic: 'https://example.com/prod1',
      status: 'ACTIVE',
      authorized: true,
    },
    {
      id: 'prod-2',
      title: 'Product 2',
      urlPublic: 'https://example.com/prod2',
      status: 'ACTIVE',
      authorized: true,
    },
    {
      id: 'prod-3',
      title: 'Inactive Product',
      urlPublic: 'https://example.com/prod3',
      status: 'INACTIVE',
      authorized: true,
    },
    {
      id: 'prod-4',
      title: 'Unauthorized Product',
      urlPublic: 'https://example.com/prod4',
      status: 'ACTIVE',
      authorized: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {} as any,
    });
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === partiesSelectors.selectPartySelectedProducts) {
        return mockProducts;
      }
      if (selector === partiesSelectors.selectPartySelected) {
        return mockSelectedParty;
      }
      return undefined;
    });
    (CONFIG.HEADER.LINK.PRODUCTURL as any) = 'https://example.com/welfare';
    (ENV.URL_FE.EIE_MANUAL as any) = 'https://example.com/manual';
    (ENV.ASSISTANCE.EMAIL as any) = 'support@example.com';
  });

  it('should pass correct props to CustomHeader', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
            loggedUser={mockLoggedUser}
        />
    );

    expect(CustomHeader).toHaveBeenCalledWith(
        expect.objectContaining({
          withSecondHeader: true,
          onExit: mockOnExit,
          selectedPartyId: 'party-1',
          selectedProductId: 'prod-idpay-asset-register',
          addSelfcareProduct: false,
          assistanceEmail: 'support@example.com',
          enableLogin: true,
        }),
        expect.anything()
    );
  });

  it('should filter products correctly (active and authorized only)', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
            loggedUser={mockLoggedUser}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.productsList).toHaveLength(3);
    expect(call.productsList[0].id).toBe('prod-idpay-asset-register');
    expect(call.productsList[1].id).toBe('prod-1');
    expect(call.productsList[2].id).toBe('prod-2');
  });

  it('should include welfare product as first item in products list', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.productsList[0]).toEqual({
      id: 'prod-idpay-asset-register',
      title: 'commons.title',
      productUrl: '',
      linkType: 'internal',
    });
  });

  it('should exclude products with status INACTIVE', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    const productIds = call.productsList.map((p: any) => p.id);
    expect(productIds).not.toContain('prod-3');
  });

  it('should exclude products with authorized false', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    const productIds = call.productsList.map((p: any) => p.id);
    expect(productIds).not.toContain('prod-4');
  });

  it('should map party data correctly', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.partyList).toEqual(undefined);
  });

  it('should handle loggedUser mapping correctly', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
            loggedUser={mockLoggedUser}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.loggedUser).toEqual({
      id: 'user-123',
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
    });
  });

  it('should pass false for loggedUser when not provided', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.loggedUser).toBe(false);
  });

  it('should call onDocumentationClick with correct URL', async () => {
    const mockOpen = jest.fn();
    global.window.open = mockOpen;

    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    call.onDocumentationClick();

    expect(mockOpen).toHaveBeenCalledWith('https://example.com/manual', '_blank');
  });

  it('should handle onSelectedProduct callback', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    const mockProduct = { id: 'new-product' };

    call.onSelectedProduct(mockProduct);

    expect(mockOnExit).toHaveBeenCalled();
  });

  it('should handle onSelectedParty callback', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    const mockParty = { id: 'party-2', name: 'Party Two' };

    call.onSelectedParty(mockParty);

    expect(mockTrackEvent).toHaveBeenCalledWith('PARTY_SELECTION', {
      party_id: 'party-2',
    });
    expect(mockOnExit).toHaveBeenCalled();
  });

  it('should not call onExit if onSelectedParty receives falsy value', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];

    call.onSelectedParty(null);

    expect(mockOnExit).not.toHaveBeenCalled();
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('should update party2Show when selectedParty changes', async () => {
    const { rerender } = render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const newSelectedParty = {
      partyId: 'party-2',
      description: 'Party Two',
      roles: [{ roleKey: 'viewer' }],
      urlLogo: 'https://example.com/logo2.png',
    };

    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === partiesSelectors.selectPartySelectedProducts) {
        return mockProducts;
      }
      if (selector === partiesSelectors.selectPartySelected) {
        return newSelectedParty;
      }
      return undefined;
    });

    rerender(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    await waitFor(() => {
      const call = (CustomHeader as jest.Mock).mock.calls[
      (CustomHeader as jest.Mock).mock.calls.length - 1
          ][0];
      expect(call.partyList[0].id).toBe('party-2');
    });
  });

  it('should handle undefined products gracefully', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === partiesSelectors.selectPartySelectedProducts) {
        return undefined;
      }
      if (selector === partiesSelectors.selectPartySelected) {
        return mockSelectedParty;
      }
      return undefined;
    });

    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.productsList).toEqual([
      {
        id: 'prod-idpay-asset-register',
        title: 'commons.title',
        productUrl: '',
        linkType: 'internal',
      },
    ]);
  });

  it('should handle empty products array', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === partiesSelectors.selectPartySelectedProducts) {
        return [];
      }
      if (selector === partiesSelectors.selectPartySelected) {
        return mockSelectedParty;
      }
      return undefined;
    });

    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.productsList).toHaveLength(1);
    expect(call.productsList[0].id).toBe('prod-idpay-asset-register');
  });

  it('should pass withSecondHeader prop correctly', () => {
    const { rerender } = render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    let call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.withSecondHeader).toBe(true);

    (CustomHeader as jest.Mock).mockClear();

    rerender(
        <Header
            withSecondHeader={false}
            onExit={mockOnExit}
        />
    );

    call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.withSecondHeader).toBe(false);
  });

  it('should have correct default prop values for CustomHeader', () => {
    render(
        <Header
            withSecondHeader={true}
            onExit={mockOnExit}
        />
    );

    const call = (CustomHeader as jest.Mock).mock.calls[0][0];
    expect(call.addSelfcareProduct).toBe(false);
    expect(call.enableLogin).toBe(true);
    expect(call.selectedProductId).toBe('prod-idpay-asset-register');
  });
});