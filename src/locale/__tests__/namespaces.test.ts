import {
  LocaleNamespace,
  initiativeNamespaceGenerator,
  buildScopedNamespaces,
  type InitiativeDescriptor,
} from '../namespaces';

describe('LocaleNamespace enum', () => {
  test('Common has correct value', () => {
    expect(LocaleNamespace.Common).toBe('common');
  });

  test('DefaultCopy has correct value', () => {
    expect(LocaleNamespace.DefaultCopy).toBe('default/copy');
  });

  test('InitiativeCopy has correct value', () => {
    expect(LocaleNamespace.InitiativeCopy).toBe('initiative/copy');
  });

  test('enum contains exactly the expected keys', () => {
    const keys = Object.keys(LocaleNamespace);
    expect(keys).toEqual([
      'Common',
      'DefaultCopy',
      'InitiativeCopy',
    ]);
  });
});

describe('initiativeNamespaceGenerator', () => {
  test('maps a list of initiatives to their names', () => {
    const list: Array<InitiativeDescriptor> = [
      { initiativeId: 'id-1', initiativeName: 'initiative1' },
      { initiativeId: 'id-2', initiativeName: 'initiative2' },
    ];
    expect(initiativeNamespaceGenerator(list)).toEqual(['initiative1', 'initiative2']);
  });

  test('returns an empty array for an empty list', () => {
    expect(initiativeNamespaceGenerator([])).toEqual([]);
  });

  test('returns only initiative names, ignoring initiativeId', () => {
    const list: Array<InitiativeDescriptor> = [
      { initiativeId: 'ignored-id', initiativeName: 'myInitiative' },
    ];
    const result = initiativeNamespaceGenerator(list);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('myInitiative');
  });

  test('preserves the order of the input list', () => {
    const list: Array<InitiativeDescriptor> = [
      { initiativeId: 'c', initiativeName: 'charlie' },
      { initiativeId: 'a', initiativeName: 'alpha' },
      { initiativeId: 'b', initiativeName: 'beta' },
    ];
    expect(initiativeNamespaceGenerator(list)).toEqual(['charlie', 'alpha', 'beta']);
  });
});

describe('buildScopedNamespaces', () => {
  test('with an initiative name returns all three scopes populated', () => {
    const result = buildScopedNamespaces('bonusElettrodomestici2025');

    expect(result.common).toEqual([LocaleNamespace.Common]);
    expect(result.initiative).toEqual([
      'bonusElettrodomestici2025/copy',
    ]);
    expect(result.default).toEqual([
      LocaleNamespace.DefaultCopy,
    ]);
  });

  test('without an initiative name returns empty initiative array', () => {
    const result = buildScopedNamespaces();

    expect(result.common).toEqual([LocaleNamespace.Common]);
    expect(result.initiative).toEqual([]);
    expect(result.default).toEqual([
      LocaleNamespace.DefaultCopy,
    ]);
  });

  test('with undefined initiative name returns empty initiative array', () => {
    const result = buildScopedNamespaces(undefined);

    expect(result.initiative).toEqual([]);
  });

  test('default scope always contains the three default namespaces', () => {
    const withName = buildScopedNamespaces('someInitiative');
    const withoutName = buildScopedNamespaces();

    expect(withName.default).toEqual(withoutName.default);
    expect(withName.default).toHaveLength(1);
  });

  test('common scope always contains exactly one entry', () => {
    const withName = buildScopedNamespaces('someInitiative');
    const withoutName = buildScopedNamespaces();

    expect(withName.common).toHaveLength(1);
    expect(withoutName.common).toHaveLength(1);
    expect(withName.common).toEqual([LocaleNamespace.Common]);
  });

  test('initiative scope contains three entries when name is provided', () => {
    const result = buildScopedNamespaces('testInitiative');
    expect(result.initiative).toHaveLength(1);
  });

  test('initiative namespace paths follow the pattern <initiativeName>/<file>', () => {
    const initiativeName = 'myProgram';
    const result = buildScopedNamespaces(initiativeName);

    (result.initiative as ReadonlyArray<string>).forEach((ns) => {
      expect(ns.startsWith(`${initiativeName}/`)).toBe(true);
    });
  });
});
