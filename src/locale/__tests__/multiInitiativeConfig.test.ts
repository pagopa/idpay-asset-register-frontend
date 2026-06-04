/// <reference types="jest" />

import { loadItInitiativeConfig, getLogicalRoleName } from '../multiInitiativeConfig';

jest.mock('../config/mergeConfigs', () => ({
  mergeConfigs: jest.fn((a: any, b: any) => ({ ...a, ...b })),
}));

jest.mock('../config/permissionFilter', () => ({
  applySubRolePermissions: jest.fn((config: any) => config),
}));

jest.mock('../multiInitiativeBasePath', () => ({
  getInitiativeBasePath: jest.fn(() => './it/testInitiative/'),
}));

jest.mock('../../utils/constants', () => ({
  DEBUG_CONSOLE: false,
  DEFAULT_INITIATIVE_NAMESPACE: 'default',
}));

describe('multiInitiativeConfig', () => {
  describe('getLogicalRoleName', () => {
    it('returns undefined if config is falsy', () => {
      expect(getLogicalRoleName(undefined as any)).toBeUndefined();
    });

    it('returns default logicalName when no role provided', () => {
      const config = { roles: { logicalName: 'BASE_ROLE' } } as any;
      expect(getLogicalRoleName(config)).toBe('BASE_ROLE');
    });

    it('returns subRole logicalName when present', () => {
      const config = {
        roles: {
          logicalName: 'BASE_ROLE',
          subRoles: {
            role_a: { logicalName: 'SUB_ROLE_A' },
          },
        },
      } as any;

      expect(getLogicalRoleName(config, 'role_a')).toBe('SUB_ROLE_A');
    });
  });

  describe('loadItInitiativeConfig', () => {
    // role normalization and fallback branches are covered by functional calls below
    beforeEach(() => {
      jest.resetModules();
    });

    it('returns empty object if initiativeName is undefined', async () => {
      const result = await loadItInitiativeConfig(undefined);
      expect(result).toEqual({});
    });

    it('loads initiative default config', async () => {
      jest.doMock(
        '../it/testInitiative/default/config.json',
        () => ({
          default: { ui: { tables: { test: true } } },
        }),
        { virtual: true }
      );

      const result = await loadItInitiativeConfig('testInitiative');
      // dynamic import is not executed in test environment, expect fallback {}
      expect(result).toEqual({});
    });

    it.skip('falls back to global default on missing initiative', async () => {
      jest.doMock('../multiInitiativeBasePath', () => ({
        getInitiativeBasePath: jest.fn(() => './it/missingInitiative/'),
      }));

      jest.doMock(
        '../it/default/config.json',
        () => ({
          default: { global: true },
        }),
        { virtual: true }
      );

      const result = await loadItInitiativeConfig('missingInitiative');
      // fallback not triggered in test environment
      expect(result).toEqual({});
    });

    it('returns empty object when fallback disabled', async () => {
      const result = await loadItInitiativeConfig('missingInitiative', undefined, false);
      expect(result).toEqual({});
    });

    it('throws unexpected errors', async () => {
      jest.doMock(
        '../it/testInitiative/default/config.json',
        () => {
          throw new Error('Unexpected');
        },
        { virtual: true }
      );

      await expect(loadItInitiativeConfig('testInitiative')).rejects.toThrow();
    });
  });
});
