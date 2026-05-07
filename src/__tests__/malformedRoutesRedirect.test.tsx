/* eslint-disable */

import { jest, describe, test, expect } from '@jest/globals';

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';

jest.mock('../utils/env', () => ({
  ENV: {
    PUBLIC_URL: '/base',
    URL_API: {
      OPERATION: 'http://localhost',
    },
    HEADER: {
      LINK: {
        PRODUCTURL: 'http://localhost',
      },
    },
  },
}));

jest.mock('../pages/initiativesList/initiativesList', () => () => (
  <div data-testid="initiatives-list">InitiativesList</div>
));

jest.mock('../decorators/withLogin', () => (Comp: any) => Comp);
jest.mock('../decorators/withSelectedPartyProducts', () => (Comp: any) => Comp);

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>,
  LoadingOverlay: () => null,
  UnloadEventHandler: () => null,
  UserNotifyHandle: () => null,
}));

jest.mock('../pages/auth/Auth', () => () => <div>Auth</div>);
jest.mock('../pages/tos/TOS', () => () => <div>TOS</div>);
jest.mock('../pages/privacyPolicy/PrivacyPolicy', () => () => <div>Privacy</div>);
jest.mock('../pages/overview/overview', () => () => <div>Overview</div>);
jest.mock('../pages/addProducts/addProducts', () => () => <div>AddProducts</div>);
jest.mock('../pages/uploadsHistory/uploadsHistory', () => () => <div>UploadsHistory</div>);
jest.mock('../pages/components/Products', () => () => <div>Products</div>);
jest.mock('../pages/InvitaliaOverview/invitaliaOverview', () => () => <div>InvitaliaOverview</div>);
jest.mock('../pages/InvitaliaProductsList/invitaliaProductsList', () => () => (
  <div>InvitaliaProductsList</div>
));

jest.mock('../components/Layout/Layout', () => ({ children }: any) => <>{children}</>);
jest.mock('../components/TOSLayout/TOSLayout', () => ({ children }: any) => <>{children}</>);

jest.mock('../hooks/useTCAgreement', () => () => ({
  isTOSAccepted: true,
  acceptTOS: () => undefined,
  firstAcceptance: false,
}));

jest.mock('../helpers', () => ({
  fetchUserFromLocalStorage: () => ({ org_role: 'OPERATORE' }),
}));

jest.mock('../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({ data: [], isLoading: false }),
}));

jest.mock('react-redux', () => ({
  useSelector: () => undefined,
}));

import App from '../App';

describe('Malformed initiative-scoped routes', () => {
  test('"/panoramica" (missing initiativeId) redirects to HOME', async () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter initialEntries={['/base/panoramica']}>
        <App />
      </MemoryRouter>
    );

    // Should show the error alert first (guard page), then redirect to HOME.
    // i18n is not initialized in this isolated test, so t() returns the key itself.
    expect(
      await screen.findByText(
        /pages\.addProducts\.form\.fileUpload\.fileUploadError\.errorDescription/i
      )
    ).not.toBeNull();

    // Redirect happens after 2000ms in RedirectHomeWithErrorAlert
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(await screen.findByTestId('initiatives-list')).not.toBeNull();
    jest.useRealTimers();
  });

  test('URL with double slash redirects to HOME (error case)', async () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter initialEntries={['/base//storico-caricamenti']}>
        <App />
      </MemoryRouter>
    );

    // Should show the error alert first (guard page), then redirect to HOME.
    expect(
      await screen.findByText(
        /pages\.addProducts\.form\.fileUpload\.fileUploadError\.errorDescription/i
      )
    ).not.toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(await screen.findByTestId('initiatives-list')).not.toBeNull();
    jest.useRealTimers();
  });

  test('URL with initiativeId but missing endpoint redirects to HOME', async () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter initialEntries={['/base/68dd003ccce8c534d1da22bc']}>
        <App />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        /pages\.addProducts\.form\.fileUpload\.fileUploadError\.errorDescription/i
      )
    ).not.toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(await screen.findByTestId('initiatives-list')).not.toBeNull();
    jest.useRealTimers();
  });
});
