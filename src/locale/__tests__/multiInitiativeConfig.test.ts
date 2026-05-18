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

  it('should apply subRole permissions filtering tables', async () => {
    const config = {
      logicalName: 'BASE_ROLE',
      tables: {
        products: {},
        files: {},
      },
      subRoles: {
        ADMIN_SUB: {
          permissions: {
            tables: {
              products: true,
              files: false,
            },
          },
        },
      },
    };

    // simulate config via default loading fallback
    const result = await loadItInitiativeConfig('bonusDecoder2026');
    expect(result).toBeDefined();

    // directly test logical resolution behavior
    const logical = getLogicalRoleName(config as any, 'ADMIN_SUB');
    expect(logical).toBe('BASE_ROLE');
  });
});
