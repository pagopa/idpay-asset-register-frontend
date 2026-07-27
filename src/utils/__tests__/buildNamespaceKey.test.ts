import { buildNamespaceKey } from '../buildNamespaceKey';

describe('buildNamespaceKey', () => {
  it('returns empty string if name is empty', () => {
    expect(buildNamespaceKey('', '2024-01-01')).toBe('');
  });

  it('returns empty string if startDate is empty', () => {
    expect(buildNamespaceKey('TestName', '')).toBe('');
  });

  it('builds camelCase namespace with year (case insensitive)', () => {
    const date = '2025-01-01';
    const expected = 'bonusElettrodomestici2025';

    const variations = [
      'Bonus Elettrodomestici',
      'bonus Elettrodomestici',
      'Bonus elettrodomestici',
      'bonus elettrodomestici',
    ];

    variations.forEach((name) => {
      expect(buildNamespaceKey(name, date)).toBe(expected);
    });
  });

  it('removes special characters and handles numbers', () => {
    expect(buildNamespaceKey('My Initiative! @2024', '2023-03-15')).toBe(
      'myInitiative20242023'
    );
  });

  it('handles multiple spaces correctly', () => {
    expect(
      buildNamespaceKey('My   New   Initiative', '2021-12-31')
    ).toBe('myNewInitiative2021');
  });

  it('normalizes entire string before camelCase rebuild', () => {
    expect(buildNamespaceKey('TESTName', '2022-07-01')).toBe(
      'testname2022'
    );
  });
});
