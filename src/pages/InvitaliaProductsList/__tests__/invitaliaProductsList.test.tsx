import InvitaliaProductsList from '../invitaliaProductsList';

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({ data: [], isLoading: false }),
}));

jest.mock('../../../utils/env', () => ({
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

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    HOME: '/home',
  },
  BASE_ROUTE: '/base',
}));

jest.mock('../../../api/registerApiClient', () => ({
  RegisterApi: {
    getProducts: jest.fn(),
    getBatchFilterItems: jest.fn(),
  },
}));
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.backBtn': 'Indietro',
        'breadcrumbs.home': 'Home',
      };
      return translations[key] || key;
    },
  }),
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...(Component.defaultProps || {}), t: (k: string) => k };
    return Component;
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
  useUnloadEventOnExit: () => (callback: () => void) => callback(),
}));

jest.mock('../InstitutionInfoCard', () => () => <div data-testid="institution-info-card" />);
jest.mock(
  '../../../components/Product/ProductDataGrid',
  () =>
    ({ organizationId }: { organizationId: string }) =>
      <div data-testid="product-grid">Org ID: {organizationId}</div>
);

jest.mock('../../../components/Product/MsgResult', () => ({
  __esModule: true,
  default: ({ message }: any) => <div data-testid="msg-result">{message}</div>,
}));

const mockInstitution = {
  institutionId: '12345',
  description: 'Test Institution',
};

const createMockStore = (institution: any) => {
  const invitaliaSlice = createSlice({
    name: 'invitalia',
    initialState: { institution },
    reducers: {},
  });

  return configureStore({
    reducer: {
      invitalia: invitaliaSlice.reducer,
    },
  });
};

const renderComponent = (institution = mockInstitution) => {
  const store = createMockStore(institution);
  const theme = createTheme();

  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/',
              state: { organizationId: institution?.institutionId ?? '' },
            } as any,
          ]}
        >
          <InvitaliaProductsList />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('InvitaliaProductsList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders ProductGrid with institutionId', () => {
    renderComponent();

    expect(screen.getByTestId('product-grid')).toHaveTextContent('Org ID: 12345');
  });

  it('passes empty organizationId when institution is null', () => {
    renderComponent(null as any);

    expect(screen.getByTestId('product-grid')).toHaveTextContent('Org ID:');
  });

  it('shows success MsgResult when INVITALIA_MSG_SHOW event is dispatched', async () => {
    renderComponent();

    window.dispatchEvent(new Event('INVITALIA_MSG_SHOW'));

    await screen.findByTestId('msg-result');
    expect(screen.getByTestId('msg-result')).toHaveTextContent(
      'invitaliaModal.waitApproved.msgResultWaitApproved'
    );
  });

  it('hides MsgResult when INVITALIA_MSG_DISMISS event is dispatched', async () => {
    renderComponent();

    await act(async () => {
      window.dispatchEvent(new Event('INVITALIA_MSG_SHOW'));
    });
    await screen.findByTestId('msg-result');

    await act(async () => {
      window.dispatchEvent(new Event('INVITALIA_MSG_DISMISS'));
    });

    expect(screen.queryByTestId('msg-result')).not.toBeInTheDocument();
  });

  it('auto hides MsgResult after 10 seconds timeout', async () => {
    renderComponent();

    await act(async () => {
      window.dispatchEvent(new Event('INVITALIA_MSG_SHOW'));
    });
    await screen.findByTestId('msg-result');

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.queryByTestId('msg-result')).not.toBeInTheDocument();
  });
});
