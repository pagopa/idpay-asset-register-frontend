import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Layout from '../Layout';
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
    HOME: '/home',
    PRODUCTS: '/products',
    PRODUCERS: '/producers',
    INVITALIA_PRODUCTS_LIST: '/invitalia-products',
    UPLOADS: '/uploads',
    ASSISTANCE: '/assistance',
    PRIVACY_POLICY: '/privacy-policy',
    TOS: '/tos',
  },
  BASE_ROUTE: '/base',
}));

jest.mock('../../../api/registerApiClient', () => ({
  RolePermissionApi: {
    getPortalConsent: jest.fn(),
    savePortalConsent: jest.fn(),
  },
}));

jest.mock('../../Header/Header', () => () => <div data-testid="mock-header" />);
jest.mock('../../SideMenu/SideMenu', () => () => <div data-testid="mock-sidemenu" />);
jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  Footer: () => <div data-testid="mock-footer" />,
}));
jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
  useUnloadEventOnExit: () => jest.fn(),
}));

const userSliceMock = {
  reducer: () => ({
    loggedUser: {
      uid: '123',
      name: 'Mario',
      surname: 'Rossi',
      email: 'mario.rossi@example.com',
    },
  }),
};

describe('Layout component', () => {
  const createTestStore = () =>
      configureStore({
        reducer: {
          user: userSliceMock.reducer,
        },
      });

  it('renders correctly with a matched route (e.g. /home)', () => {
    const store = createTestStore();

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/home']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidemenu')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('layout-children')).toBeInTheDocument();
  });

  it('renders correctly with a non-matched route (e.g. /privacy-policy)', () => {
    const store = createTestStore();

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/privacy-policy']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-sidemenu')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('layout-children')).toBeInTheDocument();
  });
});
