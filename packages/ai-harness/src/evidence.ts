/** Evidence is supplied by verified application tools, never by a model's claimed URL. */
export interface EvidenceSource {
  readonly path: string;
  readonly title: string;
}

/** Reject protocol-relative URLs, schemes, backslashes, control chars and traversal. */
export function isSafeInternalPath(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\/(?!\/)[^\\?#\s\x00-\x1f]*$/.test(value)) return false;
  const segments = value.split('/');
  return !segments.some((segment) => segment === '.' || segment === '..' || /%2f|%5c|%2e/i.test(segment));
}

export interface EvidenceRegistry {
  /** Register an application-verified source. Returns false for unsafe paths, blank titles, or when the 100-distinct-source cap is reached. Existing paths may be updated at capacity. */
  readonly addVerified: (source: EvidenceSource) => boolean;
  /** Select only previously registered paths, in requested order, without inventing titles. @param max Maximum citations to return (default 3; allowed 0–20). */
  readonly select: (paths: readonly string[], max?: number) => readonly EvidenceSource[];
}

export function createEvidenceRegistry(): EvidenceRegistry {
  const verified = new Map<string, EvidenceSource>();
  return {
    addVerified(source) {
      if (!isSafeInternalPath(source.path) || !source.title.trim()) return false;
      if (verified.size >= 100 && !verified.has(source.path)) return false;
      verified.set(source.path, { path: source.path, title: source.title.trim() });
      return true;
    },
    select(paths, max = 3) {
      if (!Number.isInteger(max) || max < 0 || max > 20) {
        throw new RangeError('citation limit must be an integer from 0 to 20');
      }
      const used = new Set<string>();
      const selected: EvidenceSource[] = [];
      for (const path of paths) {
        if (used.has(path)) continue;
        used.add(path);
        const source = verified.get(path);
        if (source) selected.push(source);
        if (selected.length >= max) break;
      }
      return selected.slice(0, max);
    },
  };
}
