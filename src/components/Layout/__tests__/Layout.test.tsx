import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Layout from '../Layout';
import '@testing-library/jest-dom';

jest.mock('../../../utils/env', () => ({
  __esModule: true,
  ENV: {
    URL_FE: {
      LOGOUT: 'https://mock-logout-url.com',
    },
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

jest.mock('../../Header/Header', () => {
  return function MockHeader({ onExit, withSecondHeader }: any) {
    return (
        <div data-testid="mock-header">
          <button data-testid="exit-button" onClick={onExit}>
            Exit
          </button>
          <span data-testid="second-header-flag">{String(withSecondHeader)}</span>
        </div>
    );
  };
});

jest.mock('../../SideMenu/SideMenu', () => () => <div data-testid="mock-sidemenu" />);

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  Footer: ({ onExit }: any) => (
      <div data-testid="mock-footer">
        <button data-testid="footer-exit-button" onClick={onExit}>
          Footer Exit
        </button>
      </div>
  ),
}));

const mockOnExit = jest.fn((callback) => callback);

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
  useUnloadEventOnExit: () => mockOnExit,
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: {
    delete: jest.fn(),
  },
  storageUserOps: {
    delete: jest.fn(),
  },
}));

const mockLoggedUser = {
  uid: '123',
  name: 'Mario',
  surname: 'Rossi',
  email: 'mario.rossi@example.com',
};

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice', () => ({
  userSelectors: {
    selectLoggedUser: jest.fn(() => mockLoggedUser),
  },
}));

describe('Layout component', () => {
  const createTestStore = () =>
      configureStore({
        reducer: {
          user: (state = { logged: mockLoggedUser }) => state,
        },
      });

  let localStorageMock: { [key: string]: string };
  let sessionStorageMock: { [key: string]: string };
  let originalObjectKeys: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const { storageTokenOps, storageUserOps } = require('@pagopa/selfcare-common-frontend/lib/utils/storage');
    storageTokenOps.delete.mockClear();
    storageUserOps.delete.mockClear();

    mockOnExit.mockClear();

    originalObjectKeys = Object.keys;

    delete (window as any).location;
    (window as any).location = { assign: jest.fn() };

    localStorageMock = {
      'filter_something': 'value',
      'user': 'userdata',
      'token': 'tokendata',
      'persist:root': 'persistdata',
      'other_key': 'othervalue',
    };

    sessionStorageMock = {
      'filter_test': 'value',
      'user': 'userdata',
      'token': 'tokendata',
      'keep_this': 'keepvalue',
    };

    const localStorageRemoveMock = jest.fn((key: string) => {
      delete localStorageMock[key];
    });

    const sessionStorageRemoveMock = jest.fn((key: string) => {
      delete sessionStorageMock[key];
    });

    global.Object.keys = jest.fn((obj: any) => {
      if (obj === localStorage) {
        return Object.keys(localStorageMock);
      }
      if (obj === sessionStorage) {
        return Object.keys(sessionStorageMock);
      }
      return originalObjectKeys(obj);
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: localStorageRemoveMock,
        clear: jest.fn(),
        key: jest.fn((index: number) => Object.keys(localStorageMock)[index] || null),
        get length() {
          return Object.keys(localStorageMock).length;
        },
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => sessionStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          sessionStorageMock[key] = value;
        }),
        removeItem: sessionStorageRemoveMock,
        clear: jest.fn(),
        key: jest.fn((index: number) => Object.keys(sessionStorageMock)[index] || null),
        get length() {
          return Object.keys(sessionStorageMock).length;
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    global.Object.keys = originalObjectKeys;
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

  it('renders correctly with /products route', () => {
    const store = createTestStore();

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/products']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByTestId('mock-sidemenu')).toBeInTheDocument();
  });

  it('renders correctly with /invitalia-products route', () => {
    const store = createTestStore();

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/invitalia-products']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByTestId('mock-sidemenu')).toBeInTheDocument();
  });

  it('renders correctly with /producers route', () => {
    const store = createTestStore();

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/producers']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByTestId('mock-sidemenu')).toBeInTheDocument();
  });

  it('renders correctly with /uploads route', () => {
    const store = createTestStore();

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/uploads']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByTestId('mock-sidemenu')).toBeInTheDocument();
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

  it('renders correctly with /tos route (maxWidth 100%)', () => {
    const store = createTestStore();

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/tos']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    expect(screen.queryByTestId('mock-sidemenu')).not.toBeInTheDocument();
  });

  it('hides assistance info when on /assistance route', () => {
    const store = createTestStore();

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/assistance']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    expect(screen.getByTestId('second-header-flag')).toHaveTextContent('false');
  });

  it('shows assistance info when not on /assistance route', () => {
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

    expect(screen.getByTestId('second-header-flag')).toHaveTextContent('true');
  });

  it('calls customExitAction when Header exit is triggered', async () => {
    const store = createTestStore();
    const { storageTokenOps, storageUserOps } = require('@pagopa/selfcare-common-frontend/lib/utils/storage');

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/home']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    const exitButton = screen.getByTestId('exit-button');
    exitButton.click();

    await waitFor(() => {
      expect(storageTokenOps.delete).not.toHaveBeenCalled();
      expect(storageUserOps.delete).not.toHaveBeenCalled();
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('filter_something');
    });
  });

  it('calls customExitAction when Footer exit is triggered', async () => {
    const store = createTestStore();
    const { storageTokenOps, storageUserOps } = require('@pagopa/selfcare-common-frontend/lib/utils/storage');

    render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/home']}>
            <Layout>
              <div data-testid="layout-children" />
            </Layout>
          </MemoryRouter>
        </Provider>
    );

    const footerExitButton = screen.getByTestId('footer-exit-button');
    footerExitButton.click();

    await waitFor(() => {
      expect(storageTokenOps.delete).not.toHaveBeenCalled();
      expect(storageUserOps.delete).not.toHaveBeenCalled();
    });
  });

  it('clears sessionStorage items on exit', async () => {
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

    const exitButton = screen.getByTestId('exit-button');
    exitButton.click();

    await waitFor(() => {
      expect(sessionStorage.removeItem).not.toHaveBeenCalledWith('filter_test');
      expect(sessionStorage.removeItem).not.toHaveBeenCalledWith('token');
    });
  });

  it('does not remove other keys from localStorage', async () => {
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

    const exitButton = screen.getByTestId('exit-button');
    exitButton.click();

    await waitFor(() => {
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('other_key');
    });
  });

  it('does not remove other keys from sessionStorage', async () => {
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

    const exitButton = screen.getByTestId('exit-button');
    exitButton.click();

    await waitFor(() => {
      expect(sessionStorage.removeItem).not.toHaveBeenCalledWith('keep_this');
    });
  });
});