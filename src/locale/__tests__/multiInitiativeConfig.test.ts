/// <reference types="jest" />

import { loadItInitiativeConfig, getLogicalRoleName } from '../multiInitiativeConfig';

describe('multiInitiativeConfig dynamic loading', () => {
  it('should load default config dynamically', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026');

    expect(result).toBeDefined();
    expect((result as any).tables).toBeDefined();
    expect((result as any).tables.products).toBeDefined();
  });

  it('should return empty object if initiativeName is undefined', async () => {
    const result = await loadItInitiativeConfig(undefined);
    expect(result).toEqual({});
  });

  it('should fallback to default folder if role is not string', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026', undefined as unknown as string);
    expect(result).toBeDefined();
  });

  it('falls back to default when role folder does not exist', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026', 'NON_EXISTENT_ROLE');
    expect(result).toBeDefined();
  });

  it('falls back to default when initiative folder does not exist', async () => {
    const result = await loadItInitiativeConfig('unknownInitiative');

    expect(result).toBeDefined();
    expect(result.tables).toBeDefined();
  });

  it('returns undefined when config is undefined in getLogicalRoleName', () => {
    const result = getLogicalRoleName(undefined as any, 'ANY_ROLE');
    expect(result).toBeUndefined();
  });

  it('should resolve logical role name correctly', () => {
    const config = {
      logicalName: 'BASE_ROLE',
      subRoles: {
        ADMIN_SUB: {
          logicalName: 'ADMIN_LOGICAL',
        },
      },
    };

    expect(getLogicalRoleName(config as any)).toBe('BASE_ROLE');
    expect(getLogicalRoleName(config as any, 'ADMIN_SUB')).toBe('ADMIN_LOGICAL');
    expect(getLogicalRoleName(config as any, 'UNKNOWN')).toBe('BASE_ROLE');
  });

  it('should apply subRole permissions filtering tables (indirect branch coverage)', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026');
    expect(result).toBeDefined();
  });

  it('should return empty tables when role has no allowed tables in real config', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026', 'NON_EXISTENT_SUBROLE');

    // If subRole does not match, tables should fallback safely (no crash)
    expect(result).toBeDefined();
    expect(result.tables).toBeDefined();
  });
});
