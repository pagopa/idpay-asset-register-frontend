import { describe, expect, it } from '@jest/globals';
import { isMalformedPathname } from '../pathnameValidation';

describe('isMalformedPathname', () => {
  it('returns false for normal pathnames', () => {
    expect(isMalformedPathname('/base/panoramica', '/base')).toBe(false);
    expect(isMalformedPathname('/base/1/storico-caricamenti', '/base')).toBe(false);
  });

  it('returns true for double slash (empty inner segments)', () => {
    expect(isMalformedPathname('/base//storico-caricamenti', '/base')).toBe(true);
    expect(isMalformedPathname('/base///storico-caricamenti', '/base')).toBe(true);
  });

  it('returns true for dot segments', () => {
    expect(isMalformedPathname('/base/./storico-caricamenti', '/base')).toBe(true);
    expect(isMalformedPathname('/base/../storico-caricamenti', '/base')).toBe(true);
    expect(isMalformedPathname('/base/x/.', '/base')).toBe(true);
    expect(isMalformedPathname('/base/x/..', '/base')).toBe(true);
  });

  it('works when baseRoute is / (local dev)', () => {
    expect(isMalformedPathname('//storico-caricamenti', '/')).toBe(true);
    expect(isMalformedPathname('/1/storico-caricamenti', '/')).toBe(false);
  });
});
