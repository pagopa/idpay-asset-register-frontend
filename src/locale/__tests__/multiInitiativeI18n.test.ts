/// <reference types="jest" />

import { loadItNamespace } from '../multiInitiativeI18n';

describe('multiInitiativeI18n – loadItNamespace', () => {
  const expectNamespaceToLoad = async (namespace: string) => {
    const result = await loadItNamespace(namespace);
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  };

  const expectNamespaceToBeEmpty = async (namespace: string) => {
    const result = await loadItNamespace(namespace);
    expect(result).toEqual({});
  };

  it.each([
    ['common namespace', 'common'],
    ['default namespace file', 'default/common'],
    ['initiative namespace when file exists', 'bonusDecoder2026/operatore'],
  ])('loads %s', async (_, namespace) => {
    await expectNamespaceToLoad(namespace);
  });

  it.each([
    ['namespace format is invalid', 'invalidNamespace'],
    ['file does not exist', 'unknownInitiative/unknownFile'],
  ])('returns empty object when %s', async (_, namespace) => {
    await expectNamespaceToBeEmpty(namespace);
  });
});
