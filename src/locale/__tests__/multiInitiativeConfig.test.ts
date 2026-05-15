/// <reference types="jest" />

import { loadItInitiativeConfig } from '../multiInitiativeConfig';

jest.mock('../it/testInitiative/default/config.json', () => ({
  __esModule: true,
  default: {
    tables: {
      products: { columns: [] },
    },
  },
}));

describe('multiInitiativeConfig dynamic loading', () => {
  it('should load default config dynamically', async () => {
    const result = await loadItInitiativeConfig('testInitiative');

    expect(result).toBeDefined();
    expect(result?.tables).toBeDefined();
    expect(result?.tables?.products).toBeDefined();
  });
});
