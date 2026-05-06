import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, act } from '@testing-library/react';

import RedirectHomeWithErrorAlert from '../RedirectHomeWithErrorAlert';

// Mock i18n: we don't need real translations here
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}));

describe('RedirectHomeWithErrorAlert', () => {
  it('renders an error message before redirect', () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter initialEntries={['/somewhere']}>
        <RedirectHomeWithErrorAlert />
      </MemoryRouter>
    );

    // With mocked i18n, the message is the key itself
    expect(
      screen.getByText(/pages\.addProducts\.form\.fileUpload\.fileUploadError\.errorDescription/i)
    ).not.toBeNull();

    jest.useRealTimers();
  });

  it('redirects to HOME after timeout', async () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter initialEntries={['/somewhere']}>
        <Routes>
          <Route path="/somewhere" element={<RedirectHomeWithErrorAlert />} />
          <Route path="/home" element={<div data-testid="home-page">HOME</div>} />
        </Routes>
      </MemoryRouter>
    );

    // initial state: message visible
    expect(
      screen.getByText(/pages\.addProducts\.form\.fileUpload\.fileUploadError\.errorDescription/i)
    ).not.toBeNull();

    // advance timers (component uses 2000ms)
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(await screen.findByTestId('home-page')).not.toBeNull();

    jest.useRealTimers();
  });
});
