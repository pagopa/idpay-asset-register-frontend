import {
  getInitiativeFolderName,
  getInitiativeBasePath,
} from '../multiInitiativeBasePath';

describe('multiInitiativeBasePath', () => {
  const originalElettrodomesticiId = process.env.REACT_APP_INITIATIVE_ID_BONUS_ELETTRODOMESTICI;
  const originalDecoderId = process.env.REACT_APP_INITIATIVE_ID_BONUS_DECODER;

  beforeEach(() => {
    process.env.REACT_APP_INITIATIVE_ID_BONUS_ELETTRODOMESTICI = 'elettrodomestici-id';
    process.env.REACT_APP_INITIATIVE_ID_BONUS_DECODER = 'decoder-id';
  });

  afterEach(() => {
    if (originalElettrodomesticiId === undefined) {
      delete process.env.REACT_APP_INITIATIVE_ID_BONUS_ELETTRODOMESTICI;
    } else {
      process.env.REACT_APP_INITIATIVE_ID_BONUS_ELETTRODOMESTICI = originalElettrodomesticiId;
    }

    if (originalDecoderId === undefined) {
      delete process.env.REACT_APP_INITIATIVE_ID_BONUS_DECODER;
    } else {
      process.env.REACT_APP_INITIATIVE_ID_BONUS_DECODER = originalDecoderId;
    }
  });

  describe('getInitiativeFolderName', () => {
    it('resolves initiative folders by initiative ID', () => {
      expect(getInitiativeFolderName('elettrodomestici-id')).toBe('bonusElettrodomestici2025');
      expect(getInitiativeFolderName('decoder-id')).toBe('bonusDecoder2026');
    });

    it('returns an empty namespace for an unknown initiative ID', () => {
      expect(getInitiativeFolderName('unknown-id')).toBe('');
    });
  });

  describe('getInitiativeBasePath', () => {
    it('builds the base path from the initiative ID', () => {
      expect(getInitiativeBasePath('decoder-id')).toBe('./it/bonusDecoder2026/');
    });

    it('returns an empty path for an unknown initiative ID', () => {
      expect(getInitiativeBasePath('unknown-id')).toBe('');
    });
  });
});
