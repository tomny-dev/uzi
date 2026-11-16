/**
 * Worker-only helpers. Keep this package independent of the Uzi UI bundle.
 * Apps own their database binding names, D1 schema, migrations and permissions.
 */
export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>;
  run(): Promise<unknown>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

export class MissingBindingError extends Error {
  constructor(name: string) {
    super(`Missing or invalid D1 binding: ${name}`);
    this.name = "MissingBindingError";
  }
}

/**
 * Read a D1 binding from the current Worker environment, never from globals.
 * The binding is checked at runtime to give a useful configuration error.
 * This is not a substitute for authorization or SQL parameter binding.
 */
export function requireD1<Env extends object>(
  env: Env,
  name: keyof Env & string,
): D1DatabaseLike {
  const value: unknown = env[name];
  if (!value || typeof value !== "object" || typeof (value as { prepare?: unknown }).prepare !== "function") {
    throw new MissingBindingError(name);
  }
  return value as D1DatabaseLike;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}

/**
 * Consistent JSON errors without leaking thrown exceptions or stack traces.
 * Use application-specific authentication and rate limiting before returning.
 */
export function apiError(
  status: number,
  code: string,
  message: string,
  headers?: HeadersInit,
): Response {
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    throw new RangeError("API error status must be an integer between 400 and 599");
  }
  if (!code.trim() || !message.trim()) {
    throw new TypeError("API error code and message must be nonempty");
  }
  const responseHeaders = new Headers(headers);
  responseHeaders.set("content-type", "application/json; charset=utf-8");
  responseHeaders.set("cache-control", "no-store");
  return new Response(JSON.stringify({ error: { code, message } } satisfies ApiErrorBody), {
    status,
    headers: responseHeaders,
  });
}
