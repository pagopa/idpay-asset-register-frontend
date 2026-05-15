/// <reference types="jest" />

import {
  normalizeInitiativeName,
  buildInitiativeFolderName,
  getInitiativeBasePath,
} from '../multiInitiativeBasePath';

describe('multiInitiativeBasePath', () => {
  describe('normalizeInitiativeName', () => {
    it('should convert display name to camelCase', () => {
      expect(normalizeInitiativeName('Bonus Decoder')).toBe('bonusDecoder');
      expect(normalizeInitiativeName('Bonus Elettrodomestici')).toBe('bonusElettrodomestici');
    });

    it('should trim and normalize multiple spaces', () => {
      expect(normalizeInitiativeName('  Bonus   Decoder  ')).toBe('bonusDecoder');
    });
  });

  describe('buildInitiativeFolderName', () => {
    it('should append year from startDate', () => {
      expect(buildInitiativeFolderName('Bonus Decoder', '2026-01-01')).toBe('bonusDecoder2026');

      expect(buildInitiativeFolderName('Bonus Elettrodomestici', '2025-03-10')).toBe(
        'bonusElettrodomestici2025'
      );
    });

    it('should return base name if startDate is undefined', () => {
      expect(buildInitiativeFolderName('Bonus Decoder')).toBe('bonusDecoder');
    });
  });

  describe('getInitiativeBasePath', () => {
    it('should build correct base path', () => {
      expect(getInitiativeBasePath('Bonus Decoder', '2026-01-01')).toBe('./it/bonusDecoder2026/');
    });
  });
});
