/// <reference types="jest" />

import { loadItInitiativeConfig } from '../multiInitiativeConfig';

describe('multiInitiativeConfig dynamic loading', () => {
  it('should load default config dynamically', async () => {
    const result = await loadItInitiativeConfig('bonusDecoder2026');

    expect(result).toBeDefined();
    expect(result?.tables).toBeDefined();
    expect(result?.tables?.products).toBeDefined();
  });
});
