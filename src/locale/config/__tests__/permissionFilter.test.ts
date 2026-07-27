/// <reference types="jest" />

import { applySubRolePermissions } from '../permissionFilter';
import { InitiativeTablesConfig } from '../../multiInitiativeConfig';

describe('applySubRolePermissions', () => {
  it('should return original config if subRole is undefined', () => {
    const config: InitiativeTablesConfig = {
      ui: {
        tables: {
          a: {},
          b: {},
        },
      },
    };

    const result = applySubRolePermissions(config);

    expect(result).toEqual(config);
  });

  it('should filter tables based on subRole permissions', () => {
    const config: InitiativeTablesConfig = {
      roles: {
        subRoles: {
          TEST_SUB: {
            permissions: {
              tables: ['a'],
            },
          },
        },
      } as any,
      ui: {
        tables: {
          a: {},
          b: {},
        },
      },
    };

    const result = applySubRolePermissions(config, 'TEST_SUB');

    expect(result.ui?.tables).toEqual({ a: {} });
  });

  it('should return empty tables if subRole exists but has no permissions', () => {
    const config: InitiativeTablesConfig = {
      roles: {
        subRoles: {
          TEST_SUB: {},
        },
      } as any,
      ui: {
        tables: {
          a: {},
        },
      },
    };

    const result = applySubRolePermissions(config, 'TEST_SUB');

    expect(result.ui?.tables).toEqual({});
  });
});
