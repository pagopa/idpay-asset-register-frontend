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

    const parts = namespace.split('/');
    const initiativeFolder = parts[0];
    const file = parts[1] ?? 'copy';

    if (!initiativeFolder) {
      return {};
    }

    const basePath = `./it/${initiativeFolder}/`;
    const mod = await import(`${basePath}${file}.json`);
    return mod.default as Resource;
  } catch (e) {
    return {};
  }
};
