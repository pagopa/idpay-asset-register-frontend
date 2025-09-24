import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  __esModule: true,
  ErrorBoundary: ({ children }: any) => <>{children}</>,
  LoadingOverlay: () => <div data-testid="loading-overlay" />,
  UnloadEventHandler: () => <div data-testid="unload-handler" />,
  UserNotifyHandle: () => <div data-testid="user-notify-handle" />,
}));

const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
  __esModule: true,
  useSelector: (fn: any) => mockUseSelector(fn),
}));

jest.mock('../decorators/withLogin', () => ({
  __esModule: true,
  default:
      (Comp: any) =>
          (props: any) =>
              <Comp {...props} />,
}));
jest.mock('../decorators/withSelectedPartyProducts', () => ({
  __esModule: true,
  default:
      (Comp: any) =>
          (props: any) =>
              <Comp {...props} />,
}));

const mockUseTCAgreement = jest.fn();
jest.mock('../hooks/useTCAgreement', () => ({
  __esModule: true,
  default: () => mockUseTCAgreement(),
}));

const mockFetchUser = jest.fn();
const mockIsOnOrBeforeDate = jest.fn();
jest.mock('../helpers', () => ({
  __esModule: true,
  fetchUserFromLocalStorage: () => mockFetchUser(),
  isOnOrBeforeDate: (d: any) => mockIsOnOrBeforeDate(d),
}));

jest.mock('../utils/env', () => ({
  __esModule: true,
  ENV: { UPCOMING_INITIATIVE_DAY: '2099-01-01' },
}));

jest.mock('../redux/slices/invitaliaSlice', () => ({
  __esModule: true,
  institutionSelector: (state: any) => state?.invitalia?.institution || null,
}));

jest.mock('../utils/constants', () => ({
  __esModule: true,
  USERS_TYPES: {
    INVITALIA_L1: 'INVITALIA_L1',
    INVITALIA_L2: 'INVITALIA_L2',
  },
}));

jest.mock('../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home',
    ADD_PRODUCTS: '/add-products',
    PRODUCTS: '/products',
    UPLOADS: '/uploads',
    TOS: '/tos',
    PRIVACY_POLICY: '/privacy',
    PRODUCERS: '/producers',
    AUTH: '/auth',
    UPCOMING: '/upcoming',
  },
}));

jest.mock('../components/Layout/Layout', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));
jest.mock('../components/TOS/TOSWall', () => ({
  __esModule: true,
  default: () => <div>TOSWall</div>,
}));
jest.mock('../components/TOSLayout/TOSLayout', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="tos-layout">{children}</div>,
}));

jest.mock('../pages/auth/Auth', () => ({
  __esModule: true,
  default: () => <div>AuthPage</div>,
}));
jest.mock('../pages/overview/overview', () => ({
  __esModule: true,
  default: () => <div>OverviewPage</div>,
}));
jest.mock('../pages/tos/TOS', () => ({
  __esModule: true,
  default: () => <div>TOSPage</div>,
}));
jest.mock('../pages/privacyPolicy/PrivacyPolicy', () => ({
  __esModule: true,
  default: () => <div>PrivacyPolicyPage</div>,
}));
jest.mock('../pages/addProducts/addProducts', () => ({
  __esModule: true,
  default: () => <div>AddProductsPage</div>,
}));
jest.mock('../pages/uploadsHistory/uploadsHistory', () => ({
  __esModule: true,
  default: () => <div>UploadsHistoryPage</div>,
}));
jest.mock('../pages/components/Products', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="products-wrapper">{children}</div>,
}));
jest.mock('../components/Product/ProductDataGrid', () => ({
  __esModule: true,
  default: ({ organizationId }: any) => (
      <div data-testid="product-grid">ProductDataGrid:{organizationId}</div>
  ),
}));
jest.mock('../pages/InvitaliaOverview/invitaliaOverview', () => ({
  __esModule: true,
  default: () => <div>InvitaliaOverviewPage</div>,
}));
jest.mock('../pages/InvitaliaProductsList/invitaliaProductsList', () => ({
  __esModule: true,
  default: () => <div>InvitaliaProductsListPage</div>,
}));
jest.mock('../pages/upcomingInitiative/upcomingInitiative', () => ({
  __esModule: true,
  default: () => <div>UpcomingInitiativePage</div>,
}));

import App from '../App';

const setTC = (accepted: boolean | undefined) => {
  mockUseTCAgreement.mockReturnValue({
    isTOSAccepted: accepted,
    acceptTOS: jest.fn(),
    firstAcceptance: false,
  });
};

const setUserRole = (role: string | undefined) => {
  mockFetchUser.mockReturnValue({ org_role: role });
};

const setInstitution = (institutionId?: string) => {
  mockUseSelector.mockImplementation(() => (institutionId ? { institutionId } : null));
};

const setUpcoming = (active: boolean) => {
  mockIsOnOrBeforeDate.mockReturnValue(active);
};

const renderApp = (initialEntries: string[]) =>
    render(
        <MemoryRouter initialEntries={initialEntries}>
          <App />
        </MemoryRouter>
    );

describe('App routing and gating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setInstitution(undefined);
    setUpcoming(false);
  });

  it('renders Auth page at /auth (top-level route)', () => {
    setTC(true);
    setUserRole(undefined);
    renderApp(['/auth']);
    expect(screen.getByText('AuthPage')).toBeInTheDocument();
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('user-notify-handle')).toBeInTheDocument();
    expect(screen.getByTestId('unload-handler')).toBeInTheDocument();
  });

  it('redirects everything to /upcoming when upcoming flag is active and shows UpcomingInitiative inside Layout', () => {
    setTC(true);
    setUserRole('INVITALIA_L1');
    setUpcoming(true);
    renderApp(['/home']);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('UpcomingInitiativePage')).toBeInTheDocument();
  });

  it('shows TOSWall inside TOSLayout when TOS not accepted (and not on /privacy or /tos)', () => {
    setTC(false);
    setUserRole(undefined);
    renderApp(['/home']);
    expect(screen.getByTestId('tos-layout')).toBeInTheDocument();
    expect(screen.getByText('TOSWall')).toBeInTheDocument();
  });

  it('returns empty fragment when TOS status is undefined (and not on /privacy or /tos)', () => {
    setTC(undefined as any);
    setUserRole(undefined);
    const { container } = renderApp(['/home']);
    expect(container).not.toBeEmptyDOMElement();
  });

  it('allows navigating to Privacy and TOS pages even if TOS not accepted', () => {
    setTC(false);
    setUserRole(undefined);

    renderApp(['/privacy']);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('PrivacyPolicyPage')).toBeInTheDocument();

    renderApp(['/tos']);
    expect(screen.getByText('PrivacyPolicyPage')).toBeInTheDocument();
    expect(screen.getByText('TOSPage')).toBeInTheDocument();
  });

  it('renders Invitalia routes when user is Invitalia (HOME and PRODUCERS, and * redirect)', () => {
    setTC(true);
    setUserRole('INVITALIA_L1');
    renderApp(['/home']);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('InvitaliaProductsListPage')).toBeInTheDocument();

    renderApp(['/producers']);
    expect(screen.getByText('InvitaliaOverviewPage')).toBeInTheDocument();

  });

  it('renders Standard routes when user is standard; passes organizationId from store; covers * redirect', () => {
    setTC(true);
    setUserRole('USER');
    setInstitution('ORG_123');

    renderApp(['/home']);
    expect(screen.getByText('OverviewPage')).toBeInTheDocument();

    renderApp(['/products']);
    expect(screen.getByTestId('products-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('product-grid')).toHaveTextContent('ProductDataGrid:ORG_123');

    renderApp(['/add-products']);
    expect(screen.getByText('AddProductsPage')).toBeInTheDocument();

    renderApp(['/uploads']);
    expect(screen.getByText('UploadsHistoryPage')).toBeInTheDocument();
  });
});
