/// <reference types="jest" />

import { loadItInitiativeConfig } from '../multiInitiativeConfig';

describe('multiInitiativeConfig dynamic loading', () => {
  it('should load default config dynamically', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026');

    expect(result).toBeDefined();
    expect((result as any).tables).toBeDefined();
    expect((result as any).tables.products).toBeDefined();
  });
});
