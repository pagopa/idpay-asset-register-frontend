/// <reference types="jest" />

import { loadItNamespace } from '../multiInitiativeI18n';

describe('multiInitiativeI18n dynamic namespace loading', () => {
  it('should load initiative copy namespace dynamically', async () => {
    const result = await loadItNamespace('testInitiative/copy');

    expect(result).toBeDefined();
    expect((result as any).tables).toBeDefined();
    expect((result as any).tables.products.columns.gtinCode).toBe('Codice GTIN');
  });

  it('should return empty object for unknown namespace', async () => {
    const result = await loadItNamespace('unknownInitiative/copy');
    expect(result).toEqual({});
  });
});
