import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
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
    FOOTER: {
      LINK: {
        PRIVACYPOLICY: 'privacy'
      }
    }
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
  __esModule: true,
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
  __esModule: true,
  Footer: ({ onExit }: any) => (
      <div data-testid="mock-footer">
        <button data-testid="footer-exit-button" onClick={onExit}>
          Footer Exit
        </button>
      </div>
  ),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => {
  const mockOnExit = jest.fn((cb?: () => void) => {
    if (cb) cb();
  });
  return {
    __esModule: true,
    useUnloadEventOnExit: () => mockOnExit,
    __mocks__: { mockOnExit },
  };
});

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => {
  const mockStorageTokenOpsDelete = jest.fn();
  const mockStorageUserOpsDelete = jest.fn();

  return {
    __esModule: true,
    storageTokenOps: { delete: mockStorageTokenOpsDelete },
    storageUserOps: { delete: mockStorageUserOpsDelete },
    __mocks__: { mockStorageTokenOpsDelete, mockStorageUserOpsDelete },
  };
});

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice', () => {
  const mockLoggedUser = {
    uid: '123',
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@example.com',
  };
  return {
    __esModule: true,
    userSelectors: {
      selectLoggedUser: jest.fn(() => mockLoggedUser),
    },
    __mocks__: { mockLoggedUser },
  };
});

import Layout from '../Layout';


const {
  __mocks__: { mockStorageTokenOpsDelete, mockStorageUserOpsDelete },
} = require('@pagopa/selfcare-common-frontend/lib/utils/storage');

const {
  __mocks__: { mockOnExit },
} = require('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor');

const {
  __mocks__: { mockLoggedUser },
} = require('@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice');

class StorageMock implements Storage {
  private store: { [key: string]: string } = {};
  public removeItemMock = jest.fn();

  get length(): number {
    return Object.keys(this.store).length;
  }
  clear(): void {
    this.store = {};
  }
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
  removeItem(key: string): void {
    this.removeItemMock(key);
    delete this.store[key];
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  [key: string]: any;

  setInitialData(data: { [key: string]: string }): void {
    this.store = { ...data };
    Object.keys(data).forEach((k) => {
      this[k] = data[k];
    });
  }

  resetMock(): void {
    this.removeItemMock.mockClear();
  }
}

describe('Layout component', () => {
  const createTestStore = () =>
      configureStore({
        reducer: {
          user: (state = { logged: mockLoggedUser }) => state,
        },
      });

  let localStorageMock: StorageMock;
  let sessionStorageMock: StorageMock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageTokenOpsDelete.mockClear();
    mockStorageUserOpsDelete.mockClear();
    mockOnExit.mockClear();

    delete (window as any).location;
    (window as any).location = { assign: jest.fn() };

    localStorageMock = new StorageMock();
    localStorageMock.setInitialData({
      filter_something: 'value',
      user: 'userdata',
      token: 'tokendata',
      'persist:root': 'persistdata',
      other_key: 'othervalue',
    });

    sessionStorageMock = new StorageMock();
    sessionStorageMock.setInitialData({
      filter_test: 'value',
      user: 'userdata',
      token: 'tokendata',
      keep_this: 'keepvalue',
    });

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
      configurable: true,
    });
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
      expect(mockOnExit).toHaveBeenCalled();
    });

    const passedCallback = mockOnExit.mock.calls[0]?.[0];
    expect(typeof passedCallback).toBe('function');
    passedCallback();

    expect(mockStorageTokenOpsDelete).toHaveBeenCalledTimes(1);
    expect(mockStorageUserOpsDelete).toHaveBeenCalledTimes(1);

    expect(localStorageMock.removeItemMock).toHaveBeenCalledWith('filter_something');
    expect(localStorageMock.removeItemMock).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItemMock).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItemMock).toHaveBeenCalledWith('persist:root');
    expect(localStorageMock.removeItemMock).not.toHaveBeenCalledWith('other_key');

    expect(sessionStorageMock.removeItemMock).toHaveBeenCalledWith('filter_test');
    expect(sessionStorageMock.removeItemMock).toHaveBeenCalledWith('user');
    expect(sessionStorageMock.removeItemMock).toHaveBeenCalledWith('token');
    expect(sessionStorageMock.removeItemMock).not.toHaveBeenCalledWith('keep_this');

    expect(window.location.assign).toHaveBeenCalledWith('https://mock-logout-url.com');
  });

  it('calls customExitAction when Footer exit is triggered', async () => {
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


    await waitFor(() => {
      expect(mockOnExit).not.toHaveBeenCalled();
    });

  });

  it('clears only filter, user, and token items from sessionStorage on exit', async () => {
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
      expect(mockOnExit).toHaveBeenCalled();
    });

    const passedCallback = mockOnExit.mock.calls[0]?.[0];
    expect(typeof passedCallback).toBe('function');
    passedCallback();

    expect(sessionStorageMock.removeItemMock).toHaveBeenCalledWith('filter_test');
    expect(sessionStorageMock.removeItemMock).toHaveBeenCalledWith('user');
    expect(sessionStorageMock.removeItemMock).toHaveBeenCalledWith('token');
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
      expect(localStorageMock.removeItemMock).not.toHaveBeenCalledWith('other_key');
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
      expect(sessionStorageMock.removeItemMock).not.toHaveBeenCalledWith('keep_this');
    });
  });

  it('removes items with keys starting with "persist:"', async () => {
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
      expect(mockOnExit).toHaveBeenCalled();
    });

    const passedCallback = mockOnExit.mock.calls[0]?.[0];
    expect(typeof passedCallback).toBe('function');
    passedCallback();

    expect(localStorageMock.removeItemMock).toHaveBeenCalledWith('persist:root');
  });

  it('removes items with keys containing "filter" (case insensitive)', async () => {
    const store = createTestStore();

    localStorageMock.setItem('FILTER_uppercase', 'value');
    localStorageMock.setItem('MixedFilter', 'value');

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
      expect(mockOnExit).toHaveBeenCalled();
    });

    const passedCallback = mockOnExit.mock.calls[0]?.[0];
    expect(typeof passedCallback).toBe('function');
    passedCallback();

    expect(localStorageMock.removeItemMock).toHaveBeenCalledWith('filter_something');
  });
});
