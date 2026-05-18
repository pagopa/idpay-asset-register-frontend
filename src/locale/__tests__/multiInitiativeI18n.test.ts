/// <reference types="jest" />

import { loadItNamespace } from '../multiInitiativeI18n';

describe('multiInitiativeI18n – loadItNamespace', () => {
  it('loads common namespace', async () => {
    const result = await loadItNamespace('common');
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('loads default namespace file', async () => {
    const result = await loadItNamespace('default/common');
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('loads initiative namespace when file exists', async () => {
    // usa un namespace reale presente sotto src/locale/it
    const result = await loadItNamespace('bonusDecoder2026/operatore');
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('returns empty object when namespace format is invalid', async () => {
    const result = await loadItNamespace('invalidNamespace');
    expect(result).toEqual({});
  });

  it('returns empty object when file does not exist', async () => {
    const result = await loadItNamespace('unknownInitiative/unknownFile');
    expect(result).toEqual({});
  });
});
