export const mergeConfigs = <T extends Record<string, any>>(base: T, override: Partial<T>): T => {
  if (!base) {
    return override as T;
  }

  if (!override) {
    return base;
  }

  if (Array.isArray(base) || Array.isArray(override)) {
    return (override ?? base) as T;
  }

  return Object.keys(override).reduce(
    (acc, key) => {
      const baseValue = base[key];
      const overrideValue = override[key];

      const mergedValue =
        baseValue &&
        overrideValue &&
        typeof baseValue === 'object' &&
        typeof overrideValue === 'object' &&
        !Array.isArray(baseValue) &&
        !Array.isArray(overrideValue)
          ? mergeConfigs(baseValue as any, overrideValue as any)
          : overrideValue;

      return {
        ...acc,
        [key]: mergedValue,
      };
    },
    { ...base }
  );
};
