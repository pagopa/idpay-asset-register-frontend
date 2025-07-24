import {
  formattedCurrency,
  formatDate,
  formatIban,
  formatDateWithHours,
  formatDateWithoutHours,
  formatFileName,
  truncateString,
} from '../helpers';

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
    const result = formatDateWithHours('2022-10-01T14:05:00.000Z');
    expect(result).toBe('01/10/2022, 14:05');
  });

  test('formatDateWithHours with empty string', () => {
    expect(formatDateWithHours('')).toBe('-');
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
