import {
  formattedCurrency,
  formatDate,
  formatIban,
  formatDateWithHours,
  formatDateWithoutHours,
  formatFileName,
  truncateString,
  truncateStringResponsive,
  fetchUserFromLocalStorage,
  initUploadBoxStyle,
  initUploadHelperBoxStyle,
  getTablePrLength, useResponsiveMaxLength, isOnOrBeforeDate, customExitAction,
} from '../helpers';
import { EMPTY_DATA } from '../utils/constants';

jest.mock('../utils/env', () => ({
  __esModule: true,
  ENV: {
    UPCOMING_INITIATIVE_DAY: 'xx/xx/xx',
    URL_API: {
      OPERATION: 'https://mock-api/register',
      LOGOUT: 'https://mock-api/logout',
    },
    URL_FE: {
      LOGOUT: 'https://mock-logout-url.com'
    }
  },
}));

describe('Helper functions', () => {
  const date = new Date('2022-10-01T00:00:00.000Z');

  test('formattedCurrency with undefined', () => {
    expect(formattedCurrency(undefined)).toEqual('-');
  });

  test('formattedCurrency with number (no cents)', () => {
    const result = formattedCurrency(20.3);
    expect(result).toContain('20,30');
  });

  test('formattedCurrency with number and cents = true', () => {
    const result = formattedCurrency(2030, '-', true);
    expect(result).toContain('20,30');
  });

  test('formatDate with undefined', () => {
    expect(formatDate(undefined)).toEqual('');
  });

  test('formatDate with valid date', () => {
    const result = formatDate(date);
    expect(result).toContain('01/10/2022');
  });

  test('formatIban with valid IBAN', () => {
    expect(formatIban('IT03M0300203280794663157929')).toEqual('IT 03 M 03002 03280 794663157929');
  });

  test('formatIban with undefined', () => {
    expect(formatIban(undefined)).toEqual('');
  });

  test('formatDateWithHours with valid ISO string', () => {
    const result = formatDateWithHours(new Date('2022-10-01T14:05:00.000Z'));
    expect(result).toBe('01/10/2022, 16:05:00');
  });


  test('formatDateWithoutHours with valid ISO string', () => {
    const result = formatDateWithoutHours('2022-10-01T14:05:00.000Z');
    expect(result).toBe('01/10/2022');
  });

  test('formatDateWithoutHours with empty string', () => {
    expect(formatDateWithoutHours('')).toBe('-');
  });

  test('formatFileName with long name', () => {
    const result = formatFileName('documento_molto_lungo.pdf');
    expect(result).toBe('documento_... .pdf');

  });

  test('formatFileName with short name', () => {
    expect(formatFileName('file.pdf')).toBe('file.pdf');
  });

  test('formatFileName with undefined', () => {
    expect(formatFileName(undefined)).toBe('');
  });

  test('truncateString with long string', () => {
    const result = truncateString('una_stringa_molto_lunga_che_supera_il_limite', 10);
    expect(result).toBe('una_string...');
  });

  test('truncateString with short string', () => {
    expect(truncateString('breve', 10)).toBe('breve');
  });

  test('truncateString with undefined', () => {
    expect(truncateString(undefined)).toBe('-');
  });
});

describe('Additional tests for better coverage', () => {

  test('formattedCurrency with zero', () => {
    const result = formattedCurrency(0);
    expect(result).toContain('-');
  });

  test('formattedCurrency with cents = false explicitly', () => {
    const result = formattedCurrency(15.5, '-', false);
    expect(result).toContain('15,50');
  });

  test('formatDateWithHours with null', () => {
    expect(formatDateWithHours(null)).toBe(EMPTY_DATA);
  });

  test('formatDateWithHours with undefined', () => {
    expect(formatDateWithHours(undefined)).toBe(EMPTY_DATA);
  });

  test('truncateStringResponsive with undefined string', () => {
    expect(truncateStringResponsive(undefined, 10)).toBe('-');
  });

  test('truncateStringResponsive with undefined maxLength', () => {
    const testString = 'test string';
    expect(truncateStringResponsive(testString, undefined)).toBe(testString);
  });

  test('truncateStringResponsive with string longer than maxLength', () => {
    const result = truncateStringResponsive('very long string here', 10);
    expect(result).toBe('very long ...');
  });

  test('truncateStringResponsive with string shorter than maxLength', () => {
    const result = truncateStringResponsive('short', 10);
    expect(result).toBe('short');
  });

  beforeEach(() => {
    localStorage.clear();
  });

  test('fetchUserFromLocalStorage with valid user data', () => {
    const userData = { name: 'John', email: 'john@example.com' };
    localStorage.setItem('user', JSON.stringify(userData));

    const result = fetchUserFromLocalStorage();
    expect(result).toEqual(userData);
  });

  test('fetchUserFromLocalStorage with no user data', () => {
    const result = fetchUserFromLocalStorage();
    expect(result).toBeNull();
  });

  test('fetchUserFromLocalStorage with invalid JSON', () => {
    localStorage.setItem('user', 'invalid json string');

    const result = fetchUserFromLocalStorage();
    expect(result).toBeNull();
  });

  test('initUploadBoxStyle has correct properties', () => {
    expect(initUploadBoxStyle).toHaveProperty('gridColumn', 'span 12');
    expect(initUploadBoxStyle).toHaveProperty('border', '1px dashed #0073E6');
  });

  test('initUploadHelperBoxStyle has correct properties', () => {
    expect(initUploadHelperBoxStyle).toHaveProperty('gridColumn', 'span 12');
    expect(initUploadHelperBoxStyle).toHaveProperty('width', '100%');
  });
});


describe('Additional tests for 100% coverage', () => {

  test('formatDateWithHours with empty string', () => {
    expect(formatDateWithHours('')).toBe(EMPTY_DATA);
    expect(formatDateWithHours('   ')).toBe(EMPTY_DATA);
  });

  test('formatDateWithHours with valid ISO string', () => {
    const result = formatDateWithHours('2022-10-01T14:05:30.000Z');
    expect(result).toBe('01/10/2022, 16:05:30');
  });

  test('formatDateWithHours with invalid date string', () => {
    expect(formatDateWithHours('invalid-date')).toBe(EMPTY_DATA);
  });

  test('getTablePrLength with window defined', () => {
    const originalWindow = global.window;

    Object.defineProperty(global, 'window', {
      value: { innerWidth: 1920 }, // assumendo RESOLUTION_UPSCALING sia < 1920
      writable: true
    });

    const resultLarge = getTablePrLength();
    expect(typeof resultLarge).toBe('number');

    Object.defineProperty(global, 'window', {
      value: { innerWidth: 800 },
      writable: true
    });

    const resultSmall = getTablePrLength();
    expect(typeof resultSmall).toBe('number');

    global.window = originalWindow;
  });

  test('getTablePrLength without window', () => {
    const originalWindow = global.window;
    delete global.window;

    const result = getTablePrLength();
    expect(typeof result).toBe('number');

    global.window = originalWindow;
  });

  test('useResponsiveMaxLength with different breakpoints', () => {
    const mockTheme = {
      breakpoints: {
        only: jest.fn()
      }
    };

    const { useTheme, useMediaQuery } = require('@mui/material');

    useTheme.mockReturnValue(mockTheme);

    useMediaQuery.mockReturnValue(true);
    mockTheme.breakpoints.only.mockReturnValue('(max-width:599.95px)');
    useMediaQuery.mockImplementation((query) => query === '(max-width:599.95px)');

    const resultXs = useResponsiveMaxLength();
    expect(resultXs).toBe(15);

    useMediaQuery.mockImplementation((query) => query.includes('sm'));
    const resultSm = useResponsiveMaxLength();
    expect(resultSm).toBe(70);

    useMediaQuery.mockImplementation((query) => query.includes('md'));
    const resultMd = useResponsiveMaxLength();
    expect(resultMd).toBe(70);

    useMediaQuery.mockImplementation((query) => query.includes('lg'));
    const resultLg = useResponsiveMaxLength();
    expect(resultLg).toBe(70);

    useMediaQuery.mockImplementation((query) => query.includes('xl'));
    const resultXl = useResponsiveMaxLength();
    expect(resultXl).toBe(70);

    useMediaQuery.mockReturnValue(false);
    const resultDefault = useResponsiveMaxLength();
    expect(resultDefault).toBe(70);
  });

  test('isOnOrBeforeDate with undefined', () => {
    expect(isOnOrBeforeDate(undefined)).toBe(false);
  });

  test('isOnOrBeforeDate with empty string', () => {
    expect(isOnOrBeforeDate('')).toBe(false);
  });

  test('isOnOrBeforeDate with future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureDateStr = futureDate.toLocaleDateString('it-IT');

    expect(isOnOrBeforeDate(futureDateStr)).toBe(true);
  });

  test('isOnOrBeforeDate with past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const pastDateStr = pastDate.toLocaleDateString('it-IT');

    expect(isOnOrBeforeDate(pastDateStr)).toBe(false);
  });

  test('isOnOrBeforeDate with today date', () => {
    const todayStr = new Date().toLocaleDateString('it-IT');
    expect(isOnOrBeforeDate(todayStr)).toBe(false);
  });

  test('customExitAction clears storage and redirects', () => {
    const { storageTokenOps, storageUserOps } = require('@pagopa/selfcare-common-frontend/lib/utils/storage');
    const { ENV } = require('../utils/env');

    const mockTokenDelete = jest.fn();
    const mockUserDelete = jest.fn();
    storageTokenOps.delete = mockTokenDelete;
    storageUserOps.delete = mockUserDelete;

    localStorage.setItem('filter_test', 'value');
    localStorage.setItem('user', 'userData');
    localStorage.setItem('token', 'tokenData');
    localStorage.setItem('persist:root', 'persistData');
    localStorage.setItem('normalKey', 'normalValue');

    sessionStorage.setItem('filter_session', 'value');
    sessionStorage.setItem('user', 'userData');
    sessionStorage.setItem('token', 'tokenData');
    sessionStorage.setItem('normalSessionKey', 'normalValue');

    const mockAssign = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { assign: mockAssign },
      writable: true
    });

    customExitAction();

    expect(mockTokenDelete).toHaveBeenCalled();
    expect(mockUserDelete).toHaveBeenCalled();

    expect(localStorage.getItem('filter_test')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('persist:root')).toBeNull();
    expect(localStorage.getItem('normalKey')).toBe('normalValue');

    expect(sessionStorage.getItem('filter_session')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('normalSessionKey')).toBe('normalValue');

    expect(mockAssign).toHaveBeenCalledWith(ENV.URL_FE.LOGOUT);
  });

  test('formattedCurrency with number 0 and cents true', () => {
    const result = formattedCurrency(0, '-', true);
    expect(result).toContain('-');
  });

  test('formattedCurrency with custom symbol', () => {
    expect(formattedCurrency(undefined, 'N/A')).toBe('N/A');
  });

});

jest.mock('@mui/material', () => ({
  useTheme: jest.fn(() => ({ breakpoints: { only: jest.fn() } })),
  useMediaQuery: jest.fn(() => false),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { delete: jest.fn() },
  storageUserOps: { delete: jest.fn() },
}));