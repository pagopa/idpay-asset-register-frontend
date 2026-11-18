const mockOneTrust = {
  NoticeApi: {
    Initialized: Promise.resolve(),
    LoadNotices: jest.fn().mockReturnValue(Promise.resolve()),
  },
};

(window as any).OneTrust = mockOneTrust;
(global as any).OneTrust = mockOneTrust;

import { renderHook, act } from '@testing-library/react';
import { useOneTrustNotice } from '../useOneTrustNotice';

describe('useOneTrustNotice', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should initialize and load notices on mount, then call setContentLoaded', async () => {
    const setContentLoaded = jest.fn();
    const testUrl = 'https://example.com/notice';

    await act(async () => {
      renderHook(() => useOneTrustNotice(testUrl, false, setContentLoaded, ''));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockOneTrust.NoticeApi.LoadNotices).toHaveBeenCalledWith([testUrl], false);
    expect(mockOneTrust.NoticeApi.LoadNotices).toHaveBeenCalledTimes(1);
    expect(setContentLoaded).toHaveBeenCalledWith(true);
    expect(setContentLoaded).toHaveBeenCalledTimes(1);
  });

  test('should modify DOM elements after a delay when content is loaded', async () => {
    document.body.innerHTML = `
      <div class="otnotice-content">
        <a href="#internal-section">Link Interno</a>
        <a href="https://www.google.com">Link Esterno</a>
      </div>
      <div class="otnotice-menu"></div>
    `;

    const setContentLoaded = jest.fn();
    const urlPrefix = '/prefix';
    const testUrl = 'https://example.com/notice';

    await act(async () => {
      renderHook(() => useOneTrustNotice(testUrl, true, setContentLoaded, urlPrefix));
      await Promise.resolve();
      await Promise.resolve();
    });

    act(() => {
      jest.runAllTimers();
    });

    const internalLink = document.querySelector('a[href="/prefix#internal-section"]');
    expect(internalLink).not.toBeNull();
    expect(internalLink?.textContent).toBe('Link Interno');

    const externalLink = document.querySelector('a[href="https://www.google.com"]');
    expect(externalLink).not.toBeNull();

    const sidebar = document.getElementsByClassName('otnotice-menu')[0];
    expect(sidebar?.getAttribute('style')).toBe('max-height: 65%');
  });
});