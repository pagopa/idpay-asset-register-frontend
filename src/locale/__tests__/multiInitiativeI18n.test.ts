import { loadItNamespace } from '../multiInitiativeI18n';

describe('loadItNamespace', () => {
  describe('common namespace', () => {
    test('returns common.json content for "common" namespace', async () => {
      const result = await loadItNamespace('common');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).not.toEqual({});
    });

    test('returns common.json content for "commons" alias namespace', async () => {
      const result = await loadItNamespace('commons');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).not.toEqual({});
    });

    test('"common" and "commons" return the same content', async () => {
      const common = await loadItNamespace('common');
      const commons = await loadItNamespace('commons');
      expect(common).toEqual(commons);
    });
  });

  describe('default/* namespaces', () => {
    test('returns content for "default/copy" namespace', async () => {
      const result = await loadItNamespace('default/copy');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).not.toEqual({});
    });

    test('returns content for "default/tos" namespace', async () => {
      const result = await loadItNamespace('default/tos');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).not.toEqual({});
    });

    test('resolves for "default/privacyPolicy" namespace (placeholder file is {})', async () => {
      const result = await loadItNamespace('default/privacyPolicy');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('initiative-specific namespaces', () => {
    test('returns content for "bonusElettrodomestici2025/copy" namespace', async () => {
      const result = await loadItNamespace('bonusElettrodomestici2025/copy');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).not.toEqual({});
    });

    test('returns content for "bonusDecoder2026/copy" namespace', async () => {
      const result = await loadItNamespace('bonusDecoder2026/copy');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).not.toEqual({});
    });
  });

  describe('invalid / unknown namespaces', () => {
    test('returns {} when namespace has no slash (no file part)', async () => {
      const result = await loadItNamespace('singleSegment');
      expect(result).toEqual({});
    });

    test('returns {} when namespace starts with a slash (empty initiative name)', async () => {
      const result = await loadItNamespace('/copy');
      expect(result).toEqual({});
    });

    test('returns {} when namespace is an empty string', async () => {
      const result = await loadItNamespace('');
      expect(result).toEqual({});
    });

    test('returns {} when the corresponding JSON file does not exist', async () => {
      const result = await loadItNamespace('nonExistentInitiative/nonExistentFile');
      expect(result).toEqual({});
    });

    test('returns {} for an unknown default sub-file', async () => {
      const result = await loadItNamespace('default/nonExistentFile');
      expect(result).toEqual({});
    });
  });
});
