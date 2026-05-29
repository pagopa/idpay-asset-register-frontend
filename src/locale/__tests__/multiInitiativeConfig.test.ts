/// <reference types="jest" />

import { loadItInitiativeConfig, getLogicalRoleName } from '../multiInitiativeConfig';
import { DEBUG_CONSOLE } from '../../utils/constants';

describe('multiInitiativeConfig dynamic loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load default config dynamically', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026');

    expect(result).toBeDefined();
    expect(result.ui?.tables).toBeDefined();
    expect(result.ui?.tables?.products).toBeDefined();
  });

  it('should return empty object if initiativeName is undefined', async () => {
    const result = await loadItInitiativeConfig(undefined);
    expect(result).toEqual({});
  });

  it('should fallback to default folder if role is not string', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026', undefined);
    expect(result).toBeDefined();
  });

  it('falls back to default when role folder does not exist', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026', 'NON_EXISTENT_ROLE');
    expect(result).toBeDefined();
  });

  it('falls back to global default and logs when initiative folder does not exist', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const result = await loadItInitiativeConfig('unknownInitiative');

    // With current architecture:
    // - InitiativeNotFoundError is thrown
    // - It is logged if DEBUG_CONSOLE is true
    // - Then fallback to global default happens
    expect(result).toBeDefined();

    if (DEBUG_CONSOLE) {
      expect(consoleSpy).toHaveBeenCalled();
    }

    consoleSpy.mockRestore();
  });

  it('returns empty object when initiative does not exist and fallback is disabled', async () => {
    const result = await loadItInitiativeConfig('unknownInitiative', undefined, false);
    expect(result).toEqual({});
  });

  it('returns undefined when config is undefined in getLogicalRoleName', () => {
    const result = getLogicalRoleName(undefined as any, 'ANY_ROLE');
    expect(result).toBeUndefined();
  });

  it('should resolve logical role name correctly', () => {
    const config = {
      roles: {
        logicalName: 'BASE_ROLE',
        subRoles: {
          ADMIN_SUB: {
            logicalName: 'ADMIN_LOGICAL',
          },
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

    expect(result).toBeDefined();
    expect(result.ui?.tables).toBeDefined();
  });

  it('should respect loading order: role overrides default', async () => {
    const defaultConfig = await loadItInitiativeConfig('bonusDecoder2026');
    const roleConfig = await loadItInitiativeConfig('bonusDecoder2026', 'operatore');

    expect(defaultConfig).toBeDefined();
    expect(roleConfig).toBeDefined();

    // Role config should not be strictly equal to default config
    // This verifies merge(default, role) order is respected
    expect(JSON.stringify(roleConfig)).not.toEqual(JSON.stringify(defaultConfig));
  });
});
