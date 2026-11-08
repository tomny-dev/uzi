import { describe, expect, it, vi } from 'vitest';
import { createLiteLLMMcpClient, createLiteLLMMcpSearch } from './litellm-mcp.js';

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });

describe('LiteLLM MCP search bridge', () => {
  it('enforces trusted endpoint and server-supplied credentials', () => {
    expect(() => createLiteLLMMcpClient({ baseURL: 'http://litellm.example', apiKey: 'sk-1' })).toThrow();
    expect(() => createLiteLLMMcpClient({ baseURL: 'https://litellm.example/v1', apiKey: 'sk-1' })).toThrow();
    expect(() => createLiteLLMMcpClient({ baseURL: 'https://litellm.example', apiKey: '' })).toThrow();
    expect(() => createLiteLLMMcpClient({ baseURL: 'https://litellm.example', apiKey: 'sk-1', serverId: '../other' })).toThrow();
  });

  it('discovers ONLY the allowed web_search and parses JSON tool content', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchImpl = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      if (String(url).includes('/tools/list')) {
        return json({ tools: [{ name: 'searxng-web_search' }, { name: 'searxng-delete_everything' }] });
      }
      return json({ content: [{ type: 'text', text: JSON.stringify({
        results: [{ title: 'Public story', url: 'https://news.example/story', content: 'Safe excerpt', publishedDate: '2026-11-08' }],
      }) }] });
    });
    const provider = createLiteLLMMcpSearch({ baseURL: 'https://litellm.example', apiKey: 'sk-secret', fetchImpl: fetchImpl as typeof fetch });
    const result = await provider({ query: 'public news', limit: 5, timeRange: 'day' });
    expect(result).toEqual([{ title: 'Public story', url: 'https://news.example/story', snippet: 'Safe excerpt', publishedAt: '2026-11-08' }]);
    expect(calls).toHaveLength(2);
    expect(calls[0].url).toContain('server_id=searxng');
    expect(calls[0].init.headers).toMatchObject({ Authorization: 'Bearer sk-secret' });
    expect(JSON.parse(String(calls[1].init.body))).toEqual({
      server_id: 'searxng', name: 'searxng-web_search',
      arguments: { query: 'public news', categories: 'general', response_format: 'json', time_range: 'day' },
    });
    expect(calls[1].init.redirect).toBe('error');
  });

  it('refuses missing permissions and arbitrary tools', async () => {
    const fetchImpl = vi.fn(async () => json({ tools: [{ name: 'searxng-delete_everything' }] }));
    const provider = createLiteLLMMcpSearch({ baseURL: 'https://litellm.example', apiKey: 'key', fetchImpl: fetchImpl as typeof fetch });
    await expect(provider({ query: 'news', limit: 5, timeRange: 'any' })).rejects.toThrow('not authorized');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('fails closed on tool errors, non-JSON content and HTTP failures', async () => {
    for (const reply of [
      json({ isError: true, content: [{ type: 'text', text: 'Error' }] }),
      json({ content: [{ type: 'text', text: 'not structured JSON' }] }),
      json({ error: 'permission denied' }, 403),
    ]) {
      const fetchImpl = vi.fn(async (url: RequestInfo | URL) => String(url).includes('/tools/list')
        ? json({ tools: [{ name: 'web_search' }] }) : reply);
      const provider = createLiteLLMMcpSearch({ baseURL: 'https://litellm.example', apiKey: 'key', fetchImpl: fetchImpl as typeof fetch });
      await expect(provider({ query: 'public', limit: 5, timeRange: 'any' })).rejects.toThrow();
    }
  });

  it('propagates cancellation to both discovery and tool execution', async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.signal).toBeDefined();
      controller.abort();
      throw new DOMException('aborted', 'AbortError');
    });
    const provider = createLiteLLMMcpSearch({ baseURL: 'https://litellm.example', apiKey: 'key', fetchImpl: fetchImpl as typeof fetch });
    await expect(provider({ query: 'public', limit: 5, timeRange: 'any', signal: controller.signal })).rejects.toThrow();
  });
});
