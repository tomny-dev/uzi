import type { WebSearchProvider, WebSearchSource } from './web-search.js';

export interface SearxngSearchOptions {
  /** Trusted, server-configured origin. Model prompts never control the endpoint. */
  readonly baseURL: string;
  /** Only for trusted private-network development; HTTPS is required by default. */
  readonly allowHttp?: boolean;
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
}

const MAX_BODY_BYTES = 512 * 1024;

function endpointFor(baseURL: string, allowHttp: boolean): URL {
  const base = new URL(baseURL);
  if ((base.protocol !== 'https:' && !(allowHttp && base.protocol === 'http:')) ||
      base.username || base.password || base.search || base.hash || base.pathname !== '/') {
    throw new Error('SearXNG URL must be a trusted HTTPS origin (or explicitly allowed internal HTTP origin).');
  }
  return new URL('/search', base);
}

async function readLimitedJson(response: Response): Promise<unknown> {
  if (!response.body) throw new Error('Search returned an empty response.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.byteLength;
      if (length > MAX_BODY_BYTES) throw new Error('Search response exceeded size limit.');
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

/** A reusable SearXNG JSON search adapter; results are vetted by createWebSearchTool. */
export function createSearxngSearch(options: SearxngSearchOptions): WebSearchProvider {
  const endpoint = endpointFor(options.baseURL, options.allowHttp ?? false);
  const timeoutMs = options.timeoutMs ?? 7_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 500 || timeoutMs > 20_000) {
    throw new RangeError('timeoutMs must be between 500 and 20000');
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  return async ({ query, limit, timeRange, signal }) => {
    const url = new URL(endpoint);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('categories', 'general');
    url.searchParams.set('safesearch', '1');
    if (timeRange !== 'any') url.searchParams.set('time_range', timeRange);
    const timeout = AbortSignal.timeout(timeoutMs);
    const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const response = await fetchImpl(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      redirect: 'error',
      signal: combinedSignal,
    });
    if (!response.ok) throw new Error(`SearXNG returned HTTP ${response.status}`);
    const data = await readLimitedJson(response);
    const records = data && typeof data === 'object' && 'results' in data
      ? (data as { results?: unknown }).results : null;
    if (!Array.isArray(records)) throw new Error('Invalid SearXNG JSON search response.');
    const hits: WebSearchSource[] = [];
    for (const record of records.slice(0, Math.min(40, limit * 6))) {
      if (!record || typeof record !== 'object') continue;
      const result = record as Record<string, unknown>;
      if (typeof result.title !== 'string' || typeof result.url !== 'string') continue;
      hits.push({
        title: result.title,
        url: result.url,
        snippet: typeof result.content === 'string' ? result.content : '',
        ...(typeof result.publishedDate === 'string' ? { publishedAt: result.publishedDate } : {}),
      });
    }
    return hits;
  };
}
