import { describe, expect, it, vi } from 'vitest';
import { createWebSearchTool, isSafePublicWebURL, type WebSearchToolResult } from './web-search.js';
import { createSearxngSearch } from './searxng.js';

const source = { title: 'Official weather advisory', url: 'https://example.com/news?utm_source=spam', snippet: '<b>Public update</b>' };

async function invoke(searchTool: ReturnType<typeof createWebSearchTool>, input: { query: string; timeRange?: 'any' | 'day' | 'month' | 'year' }) {
  const execute = searchTool.execute!;
  return await execute(input, { abortSignal: new AbortController().signal } as Parameters<typeof execute>[1]) as WebSearchToolResult;
}

describe('public web search tool', () => {
  it('validates external HTTPS sources and rejects unsafe destinations', () => {
    expect(isSafePublicWebURL('https://example.com/story')).toBe(true);
    for (const bad of [
      'javascript:alert(1)', 'http://example.com', 'https://localhost/',
      'https://127.0.0.1/path', 'https://10.2.3.4/', 'https://192.168.1.50/',
      'https://internal.local/', 'https://user:pass@example.com',
    ]) expect(isSafePublicWebURL(bad)).toBe(false);
  });

  it('caps/deduplicates sources, strips tracking and HTML, and memoizes searches', async () => {
    const search = vi.fn(async () => [
      source, source, { title: 'javascript scheme', url: 'javascript:alert(1)', snippet: '' },
      { title: 'Another source', url: 'https://example.org/a', snippet: 'Extra' },
    ]);
    const t = createWebSearchTool({ search, maxResults: 2, now: () => new Date('2026-11-08T12:00:00Z') });
    const first = await invoke(t, { query: 'NFL injury update', timeRange: 'day' });
    const again = await invoke(t, { query: 'NFL injury update', timeRange: 'day' });
    expect(first).toEqual(again);
    expect(first).toMatchObject({
      ok: true, searchedAt: '2026-11-08T12:00:00.000Z',
      sources: [{ title: 'Official weather advisory', url: 'https://example.com/news', snippet: 'Public update' },
        { title: 'Another source', url: 'https://example.org/a' }],
    });
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('enforces the per-turn search budget without invoking the backend', async () => {
    const search = vi.fn(async () => [source]);
    const t = createWebSearchTool({ search, maxSearchesPerTurn: 1 });
    expect((await invoke(t, { query: 'football one' })).ok).toBe(true);
    expect(await invoke(t, { query: 'football two' })).toMatchObject({ ok: false, error: expect.stringContaining('limit') });
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('rejects private fields and supports an app-specific privacy policy', async () => {
    const search = vi.fn(async () => [source]);
    const t = createWebSearchTool({ search, allowQuery: q => !q.includes('private-team') });
    for (const query of ['token:secret123', 'person@example.com', 'private-team stats']) {
      expect((await invoke(t, { query })).ok).toBe(false);
    }
    expect(search).not.toHaveBeenCalled();
  });

  it('degrades safely when search is unavailable', async () => {
    const t = createWebSearchTool({ search: async () => { throw new Error('sensitive provider details'); } });
    const output = await invoke(t, { query: 'fresh headlines' });
    expect(output).toMatchObject({ ok: false, error: expect.stringContaining('temporarily unavailable') });
    expect(JSON.stringify(output)).not.toContain('sensitive provider details');
  });

  it('validates bounds on searches and results', () => {
    expect(() => createWebSearchTool({ search: async () => [], maxResults: 100 })).toThrow(RangeError);
    expect(() => createWebSearchTool({ search: async () => [], maxSearchesPerTurn: 0 })).toThrow(RangeError);
  });
});

describe('SearXNG adapter', () => {
  it('creates bounded GET requests with fixed endpoint, freshness and safe search', async () => {
    const urls: string[] = [];
    const fetchImpl = vi.fn(async (url: string) => {
      urls.push(url);
      return Response.json({ results: [{ title: 'Weather', url: 'https://example.com/weather', content: 'Advisory', publishedDate: '2026-11-08' }] });
    }) as unknown as typeof fetch;
    const search = createSearxngSearch({ baseURL: 'https://search.example.com/', fetchImpl });
    const hits = await search({ query: 'NFL weather', limit: 3, timeRange: 'day' });
    expect(new URL(urls[0]).pathname).toBe('/search');
    expect(new URL(urls[0]).searchParams.get('q')).toBe('NFL weather');
    expect(new URL(urls[0]).searchParams.get('format')).toBe('json');
    expect(new URL(urls[0]).searchParams.get('time_range')).toBe('day');
    expect(new URL(urls[0]).searchParams.get('safesearch')).toBe('1');
    expect(hits[0]).toMatchObject({ title: 'Weather', publishedAt: '2026-11-08' });
  });

  it('requires a trusted server endpoint and rejects malformed API responses', async () => {
    expect(() => createSearxngSearch({ baseURL: 'http://search.example.com/' })).toThrow();
    expect(() => createSearxngSearch({ baseURL: 'https://user:pass@example.com/' })).toThrow();
    const search = createSearxngSearch({
      baseURL: 'https://search.example.com/',
      fetchImpl: async () => new Response('Forbidden', { status: 403 }),
    });
    await expect(search({ query: 'public update', limit: 3, timeRange: 'any' })).rejects.toThrow('403');
  });
});
