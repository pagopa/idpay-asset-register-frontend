import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock dei componenti usati nelle route
jest.mock('../pages/auth/Auth', () => () => <div>Auth Page</div>);
jest.mock('../pages/overview/overview', () => () => <div>Overview Page</div>);
jest.mock('../pages/addProducts/addProducts', () => () => <div>Add Products Page</div>);
jest.mock('../pages/uploadsHistory/uploadsHistory', () => () => <div>Uploads History Page</div>);
jest.mock('../pages/tos/TOS', () => () => <div>TOS Page</div>);
jest.mock('../pages/privacyPolicy/PrivacyPolicy', () => () => <div>Privacy Policy Page</div>);
jest.mock('../pages/components/Products', () => ({ children }: any) => (
  <div>Products Page{children}</div>
));
jest.mock('../components/Product/ProductDataGrid', () => () => <div>Product Data Grid</div>);
jest.mock('../components/Layout/Layout', () => ({ children }: any) => <div>Layout:{children}</div>);
jest.mock('../components/TOS/TOSWall', () => () => <div>TOS Wall</div>);
jest.mock('../components/TOSLayout/TOSLayout', () => ({ children }: any) => (
  <div>TOSLayout:{children}</div>
));

// Mock delle dipendenze selfcare-common-frontend
jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>,
  LoadingOverlay: () => <div>LoadingOverlay</div>,
  UnloadEventHandler: () => <div>UnloadEventHandler</div>,
  UserNotifyHandle: () => <div>UserNotifyHandle</div>,
}));

// Mock delle decorazioni e hook
jest.mock('../decorators/withSelectedPartyProducts', () => (Comp: any) => Comp);
jest.mock('../decorators/withLogin', () => (Comp: any) => Comp);
jest.mock('../hooks/useTCAgreement', () => () => ({
  isTOSAccepted: true,
  acceptTOS: jest.fn(),
  firstAcceptance: false,
}));
jest.mock('../routes', () => ({
  HOME: '/',
  AUTH: '/auth',
  ADD_PRODUCTS: '/add-products',
  PRODUCTS: '/products',
  UPLOADS: '/uploads',
  TOS: '/tos',
  PRIVACY_POLICY: '/privacy-policy',
}));

describe('App', () => {
  it('renderizza la pagina Auth per la route /auth', () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Auth Page')).toBeInTheDocument();
  });

  it('renderizza la pagina Overview per la route /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Overview Page')).toBeInTheDocument();
  });

  it('renderizza la pagina Add Products per la route /add-products', () => {
    render(
      <MemoryRouter initialEntries={['/add-products']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Add Products Page')).toBeInTheDocument();
  });

  it('renderizza la pagina Products e ProductDataGrid per la route /products', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Products Page')).toBeInTheDocument();
    expect(screen.getByText('Product Data Grid')).toBeInTheDocument();
  });

  it('renderizza la pagina Uploads History per la route /uploads', () => {
    render(
      <MemoryRouter initialEntries={['/uploads']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Uploads History Page')).toBeInTheDocument();
  });

  it('renderizza la pagina TOS per la route /tos', () => {
    render(
      <MemoryRouter initialEntries={['/tos']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('TOS Page')).toBeInTheDocument();
  });

  it('renderizza la pagina Privacy Policy per la route /privacy-policy', () => {
    render(
      <MemoryRouter initialEntries={['/privacy-policy']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Privacy Policy Page')).toBeInTheDocument();
  });

  it('renderizza la pagina Overview per una route non riconosciuta', () => {
    render(
      <MemoryRouter initialEntries={['/non-esiste']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Overview Page')).toBeInTheDocument();
  });
});
