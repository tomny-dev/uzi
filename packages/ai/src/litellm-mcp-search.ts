import type { WebSearchProvider, WebSearchSource } from './web-search.js';

/** Direct, read-only search through an authenticated LiteLLM MCP REST gateway. */
export interface LiteLLMMcpSearchOptions {
  /** Trusted LiteLLM proxy origin, never a model-controlled URL. */
  readonly baseURL: string;
  readonly apiKey: string;
  /** LiteLLM MCP server alias or id; default `searxng`. */
  readonly serverId?: string;
  /** Upstream read-only search tool; default `web_search`. */
  readonly toolName?: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
  /** Explicit opt-in for trusted private-network development. */
  readonly allowHttp?: boolean;
}

const MAX_RESPONSE_BYTES = 512 * 1024;
// Avoid iterating arbitrarily large result arrays; createWebSearchTool further
// limits output to a configured small number of vetted sources.
const MAX_SCANNED_RESULTS = 40;

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

/** Extract SearXNG JSON from LiteLLM's MCP tool response, never from model prose. */
export function parseLiteLLMMcpSearchSources(value: unknown): WebSearchSource[] {
  const response = asObject(value);
  if (!response || response.isError === true || response.error) {
    throw new Error('LiteLLM MCP search failed');
  }
  const result = asObject(response.result) ?? response;
  if (result.isError === true || result.error) throw new Error('LiteLLM MCP search failed');
  if (!Array.isArray(result.content) && result.structuredContent === undefined && !Array.isArray(result.results)) {
    throw new Error('LiteLLM MCP returned no search tool payload');
  }

  const candidates: unknown[] = [result.structuredContent, result];
  const blocks = Array.isArray(result.content) ? result.content : [];
  for (const block of blocks) {
    const text = asObject(block)?.text;
    if (typeof text !== 'string' || text.length > MAX_RESPONSE_BYTES) continue;
    try { candidates.push(JSON.parse(text) as unknown); }
    catch { /* Human-readable MCP messages are not source evidence. */ }
  }
  for (const candidate of candidates) {
    const data = asObject(candidate);
    if (!Array.isArray(data?.results)) continue;
    const sources: WebSearchSource[] = [];
    for (const item of data.results.slice(0, MAX_SCANNED_RESULTS)) {
      const hit = asObject(item);
      if (typeof hit?.title !== 'string' || typeof hit.url !== 'string') continue;
      sources.push({
        title: hit.title,
        url: hit.url,
        snippet: typeof hit.content === 'string' ? hit.content : '',
        ...(typeof hit.publishedDate === 'string' ? { publishedAt: hit.publishedDate } : {}),
      });
    }
    return sources;
  }
  throw new Error('LiteLLM MCP returned no structured search results');
}

async function readBoundedJSON(response: Response): Promise<unknown> {
  if (!response.ok) throw new Error(`LiteLLM MCP returned HTTP ${response.status}`);
  if (!response.body) throw new Error('LiteLLM MCP returned an empty response');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error('LiteLLM MCP response exceeds the size limit');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let position = 0;
  for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

/**
 * One known, read-only MCP tool call over LiteLLM REST, with no second model
 * invocation and no app-side MCP protocol client. Use it as the `search`
 * callback for `createWebSearchTool`, which owns query privacy, budgets,
 * source validation and URL sanitization.
 */
export function createLiteLLMMcpSearch(options: LiteLLMMcpSearchOptions): WebSearchProvider {
  const base = new URL(options.baseURL);
  if ((base.protocol !== 'https:' && !(options.allowHttp && base.protocol === 'http:')) ||
    base.username || base.password || base.pathname !== '/' || base.search || base.hash) {
    throw new Error('LiteLLM MCP requires a trusted HTTPS proxy origin');
  }
  const apiKey = options.apiKey.trim();
  if (!apiKey || /[\r\n]/.test(apiKey)) throw new Error('LiteLLM MCP API key is required');
  const serverId = options.serverId ?? 'searxng';
  const toolName = options.toolName ?? 'web_search';
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(serverId)) throw new Error('Invalid LiteLLM MCP server id');
  // Deliberately restrict this helper to public web search rather than allow
  // arbitrary side-effecting MCP tools to be executed by an agent.
  if (toolName !== 'web_search') throw new Error('Only the read-only web_search tool is supported');
  const timeoutMs = options.timeoutMs ?? 7_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 20_000) {
    throw new RangeError('Invalid LiteLLM MCP search timeout');
  }
  const fetcher = options.fetchImpl ?? fetch;
  const endpoint = new URL('/mcp-rest/tools/call', base).toString();

  return async ({ query, timeRange, signal }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort(signal?.reason);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
    try {
      const result = await readBoundedJSON(await fetcher(endpoint, {
        method: 'POST',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          server_id: serverId,
          name: toolName,
          arguments: {
            query,
            categories: 'general',
            response_format: 'json',
            ...(timeRange === 'any' ? {} : { time_range: timeRange }),
          },
        }),
      }));
      return parseLiteLLMMcpSearchSources(result);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  };
}
