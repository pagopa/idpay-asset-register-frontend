/// <reference types="jest" />

import { buildInitiativeFolderName, getInitiativeBasePath } from '../multiInitiativeBasePath';

describe('multiInitiativeBasePath', () => {
  describe('buildInitiativeFolderName', () => {
    it('should delegate to buildNamespaceKey and append year', () => {
      expect(buildInitiativeFolderName('Bonus Decoder', '2026-01-01')).toBe('bonusDecoder2026');

      expect(buildInitiativeFolderName('Bonus Elettrodomestici', '2025-03-10')).toBe(
        'bonusElettrodomestici2025'
      );
    });

    it('should return empty string if startDate is undefined', () => {
      expect(buildInitiativeFolderName('Bonus Decoder')).toBe('');
    });
  });

  describe('getInitiativeBasePath', () => {
    it('should build correct base path using namespace key', () => {
      expect(getInitiativeBasePath('Bonus Decoder', '2026-01-01')).toBe('./it/bonusDecoder2026/');
    });
  });
});
