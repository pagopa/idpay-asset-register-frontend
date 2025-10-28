import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomHeader from '../CustomHeader';
import { JwtUser, ProductEntity, } from '@pagopa/mui-italia';
import { PartySwitchItem } from '@pagopa/mui-italia/dist/components/PartySwitch';
import { ENV } from '../../../utils/env';

jest.mock('../../../utils/env', () => ({
    ENV: {
        HEADER: {
            LINK: {
                PRODUCTURL: 'https://selfcare.example.com',
                ROOTLINK: 'https://pagopa.it',
            },
        },
        URL_FE: {
            LOGIN: 'https://example.com/login',
            LOGOUT: 'https://example.com/logout',
        },
    },
}));

jest.mock('@pagopa/mui-italia/dist/components/HeaderAccount/HeaderAccount', () => ({
    HeaderAccount: ({
                        rootLink,
                        loggedUser,
                        onAssistanceClick,
                        onLogin,
                        onLogout,
                        enableLogin,
                        userActions,
                        enableDropdown,
                        enableAssistanceButton,
                        onDocumentationClick,
                    }: any) => (
        <div data-testid="header-account">
            <div data-testid="root-link">{rootLink.label}</div>
            <div data-testid="logged-user">{loggedUser ? loggedUser.name : 'not logged'}</div>
            {enableLogin && <button onClick={onLogin} data-testid="login-btn">Login</button>}
            {loggedUser && <button onClick={onLogout} data-testid="logout-btn">Logout</button>}
            {enableAssistanceButton && (
                <button onClick={onAssistanceClick} data-testid="assistance-btn">Assistance</button>
            )}
            {onDocumentationClick && (
                <button onClick={onDocumentationClick} data-testid="documentation-btn">Documentation</button>
            )}
            {enableDropdown && <div data-testid="user-dropdown">Dropdown</div>}
            {userActions.length > 0 && <div data-testid="user-actions">Actions</div>}
        </div>
    ),
}));

jest.mock('@pagopa/mui-italia/dist/components/HeaderProduct/HeaderProduct', () => ({
    HeaderProduct: ({
                        productId,
                        productsList,
                        partyId,
                        partyList,
                        onSelectedProduct,
                        onSelectedParty,
                    }: any) => (
        <div data-testid="header-product">
            <div data-testid="selected-product">{productId}</div>
            <div data-testid="selected-party">{partyId}</div>
            <div data-testid="products-count">{productsList.length}</div>
            <div data-testid="parties-count">{partyList.length}</div>
            {onSelectedProduct && (
                <button onClick={() => onSelectedProduct({ id: 'test-product' })} data-testid="select-product-btn">
                    Select Product
                </button>
            )}
            {onSelectedParty && (
                <button onClick={() => onSelectedParty({ id: 'test-party' })} data-testid="select-party-btn">
                    Select Party
                </button>
            )}
        </div>
    ),
}));

describe('CustomHeader', () => {
    const mockLoggedUser: JwtUser = {
        id: 'user-123',
        name: 'Mario Rossi',
        surname: 'Rossi',
        email: 'mario.rossi@example.com',
    };

    const mockProductsList: ProductEntity[] = [
        {
            id: 'prod-1',
            title: 'Product 1',
            productUrl: 'https://product1.example.com',
            linkType: 'internal',
        },
        {
            id: 'prod-2',
            title: 'Product 2',
            productUrl: 'https://product2.example.com',
            linkType: 'external',
        },
    ];

    const mockPartyList: PartySwitchItem[] = [
        {
            id: 'party-1',
            name: 'Party 1',
            productRole: 'admin',
        },
        {
            id: 'party-2',
            name: 'Party 2',
            productRole: 'user',
        },
    ];

    const defaultProps = {
        withSecondHeader: false,
        loggedUser: mockLoggedUser,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render HeaderAccount component', () => {
            render(<CustomHeader {...defaultProps} />);
            expect(screen.getByTestId('header-account')).toBeInTheDocument();
        });

        it('should render header tag', () => {
            const { container } = render(<CustomHeader {...defaultProps} />);
            expect(container.querySelector('header')).toBeInTheDocument();
        });

        it('should render HeaderProduct when withSecondHeader is true', () => {
            render(<CustomHeader {...defaultProps} withSecondHeader={true} />);
            expect(screen.getByTestId('header-product')).toBeInTheDocument();
        });

        it('should render nav tag when withSecondHeader is true', () => {
            const { container } = render(<CustomHeader {...defaultProps} withSecondHeader={true} />);
            expect(container.querySelector('nav')).toBeInTheDocument();
        });

        it('should not render HeaderProduct when withSecondHeader is false', () => {
            render(<CustomHeader {...defaultProps} withSecondHeader={false} />);
            expect(screen.queryByTestId('header-product')).not.toBeInTheDocument();
        });

        it('should not render nav tag when withSecondHeader is false', () => {
            const { container } = render(<CustomHeader {...defaultProps} withSecondHeader={false} />);
            expect(container.querySelector('nav')).not.toBeInTheDocument();
        });

        it('should display root link label', () => {
            render(<CustomHeader {...defaultProps} />);
            expect(screen.getByTestId('root-link')).toHaveTextContent('PagoPA S.p.A.');
        });

        it('should display logged user name when user is logged in', () => {
            render(<CustomHeader {...defaultProps} />);
            expect(screen.getByTestId('logged-user')).toHaveTextContent('Mario Rossi');
        });

        it('should display "not logged" when user is not logged in', () => {
            render(<CustomHeader {...defaultProps} loggedUser={false} />);
            expect(screen.getByTestId('logged-user')).toHaveTextContent('not logged');
        });
    });

    describe('Login and Logout', () => {
        it('should render login button when enableLogin is true', () => {
            render(<CustomHeader {...defaultProps} loggedUser={false} enableLogin={true} />);
            expect(screen.getByTestId('login-btn')).toBeInTheDocument();
        });

        it('should not render login button when enableLogin is false', () => {
            render(<CustomHeader {...defaultProps} loggedUser={false} enableLogin={false} />);
            expect(screen.queryByTestId('login-btn')).not.toBeInTheDocument();
        });

        it('should call default onExit and navigate to login page on login click', () => {
            const assignMock = jest.fn();
            Object.defineProperty(window, 'location', {
                value: { assign: assignMock },
                writable: true,
            });

            render(<CustomHeader {...defaultProps} loggedUser={false} />);
            fireEvent.click(screen.getByTestId('login-btn'));
            expect(assignMock).toHaveBeenCalledWith(ENV.URL_FE.LOGIN);
        });

        it('should call default onExit and navigate to logout page on logout click', () => {
            const assignMock = jest.fn();
            Object.defineProperty(window, 'location', {
                value: { assign: assignMock },
                writable: true,
            });

            render(<CustomHeader {...defaultProps} />);
            fireEvent.click(screen.getByTestId('logout-btn'));
            expect(assignMock).toHaveBeenCalledWith(ENV.URL_FE.LOGOUT);
        });

        it('should call custom onExit function on logout', () => {
            const mockOnExit = jest.fn((exitAction) => exitAction());
            const assignMock = jest.fn();
            Object.defineProperty(window, 'location', {
                value: { assign: assignMock },
                writable: true,
            });

            render(<CustomHeader {...defaultProps} onExit={mockOnExit} />);
            fireEvent.click(screen.getByTestId('logout-btn'));
            expect(mockOnExit).toHaveBeenCalled();
            expect(assignMock).toHaveBeenCalledWith(ENV.URL_FE.LOGOUT);
        });

        it('should call custom onLogoutClick when provided', () => {
            const mockOnLogoutClick = jest.fn();
            render(<CustomHeader {...defaultProps} onLogoutClick={mockOnLogoutClick} />);
            fireEvent.click(screen.getByTestId('logout-btn'));
            expect(mockOnLogoutClick).toHaveBeenCalled();
        });
    });

    describe('Assistance Button', () => {
        it('should render assistance button when enableAssistanceButton is true', () => {
            render(<CustomHeader {...defaultProps} enableAssistanceButton={true} />);
            expect(screen.getByTestId('assistance-btn')).toBeInTheDocument();
        });

        it('should not render assistance button when enableAssistanceButton is false', () => {
            render(<CustomHeader {...defaultProps} enableAssistanceButton={false} />);
            expect(screen.queryByTestId('assistance-btn')).not.toBeInTheDocument();
        });

        it('should open assistance email on assistance button click', () => {
            const openMock = jest.fn();
            window.open = openMock;

            render(
                <CustomHeader
                    {...defaultProps}
                    assistanceEmail="mailto:support@example.com"
                    enableAssistanceButton={true}
                />
            );
            fireEvent.click(screen.getByTestId('assistance-btn'));
            expect(openMock).toHaveBeenCalledWith('mailto:support@example.com');
        });

        it('should open empty string when assistanceEmail is not provided', () => {
            const openMock = jest.fn();
            window.open = openMock;

            render(<CustomHeader {...defaultProps} enableAssistanceButton={true} />);
            fireEvent.click(screen.getByTestId('assistance-btn'));
            expect(openMock).toHaveBeenCalledWith('');
        });
    });

    describe('Documentation Button', () => {
        it('should render documentation button when onDocumentationClick is provided', () => {
            const mockOnDocumentationClick = jest.fn();
            render(<CustomHeader {...defaultProps} onDocumentationClick={mockOnDocumentationClick} />);
            expect(screen.getByTestId('documentation-btn')).toBeInTheDocument();
        });

        it('should not render documentation button when onDocumentationClick is not provided', () => {
            render(<CustomHeader {...defaultProps} />);
            expect(screen.queryByTestId('documentation-btn')).not.toBeInTheDocument();
        });

        it('should call onDocumentationClick on documentation button click', () => {
            const mockOnDocumentationClick = jest.fn();
            render(<CustomHeader {...defaultProps} onDocumentationClick={mockOnDocumentationClick} />);
            fireEvent.click(screen.getByTestId('documentation-btn'));
            expect(mockOnDocumentationClick).toHaveBeenCalled();
        });
    });

    describe('User Dropdown and Actions', () => {
        it('should render user dropdown when enableDropdown is true', () => {
            render(<CustomHeader {...defaultProps} enableDropdown={true} />);
            expect(screen.getByTestId('user-dropdown')).toBeInTheDocument();
        });

        it('should not render user dropdown when enableDropdown is false', () => {
            render(<CustomHeader {...defaultProps} enableDropdown={false} />);
            expect(screen.queryByTestId('user-dropdown')).not.toBeInTheDocument();
        });

        it('should render user actions when userActions are provided', () => {
            const mockUserActions = [
                { id: '1', label: 'Action 1', onClick: jest.fn() },
                { id: '2', label: 'Action 2', onClick: jest.fn() },
            ];
            render(<CustomHeader {...defaultProps} userActions={mockUserActions} />);
            expect(screen.getByTestId('user-actions')).toBeInTheDocument();
        });

        it('should not render user actions when userActions array is empty', () => {
            render(<CustomHeader {...defaultProps} userActions={[]} />);
            expect(screen.queryByTestId('user-actions')).not.toBeInTheDocument();
        });
    });

    describe('HeaderProduct with Products and Parties', () => {
        it('should pass selected product id to HeaderProduct', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    selectedProductId="prod-1"
                />
            );
            expect(screen.getByTestId('selected-product')).toHaveTextContent('prod-1');
        });

        it('should use default product id when not provided', () => {
            render(<CustomHeader {...defaultProps} withSecondHeader={true} />);
            expect(screen.getByTestId('selected-product')).toHaveTextContent('prod-selfcare');
        });

        it('should pass selected party id to HeaderProduct', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    selectedPartyId="party-1"
                />
            );
            expect(screen.getByTestId('selected-party')).toHaveTextContent('party-1');
        });

        it('should include selfcare product when addSelfcareProduct is true', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    productsList={mockProductsList}
                    addSelfcareProduct={true}
                />
            );
            expect(screen.getByTestId('products-count')).toHaveTextContent('3');
        });

        it('should not include selfcare product when addSelfcareProduct is false', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    productsList={mockProductsList}
                    addSelfcareProduct={false}
                />
            );
            expect(screen.getByTestId('products-count')).toHaveTextContent('2');
        });

        it('should pass party list to HeaderProduct', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    partyList={mockPartyList}
                />
            );
            expect(screen.getByTestId('parties-count')).toHaveTextContent('2');
        });

        it('should call onSelectedProduct when product is selected', () => {
            const mockOnSelectedProduct = jest.fn();
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    onSelectedProduct={mockOnSelectedProduct}
                />
            );
            fireEvent.click(screen.getByTestId('select-product-btn'));
            expect(mockOnSelectedProduct).toHaveBeenCalledWith({ id: 'test-product' });
        });

        it('should call onSelectedParty when party is selected', () => {
            const mockOnSelectedParty = jest.fn();
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    onSelectedParty={mockOnSelectedParty}
                />
            );
            fireEvent.click(screen.getByTestId('select-party-btn'));
            expect(mockOnSelectedParty).toHaveBeenCalledWith({ id: 'test-party' });
        });
    });

    describe('Default Props', () => {
        it('should use default empty arrays for productsList and partyList', () => {
            render(<CustomHeader {...defaultProps} withSecondHeader={true} />);
            expect(screen.getByTestId('parties-count')).toHaveTextContent('0');
        });

        it('should enable login by default', () => {
            render(<CustomHeader {...defaultProps} loggedUser={false} />);
            expect(screen.getByTestId('login-btn')).toBeInTheDocument();
        });

        it('should disable dropdown by default', () => {
            render(<CustomHeader {...defaultProps} />);
            expect(screen.queryByTestId('user-dropdown')).not.toBeInTheDocument();
        });

        it('should enable assistance button by default', () => {
            render(<CustomHeader {...defaultProps} />);
            expect(screen.getByTestId('assistance-btn')).toBeInTheDocument();
        });

        it('should add selfcare product by default', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    productsList={mockProductsList}
                />
            );
            expect(screen.getByTestId('products-count')).toHaveTextContent('3');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty productsList', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    productsList={[]}
                    addSelfcareProduct={false}
                />
            );
            expect(screen.getByTestId('products-count')).toHaveTextContent('0');
        });

        it('should handle empty partyList', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                    partyList={[]}
                />
            );
            expect(screen.getByTestId('parties-count')).toHaveTextContent('0');
        });

        it('should handle missing optional callbacks', () => {
            render(
                <CustomHeader
                    {...defaultProps}
                    withSecondHeader={true}
                />
            );
            expect(screen.getByTestId('header-product')).toBeInTheDocument();
        });
    });
});