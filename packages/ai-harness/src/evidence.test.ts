import { describe, expect, it } from 'vitest';
import { createEvidenceRegistry, isSafeInternalPath } from './evidence.js';

describe('evidence registry', () => {
  it('selects only verified canonical paths, once, in requested order', () => {
    const registry = createEvidenceRegistry();
    expect(registry.addVerified({ path: '/minecraft/mods/create-fabric', title: 'Create (Fabric)' })).toBe(true);
    expect(registry.addVerified({ path: '/minecraft/modpacks/prominence-ii', title: 'Prominence II' })).toBe(true);
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
  it('reports rejected evidence and retains verified sources', () => {
    const registry = createEvidenceRegistry();
    expect(registry.addVerified({ path: '//evil.test', title: 'Unsafe' })).toBe(false);
    expect(registry.addVerified({ path: '/valid', title: '   ' })).toBe(false);
    expect(registry.select(['//evil.test', '/valid'])).toEqual([]);
    expect(registry.addVerified({ path: '/valid', title: '  Verified  ' })).toBe(true);
    expect(registry.select(['/valid'])).toEqual([{ path: '/valid', title: 'Verified' }]);
  });

  it('enforces the distinct-source cap but permits updates to known entries', () => {
    const registry = createEvidenceRegistry();
    for (let index = 0; index < 100; index++) {
      expect(registry.addVerified({ path: `/source-${index}`, title: `Source ${index}` })).toBe(true);
    }
    expect(registry.addVerified({ path: '/source-over-cap', title: 'Extra' })).toBe(false);
    expect(registry.addVerified({ path: '/source-0', title: 'Updated' })).toBe(true);
    expect(registry.select(['/source-over-cap', '/source-0'])).toEqual([
      { path: '/source-0', title: 'Updated' },
    ]);
  });

  it('bounds citation selection and rejects bad limits', () => {
    const registry = createEvidenceRegistry();
    expect(registry.select([], 0)).toEqual([]);
    expect(() => registry.select([], -1)).toThrow(RangeError);
    expect(() => registry.select([], 100)).toThrow(RangeError);
  });
});
