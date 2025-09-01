import {
  formattedCurrency,
  formatDate,
  formatIban,
  formatDateWithHours,
  formatDateWithoutHours,
  formatFileName,
  truncateString, truncateStringResponsive, fetchUserFromLocalStorage, initUploadBoxStyle, initUploadHelperBoxStyle,
} from '../helpers';
import { EMPTY_DATA } from '../utils/constants';

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

  test('formatDateWithHours with empty string', () => {
    expect(formatDateWithHours(new Date(''))).toBe("NaN/NaN/NaN, NaN:NaN:NaN");
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
