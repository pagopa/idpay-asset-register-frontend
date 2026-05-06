import type { Resource } from 'i18next';

export const loadItNamespace = async (namespace: string): Promise<Resource> => {
  try {
    if (namespace === 'common' || namespace === 'commons') {
      const mod = await import('./it/common.json');

      return mod.default as Resource;
    }

    if (namespace.startsWith('default/')) {
      const file = namespace.replace('default/', '');
      const mod = await import(`./it/default/${file}.json`);

      return mod.default as Resource;
    }

    const [initiativeName, file] = namespace.split('/');
    if (!initiativeName || !file) {
      return {};
    }

    const mod = await import(`./it/${initiativeName}/${file}.json`);
    return mod.default as Resource;
  } catch (e) {
    return {};
  }
};
