/// <reference types="jest" />

import { loadItInitiativeConfig, getLogicalRoleName } from '../multiInitiativeConfig';
import defaultConfig from '../it/default/config.json';

describe('multiInitiativeConfig – real runtime aligned', () => {
  describe('getLogicalRoleName', () => {
    it('covers all logical branches', () => {
      expect(getLogicalRoleName(undefined as any)).toBeUndefined();

      const base = { roles: { logicalName: 'BASE' } } as any;
      expect(getLogicalRoleName(base)).toBe('BASE');

      const withSub = {
        roles: {
          logicalName: 'BASE',
          subRoles: {
            role_a: { logicalName: 'SUB_A' },
          },
        },
      } as any;

      expect(getLogicalRoleName(withSub, 'role_a')).toBe('SUB_A');

      const withoutOverride = {
        roles: {
          logicalName: 'BASE',
          subRoles: {
            role_a: {},
          },
        },
      } as any;

      expect(getLogicalRoleName(withoutOverride, 'role_a')).toBe('BASE');
    });
  });

  describe('loadItInitiativeConfig', () => {
    it('returns {} when initiativeName is undefined', async () => {
      const result = await loadItInitiativeConfig(undefined);
      expect(result).toEqual({});
    });

    it('returns {} for unknown initiative with fallback disabled', async () => {
      const result = await loadItInitiativeConfig('missing', undefined, false);
      expect(result).toEqual({});
    });

    it('returns global default when initiative missing and fallback enabled', async () => {
      const result = await loadItInitiativeConfig('missing');
      expect(result).toEqual(defaultConfig);
    });

    it('returns global default when initiative does not have its own config', async () => {
      const result = await loadItInitiativeConfig('test');
      expect(result).toEqual(defaultConfig);
    });

    it('returns filtered global default when role provided', async () => {
      const result = await loadItInitiativeConfig('test', 'admin_full');

      expect(result.roles).toBeDefined();
      expect(result.ui).toBeDefined();
      expect(result.ui?.tables).toEqual({});
    });

    it('propagates unexpected errors', async () => {
      jest.resetModules();
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: () => {
          throw new Error('boom');
        },
      }));

      const { loadItInitiativeConfig: fresh } = await import('../multiInitiativeConfig');

      await expect(fresh('test')).rejects.toThrow('boom');
    });
  });
});
