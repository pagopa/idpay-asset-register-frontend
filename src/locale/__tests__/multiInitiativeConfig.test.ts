import { loadItInitiativeConfig, getLogicalRoleName } from '../multiInitiativeConfig';
import { DEFAULT_INITIATIVE_NAMESPACE } from '../../utils/constants';

jest.mock('../multiInitiativeBasePath', () => ({
  getInitiativeBasePath: jest.fn(),
}));

jest.mock('../config/mergeConfigs', () => ({
  mergeConfigs: jest.fn((a, b) => ({ ...a, ...b })),
}));

jest.mock('../config/permissionFilter', () => ({
  applySubRolePermissions: jest.fn((c) => c),
}));

describe('multiInitiativeConfig (stable coverage)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns {} when initiativeName is undefined', async () => {
    const result = await loadItInitiativeConfig(undefined);
    expect(result).toEqual({});
  });

  it('returns {} when allowFallback is false and initiative not found', async () => {
    const basePathMock = require('../multiInitiativeBasePath').getInitiativeBasePath;
    basePathMock.mockReturnValueOnce('./it/nonexistent/');

    const result = await loadItInitiativeConfig('nonexistent', undefined, false);
    expect(result).toEqual({});
  });

  it('resolveBasePathSafe fallback branch is executed', async () => {
    const basePathMock = require('../multiInitiativeBasePath').getInitiativeBasePath;
    basePathMock.mockReturnValueOnce('./it//');

    const result = await loadItInitiativeConfig('demo');
    expect(result).toBeUndefined();
  });

  it('executeInitiativeLoad handles non-string role', async () => {
    const basePathMock = require('../multiInitiativeBasePath').getInitiativeBasePath;
    basePathMock.mockReturnValueOnce('./it/demo/');

    const result = await loadItInitiativeConfig('demo', undefined);
    expect(result).toBeUndefined();
  });

  it('getLogicalRoleName returns undefined when config missing', () => {
    expect(getLogicalRoleName(undefined as any, 'role')).toBeUndefined();
  });

  it('getLogicalRoleName returns base logicalName when role not provided', () => {
    const config: any = {
      roles: {
        logicalName: 'baseRole',
      },
    };

    expect(getLogicalRoleName(config)).toBe('baseRole');
  });

  it('getLogicalRoleName returns subRole logicalName when available', () => {
    const config: any = {
      roles: {
        logicalName: 'baseRole',
        subRoles: {
          invitalia_l1: { logicalName: 'subRoleName' },
        },
      },
    };

    expect(getLogicalRoleName(config, 'invitalia_l1')).toBe('subRoleName');
  });
});
