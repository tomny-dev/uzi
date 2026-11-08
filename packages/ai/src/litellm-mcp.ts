import type { WebSearchProvider, WebSearchSource } from './web-search.js';

/** LiteLLM MCP REST bridge: the application supplies a scoped proxy key. */
export interface LiteLLMMcpOptions {
  /** Trusted LiteLLM proxy origin, without /v1, path, query or credentials. */
  readonly baseURL: string;
  readonly apiKey: string;
  /** Configured MCP server id/alias in LiteLLM. Default: searxng. */
  readonly serverId?: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
  /** Permit HTTP only for explicitly trusted development/LAN endpoints. */
  readonly allowHttp?: boolean;
}

const BODY_LIMIT = 512 * 1024;
const SOURCE_SCAN_LIMIT = 40;

function endpoint(baseURL: string, path: string, allowHttp: boolean): string {
  const u = new URL(baseURL);
  if ((u.protocol !== 'https:' && !(allowHttp && u.protocol === 'http:')) ||
    u.username || u.password || u.pathname !== '/' || u.search || u.hash) {
    throw new Error('LiteLLM MCP gateway must use a trusted HTTPS origin.');
  }
  return new URL(path, u).toString();
}

async function limitedJSON(response: Response): Promise<unknown> {
  if (!response.ok) throw new Error(`LiteLLM MCP returned HTTP ${response.status}`);
  if (!response.body) throw new Error('LiteLLM MCP returned no body');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > BODY_LIMIT) {
        await reader.cancel();
        throw new Error('LiteLLM MCP response too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function record(input: unknown): Record<string, unknown> | null {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown> : null;
}

export function createLiteLLMMcpClient(options: LiteLLMMcpOptions) {
  const key = options.apiKey.trim();
  if (!key || /[\r\n]/.test(key)) throw new Error('LiteLLM MCP API key is required');
  const serverId = options.serverId ?? 'searxng';
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(serverId)) throw new Error('Invalid MCP server id');
  const timeoutMs = options.timeoutMs ?? 7_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 20_000)
    throw new RangeError('timeoutMs must be between 500 and 20000');
  const listURL = new URL(endpoint(options.baseURL, '/mcp-rest/tools/list', options.allowHttp ?? false));
  listURL.searchParams.set('server_id', serverId);
  const callURL = endpoint(options.baseURL, '/mcp-rest/tools/call', options.allowHttp ?? false);
  const fetcher = options.fetchImpl ?? fetch;
  const headers = { Authorization: `Bearer ${key}`, Accept: 'application/json' };

  async function request(url: string, init: RequestInit = {}, signal?: AbortSignal) {
    return limitedJSON(await fetcher(url, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
      redirect: 'error',
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs),
    }));
  }
  return {
    /** Returns only tools authorized for the supplied LiteLLM key and server. */
    async listTools(signal?: AbortSignal): Promise<readonly { name: string }[]> {
      const payload = record(await request(listURL.toString(), {}, signal));
      if (payload?.error) throw new Error('LiteLLM MCP discovery failed');
      if (!Array.isArray(payload?.tools)) throw new Error('Malformed LiteLLM MCP tools list');
      return payload.tools.flatMap((value: unknown) => {
        const item = record(value);
        return typeof item?.name === 'string' ? [{ name: item.name }] : [];
      });
    },
    /** Never accepts a model-selected tool name: callers must pass a trusted name. */
    async callTool(name: string, args: Readonly<Record<string, unknown>>, signal?: AbortSignal): Promise<unknown> {
      if (!/^[a-zA-Z0-9_-]{1,128}$/.test(name)) throw new Error('Invalid MCP tool name');
      return request(callURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId, name, arguments: args }),
      }, signal);
    },
  };
}

function extractSearchHits(value: unknown): WebSearchSource[] {
  const payload = record(value);
  if (payload?.isError === true || payload?.error) throw new Error('MCP search failed');
  const contents = Array.isArray(payload?.content) ? payload.content : [];
  // FastMCP returns a text content block containing serialized SearXNG JSON.
  // Some LiteLLM versions also return structuredContent or wrap under result.
  const nested = record(payload?.result);
  const structured = record(payload?.structuredContent) ?? record(nested?.structuredContent);
  const candidate = structured?.results ? structured : (() => {
    const blocks = [...contents, ...(Array.isArray(nested?.content) ? nested.content : [])];
    for (const block of blocks) {
      const entry = record(block);
      if (entry?.type !== 'text' || typeof entry.text !== 'string' || entry.text.length > BODY_LIMIT) continue;
      try {
        const json = record(JSON.parse(entry.text));
        if (Array.isArray(json?.results)) return json;
      } catch { /* Non-JSON tool output is not acceptable as trusted source metadata. */ }
    }
    return record(payload?.results) ? payload : null;
  })();
  if (!Array.isArray(candidate?.results)) throw new Error('Invalid MCP search result');
  const output: WebSearchSource[] = [];
  for (const item of candidate.results.slice(0, SOURCE_SCAN_LIMIT)) {
    const hit = record(item);
    if (typeof hit?.title !== 'string' || typeof hit.url !== 'string') continue;
    output.push({
      title: hit.title, url: hit.url,
      snippet: typeof hit.content === 'string' ? hit.content : '',
      ...(typeof hit.publishedDate === 'string' ? { publishedAt: hit.publishedDate } : {}),
    });
  }
  return output;
}

/**
 * Read-only SearXNG MCP search through LiteLLM. Discover the allowed tool by
 * exact name, never expose arbitrary MCP tools to the model, and reuse
 * createWebSearchTool for per-turn budgets, URL vetting and privacy policy.
 */
export function createLiteLLMMcpSearch(options: LiteLLMMcpOptions): WebSearchProvider {
  const client = createLiteLLMMcpClient(options);
  let selectedTool: Promise<string> | undefined;
  return async ({ query, timeRange, signal }) => {
    selectedTool ??= client.listTools(signal).then((tools) => {
      const matches = tools.filter((t) => t.name === 'web_search' || t.name === 'searxng-web_search' || t.name === 'searxng_web_search');
      if (matches.length !== 1) throw new Error('SearXNG web_search is not authorized or ambiguous');
      return matches[0].name;
    });
    let toolName: string;
    try { toolName = await selectedTool; }
    catch (error) { selectedTool = undefined; throw error; }
    const response = await client.callTool(toolName, {
      query,
      categories: 'general',
      response_format: 'json',
      ...(timeRange === 'any' ? {} : { time_range: timeRange }),
    }, signal);
    return extractSearchHits(response);
  };
}
