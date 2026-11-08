import { describe, expect, it, vi } from 'vitest';
import { createLiteLLMMcpSearch, parseLiteLLMMcpSearchSources } from './litellm-mcp-search.js';
import { createWebSearchTool, type WebSearchToolResult } from './web-search.js';

const options = { baseURL: 'https://litellm.example', apiKey: 'sk-test' };
const makeResponse = (results: unknown) => new Response(JSON.stringify({
  content: [{ type: 'text', text: JSON.stringify({ results }) }],
}), { headers: { 'Content-Type': 'application/json' } });

describe('LiteLLM MCP search adapter', () => {
  it('rejects invalid gateway origins, credentials, tools and bounds', () => {
    expect(() => createLiteLLMMcpSearch({ ...options, baseURL: 'http://litellm.example' })).toThrow();
    expect(() => createLiteLLMMcpSearch({ ...options, baseURL: 'https://litellm.example/v1' })).toThrow();
    expect(() => createLiteLLMMcpSearch({ ...options, apiKey: '' })).toThrow();
    expect(() => createLiteLLMMcpSearch({ ...options, serverId: '../server' })).toThrow();
    expect(() => createLiteLLMMcpSearch({ ...options, toolName: 'delete_records' })).toThrow();
    expect(() => createLiteLLMMcpSearch({ ...options, timeoutMs: 499 })).toThrow();
    expect(() => createLiteLLMMcpSearch({ ...options, timeoutMs: 20001 })).toThrow();
  });

  it('calls only web_search with public query over LiteLLM REST', async () => {
    const fetchImpl = vi.fn(async () => makeResponse([
      { title: 'Weather report', url: 'https://example.org/story', content: 'Rain expected', publishedDate: '2026-11-08' },
    ]));
    const search = createLiteLLMMcpSearch({ ...options, fetchImpl: fetchImpl as typeof fetch });
    const sources = await search({ query: 'Maryland weather', limit: 5, timeRange: 'day' });
    expect(sources).toEqual([{
      title: 'Weather report', url: 'https://example.org/story', snippet: 'Rain expected', publishedAt: '2026-11-08',
    }]);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://litellm.example/mcp-rest/tools/call');
    expect(init.redirect).toBe('error');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer sk-test' });
    expect(JSON.parse(String(init.body))).toEqual({
      server_id: 'searxng', name: 'web_search',
      arguments: { query: 'Maryland weather', categories: 'general', response_format: 'json', time_range: 'day' },
    });
  });

  it('handles structured MCP responses and empty search results', () => {
    expect(parseLiteLLMMcpSearchSources({
      structuredContent: { results: [{ title: 'A', url: 'https://example.org/a', content: 'Snippet' }] },
    })).toEqual([{ title: 'A', url: 'https://example.org/a', snippet: 'Snippet' }]);
    expect(parseLiteLLMMcpSearchSources(makePlain())).toEqual([]);
    expect(() => parseLiteLLMMcpSearchSources({ isError: true })).toThrow();
    expect(() => parseLiteLLMMcpSearchSources({ content: [{ type: 'text', text: 'Error: denied' }] })).toThrow();
  });

  it('honors cancellation, server errors and response caps', async () => {
    const abort = new AbortController();
    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
      expect(init?.signal).toBeDefined();
      abort.abort();
      throw new DOMException('aborted', 'AbortError');
    });
    const search = createLiteLLMMcpSearch({ ...options, fetchImpl: fetchImpl as typeof fetch });
    await expect(search({ query: 'news', limit: 5, timeRange: 'any', signal: abort.signal })).rejects.toThrow();
    const failed = createLiteLLMMcpSearch({ ...options, fetchImpl: vi.fn(async () =>
      new Response('denied', { status: 403 })) as typeof fetch });
    await expect(failed({ query: 'news', limit: 5, timeRange: 'any' })).rejects.toThrow(/403/);
    const huge = createLiteLLMMcpSearch({ ...options, fetchImpl: vi.fn(async () =>
      new Response('x'.repeat(512 * 1024 + 1))) as typeof fetch });
    await expect(huge({ query: 'news', limit: 5, timeRange: 'any' })).rejects.toThrow(/size limit/);
  });

  it('composes with Uzi search policy to reject private and unsafe sources', async () => {
    const fetchImpl = vi.fn(async () => makeResponse([
      { title: 'Allowed', url: 'https://example.org/story', content: 'Public' },
      { title: 'Private', url: 'https://192.168.151.111/private', content: 'Never display' },
    ]));
    const tool = createWebSearchTool({
      search: createLiteLLMMcpSearch({ ...options, fetchImpl: fetchImpl as typeof fetch }),
      maxResults: 5,
      allowQuery: (q) => !q.includes('private'),
    });
    const execute = tool.execute!;
    const denied = await execute({ query: 'private bankroll' }, { abortSignal: new AbortController().signal } as Parameters<typeof execute>[1]) as WebSearchToolResult;
    expect(denied.ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
    const allowed = await execute({ query: 'public weather' }, { abortSignal: new AbortController().signal } as Parameters<typeof execute>[1]) as WebSearchToolResult;
    expect(allowed.ok).toBe(true);
    if (allowed.ok) expect(allowed.sources.map(s => s.url)).toEqual(['https://example.org/story']);
  });
});

function makePlain() {
  return { content: [{ type: 'text', text: JSON.stringify({ results: [] }) }] };
}
