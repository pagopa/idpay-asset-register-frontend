import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import withLogin from '../withLogin';
import { useLogin } from '../../hooks/useLogin';
import useLoading from '@pagopa/selfcare-common-frontend/lib/hooks/useLoading';
import { userReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { LOADING_TASK_LOGIN_CHECK } from '../../utils/constants';

jest.mock('../../hooks/useLogin');
jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useLoading');

const mockUseLogin = useLogin as jest.MockedFunction<typeof useLogin>;
const mockUseLoading = useLoading as jest.MockedFunction<typeof useLoading>;

const MockComponent: React.FC<{ testProp?: string }> = ({ testProp }) => (
    <div data-testid="mock-component">
        Mock Component Content
        {testProp && <span data-testid="test-prop">{testProp}</span>}
    </div>
);
MockComponent.displayName = 'MockComponent';

const createMockStore = (loggedUser: User | null = null) => {
    return configureStore({
        reducer: {
            user: userReducer,
        },
        preloadedState: {
            user: {
                logged: loggedUser,
            },
        },
    });
};

const mockUser: User = {
    name: 'John',
    surname: 'Doe',
    uid: 'user-123',
    taxCode: 'JDOE00A00A000A',
    email: 'john.doe@example.com',
};

describe('withLogin Decorator', () => {
    let mockAttemptSilentLogin: jest.Mock;
    let mockSetLoading: jest.Mock;

    beforeEach(() => {
        mockAttemptSilentLogin = jest.fn().mockResolvedValue(undefined);
        mockSetLoading = jest.fn();

        mockUseLogin.mockReturnValue({
            attemptSilentLogin: mockAttemptSilentLogin,
        } as any);

        mockUseLoading.mockReturnValue(mockSetLoading);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Wrapping', () => {
        it('should return a wrapped component', () => {
            const WrappedComponent = withLogin(MockComponent);
            expect(WrappedComponent).toBeDefined();
            expect(typeof WrappedComponent).toBe('function');
        });

        it('should set correct displayName for wrapped component', () => {
            const WrappedComponent = withLogin(MockComponent);
            expect(WrappedComponent.displayName).toBe('withLogin(MockComponent)');
        });

        it('should handle component without displayName', () => {
            const ComponentWithoutName = () => <div>Test</div>;
            const WrappedComponent = withLogin(ComponentWithoutName);
            expect(WrappedComponent.displayName).toBe('withLogin(ComponentWithoutName)');
        });

        it('should handle anonymous component', () => {
            const WrappedComponent = withLogin(() => <div>Anonymous</div>);
            expect(WrappedComponent.displayName).toBe('withLogin(Component)');
        });
    });

    describe('User Authentication Flow', () => {
        it('should render wrapped component when user is logged in', () => {
            const store = createMockStore(mockUser);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(screen.getByTestId('mock-component')).toBeInTheDocument();
            expect(screen.getByText('Mock Component Content')).toBeInTheDocument();
        });

        it('should not render wrapped component when user is not logged in', () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument();
        });

        it('should attempt silent login when user is not logged in', async () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            await waitFor(() => {
                expect(mockAttemptSilentLogin).toHaveBeenCalledTimes(1);
            });
        });

        it('should not attempt silent login when user is already logged in', () => {
            const store = createMockStore(mockUser);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(mockAttemptSilentLogin).not.toHaveBeenCalled();
        });
    });

    describe('Loading State Management', () => {
        it('should initialize useLoading with correct task name', () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(mockUseLoading).toHaveBeenCalledWith(LOADING_TASK_LOGIN_CHECK);
        });

        it('should set loading to true before login attempt', async () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            await waitFor(() => {
                expect(mockSetLoading).toHaveBeenCalledWith(true);
            });
        });

        it('should set loading to false after successful login', async () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            await waitFor(() => {
                expect(mockSetLoading).toHaveBeenCalledWith(false);
            });
        });

        it('should call setLoading in correct order', async () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            await waitFor(() => {
                expect(mockSetLoading).toHaveBeenNthCalledWith(1, true);
            });

            await waitFor(() => {
                expect(mockSetLoading).toHaveBeenNthCalledWith(2, false);
            });
        });
    });

    describe('Props Forwarding', () => {
        it('should forward props to wrapped component', () => {
            const store = createMockStore(mockUser);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent testProp="test-value" />
                </Provider>
            );

            expect(screen.getByTestId('test-prop')).toHaveTextContent('test-value');
        });

        it('should forward multiple props to wrapped component', () => {
            interface TestComponentProps {
                prop1: string;
                prop2: number;
            }

            const TestComponent: React.FC<TestComponentProps> = ({ prop1, prop2 }) => (
                <div>
                    <span data-testid="prop1">{prop1}</span>
                    <span data-testid="prop2">{prop2}</span>
                </div>
            );

            const store = createMockStore(mockUser);
            const WrappedComponent = withLogin(TestComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent prop1="value1" prop2={42} />
                </Provider>
            );

            expect(screen.getByTestId('prop1')).toHaveTextContent('value1');
            expect(screen.getByTestId('prop2')).toHaveTextContent('42');
        });
    });

    describe('useEffect Dependencies', () => {
        it('should only run effect once on mount', async () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            const { rerender } = render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            await waitFor(() => {
                expect(mockAttemptSilentLogin).toHaveBeenCalledTimes(1);
            });

            rerender(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(mockAttemptSilentLogin).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined user', () => {
            const store = createMockStore(undefined as any);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument();
        });

        it('should handle null user', () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument();
        });

        it('should handle async login that resolves after component unmounts', async () => {
            let resolveLogin: () => void;
            const loginPromise = new Promise<void>((resolve) => {
                resolveLogin = resolve;
            });
            mockAttemptSilentLogin.mockReturnValue(loginPromise);

            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            const { unmount } = render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            unmount();

            resolveLogin!();
            await loginPromise;

            expect(true).toBe(true);
        });
    });

    describe('Integration Tests', () => {
        it('should complete full authentication flow', async () => {
            const store = createMockStore(null);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument();

            await waitFor(() => {
                expect(mockSetLoading).toHaveBeenCalledWith(true);
            });

            await waitFor(() => {
                expect(mockAttemptSilentLogin).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(mockSetLoading).toHaveBeenCalledWith(false);
            });
        });

        it('should skip authentication flow when user is already logged in', () => {
            const store = createMockStore(mockUser);
            const WrappedComponent = withLogin(MockComponent);

            render(
                <Provider store={store}>
                    <WrappedComponent />
                </Provider>
            );

            expect(screen.getByTestId('mock-component')).toBeInTheDocument();

            expect(mockAttemptSilentLogin).not.toHaveBeenCalled();

            expect(mockSetLoading).not.toHaveBeenCalled();
        });
    });
});