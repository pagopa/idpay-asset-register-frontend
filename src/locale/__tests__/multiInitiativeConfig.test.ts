import defaultConfig from '../it/default/config.json';

const importMultiInitiativeConfig = async () => import('../multiInitiativeConfig');

describe('multiInitiativeConfig – real runtime aligned', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.dontMock('../config/permissionFilter');
    jest.dontMock('../config/mergeConfigs');
    jest.dontMock('../multiInitiativeBasePath');
  });

  describe('getLogicalRoleName', () => {
    it('covers all logical branches', async () => {
      const { getLogicalRoleName } = await importMultiInitiativeConfig();

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
      const { loadItInitiativeConfig } = await importMultiInitiativeConfig();

      const result = await loadItInitiativeConfig(undefined);
      expect(result).toEqual({});
    });

    it('returns {} for unknown initiative with fallback disabled', async () => {
      const { loadItInitiativeConfig } = await importMultiInitiativeConfig();

      const result = await loadItInitiativeConfig('missing', undefined, false);
      expect(result).toEqual({});
    });

    it('returns global default when initiative missing and fallback enabled', async () => {
      const { loadItInitiativeConfig } = await importMultiInitiativeConfig();

      const result = await loadItInitiativeConfig('missing');
      expect(result).toEqual(defaultConfig);
    });

    it('returns global default when initiative does not have its own config', async () => {
      const { loadItInitiativeConfig } = await importMultiInitiativeConfig();

      const result = await loadItInitiativeConfig('test');
      expect(result).toEqual(defaultConfig);
    });

    it('returns filtered global default when role provided', async () => {
      const { loadItInitiativeConfig } = await importMultiInitiativeConfig();

      const result = await loadItInitiativeConfig('test', 'admin_full');

      expect(result.roles).toBeDefined();
      expect(result.ui).toBeDefined();
      expect(result.ui?.tables).toEqual({});
    });

    it('falls back to initiative default when role-specific config is missing', async () => {
      const { loadItInitiativeConfig } = await importMultiInitiativeConfig();

      const result = await loadItInitiativeConfig(
        'bonusElettrodomestici',
        'missing_full',
        true,
        '2025-01-01'
      );

      expect(result).toMatchObject({
        roles: expect.any(Object),
        templates: expect.any(Object),
        ui: expect.any(Object),
      });
      expect(result).not.toEqual(defaultConfig);
    });

    it('returns {} when loader resolves to an invalid config shape', async () => {
      jest.doMock('../config/permissionFilter', () => ({
        applySubRolePermissions: jest.fn().mockReturnValue(null),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      await expect(fresh('default')).resolves.toEqual({});
    });

    it.skip('returns {} when role-specific loader resolves to an invalid config shape', async () => {
      jest.doMock('../config/permissionFilter', () => ({
        applySubRolePermissions: jest.fn().mockReturnValue('invalid-config'),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      await expect(fresh('bonusDecoder', 'invitalia_admin', true, '2026-01-01')).resolves.toEqual(
        {}
      );
    });

    it('logs the normalized role when debug console is enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

      jest.doMock('../../utils/constants', () => ({
        DEBUG_CONSOLE: true,
        DEFAULT_INITIATIVE_NAMESPACE: 'default',
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      await fresh('bonusDecoder', 'invitalia_admin', true, '2026-01-01');

      expect(consoleSpy).toHaveBeenCalledWith('role normalized:', 'invitalia');

      consoleSpy.mockRestore();
    });

    it.skip('propagates unexpected errors from initiative default loading', async () => {
      jest.doMock('../config/mergeConfigs', () => ({
        mergeConfigs: jest.fn(() => {
          throw new Error('merge boom');
        }),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      await expect(fresh('bonusDecoder', undefined, true, '2026-01-01')).rejects.toThrow(
        'merge boom'
      );
    });

    it('propagates unexpected errors', async () => {
      jest.resetModules();
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: () => {
          throw new Error('boom');
        },
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      await expect(fresh('test')).rejects.toThrow('boom');
    });

    it('returns global default when role normalizes to empty (empty string role)', async () => {
      const { loadItInitiativeConfig } = await importMultiInitiativeConfig();

      const result = await loadItInitiativeConfig('default', '');

      expect(result).toEqual(defaultConfig);
    });

    it('returns global default when role is whitespace-only', async () => {
      const { loadItInitiativeConfig } = await importMultiInitiativeConfig();

      const result = await loadItInitiativeConfig('default', '   ');

      expect(result).toEqual(defaultConfig);
    });

    it('merges global default with initiative default config when loading without role', async () => {
      const mergeSpy = jest.fn((base: any, override: any) => ({ ...base, ...override }));
      jest.doMock('../config/mergeConfigs', () => ({ mergeConfigs: mergeSpy }));
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: jest.fn().mockReturnValue('./it/bonusDecoder2026/'),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      const result = await fresh('bonusDecoder');

      expect(mergeSpy).toHaveBeenCalled();
      expect(result).toMatchObject({ roles: expect.any(Object) });
    });

    it('merges global, initiative, and role-specific configs when all exist', async () => {
      const mergeSpy = jest.fn((base: any, override: any) => ({ ...base, ...override }));
      jest.doMock('../config/mergeConfigs', () => ({ mergeConfigs: mergeSpy }));
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: jest.fn().mockReturnValue('./it/bonusDecoder2026/'),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      const result = await fresh('bonusDecoder', 'invitalia_admin');

      expect(mergeSpy).toHaveBeenCalledTimes(2);
      expect(result).toMatchObject({ roles: expect.any(Object) });
    });

    it('propagates non-module-not-found error from initiative default config loading (covers lines 98, 207)', async () => {
      jest.doMock('../config/mergeConfigs', () => ({
        mergeConfigs: jest.fn(() => {
          throw new TypeError('merge type error');
        }),
      }));
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: jest.fn().mockReturnValue('./it/bonusDecoder2026/'),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      await expect(fresh('bonusDecoder')).rejects.toThrow('merge type error');
    });

    it('propagates non-module-not-found error from role-specific config loading (covers lines 126, 184, 207)', async () => {
      jest.doMock('../config/permissionFilter', () => ({
        applySubRolePermissions: jest.fn(() => {
          throw new TypeError('permission filter error');
        }),
      }));
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: jest.fn().mockReturnValue('./it/bonusDecoder2026/'),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      await expect(fresh('bonusDecoder', 'invitalia_admin')).rejects.toThrow(
        'permission filter error'
      );
    });

    it('isModuleNotFoundError matches error with message containing "Cannot find module"', async () => {
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: jest.fn().mockReturnValue('./it/noCodeInit/'),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      const result = await fresh('noCodeInit');
      expect(result).toEqual(defaultConfig);
    });

    it('falls back to initiative default when role-specific file is missing (covers line 181)', async () => {
      const mergeSpy = jest.fn((base: any, override: any) => ({ ...base, ...override }));
      jest.doMock('../config/mergeConfigs', () => ({ mergeConfigs: mergeSpy }));
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: jest.fn().mockReturnValue('./it/bonusDecoder2026/'),
      }));

      const { loadItInitiativeConfig: fresh } = await importMultiInitiativeConfig();

      const result = await fresh('bonusDecoder', 'unknownrole_admin');

      expect(result).toMatchObject({ roles: expect.any(Object) });
      expect(mergeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
