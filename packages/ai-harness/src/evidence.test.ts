import { describe, expect, it } from 'vitest';
import { createEvidenceRegistry, isSafeInternalPath } from './evidence';

describe('evidence registry', () => {
  it('selects only verified canonical paths, once, in requested order', () => {
    const registry = createEvidenceRegistry();
    registry.addVerified({ path: '/minecraft/mods/create-fabric', title: 'Create (Fabric)' });
    registry.addVerified({ path: '/minecraft/modpacks/prominence-ii', title: 'Prominence II' });
    const selected = registry.select([
      '/missing', '/minecraft/modpacks/prominence-ii',
      '/minecraft/mods/create-fabric', '/minecraft/mods/create-fabric',
    ]);
    expect(selected).toEqual([
      { path: '/minecraft/modpacks/prominence-ii', title: 'Prominence II' },
      { path: '/minecraft/mods/create-fabric', title: 'Create (Fabric)' },
    ]);
  });
  it.each(['//evil.test', 'https://evil.test', '/a/../b', '/a/%2e%2e/b', '/a\\b', '/a?x=1', '/a#fragment'])(
    'does not trust unsafe paths: %s',
    (value) => expect(isSafeInternalPath(value)).toBe(false),
  );
  it('bounds citation selection and rejects bad limits', () => {
    const registry = createEvidenceRegistry();
    expect(registry.select([], 0)).toEqual([]);
    expect(() => registry.select([], -1)).toThrow(RangeError);
    expect(() => registry.select([], 100)).toThrow(RangeError);
  });
});
