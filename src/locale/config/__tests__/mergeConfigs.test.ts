/// <reference types="jest" />

import { mergeConfigs } from '../mergeConfigs';

describe('mergeConfigs', () => {
  it('should return override if base is undefined', () => {
    const result = mergeConfigs(undefined as any, { a: 1 });
    expect(result).toEqual({ a: 1 });
  });

  it('should return base if override is undefined', () => {
    const result = mergeConfigs({ a: 1 }, undefined as any);
    expect(result).toEqual({ a: 1 });
  });

  it('should override primitive values', () => {
    const result = mergeConfigs({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it('should deeply merge nested objects', () => {
    const base = { a: { b: 1, c: 2 } };
    const override = { a: { b: 3 } };

    const result = mergeConfigs(base as any, override as any);

    expect(result).toEqual({ a: { b: 3, c: 2 } });
  });

  it('should replace arrays instead of merging them', () => {
    const base = { a: [1, 2] };
    const override = { a: [3] };

    const result = mergeConfigs(base, override);

    expect(result).toEqual({ a: [3] });
  });
});
