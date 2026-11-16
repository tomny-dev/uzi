import { apiError, requireD1 } from "@tomny-dev/cloudflare";

type Item = { id: number; title: string };

interface Env {
  DB: { prepare: (sql: string) => {
    all: <T>() => Promise<{ results: T[]; success: boolean }>;
  } };
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/health" && request.method === "GET") {
      return Response.json({ ok: true });
    }
    if (url.pathname === "/api/items" && request.method === "GET") {
      try {
        const db = requireD1(env, "DB");
        const result = await db.prepare("SELECT id, title FROM items ORDER BY id LIMIT 100").all<Item>();
        if (!result.success) return apiError(503, "DATABASE_UNAVAILABLE", "Database unavailable");
        return Response.json({ items: result.results }, { headers: { "cache-control": "no-store" } });
      } catch {
        return apiError(503, "DATABASE_UNAVAILABLE", "Database unavailable");
      }
    }
    if (url.pathname.startsWith("/api/")) return apiError(404, "NOT_FOUND", "API route not found");
    return env.ASSETS.fetch(request);
  },
};
