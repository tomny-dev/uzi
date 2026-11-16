# @tomny-dev/cloudflare (foundation, unpublished)

A **Worker-only** integration workspace maintained within Uzi. This first slice is deliberately small and **private/unpublished** until the API, CI and release model are validated. It does not change the published UI entry points or require Cloudflare in React clients.

## Initial API

```ts
import { apiError, requireD1 } from "@tomny-dev/cloudflare";

interface Env {
  DB: D1Database; // from your Cloudflare-generated Worker bindings
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const db = requireD1(env, "DB");
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return apiError(400, "MISSING_ID", "id is required");

    // Bind values; never construct SQL from untrusted input.
    const record = await db.prepare("SELECT id FROM items WHERE id = ?").bind(id).first();
    if (!record) return apiError(404, "NOT_FOUND", "Item not found");
    return Response.json(record);
  },
};
```

## Boundaries

- Each app owns D1 database provisioning, schema/migrations, its Worker entrypoint and bindings.
- The shared package provides typed helper APIs and consistent errors; it is not a new ORM, router or authentication provider.
- Never return detailed SQL errors, stack traces, secret values, or sensitive user data through `apiError`.
- Do not import this package from browser code. It has no dependencies on React or `@tomny-dev/uzi`.
- Optional R2, Queues, and scheduled/background features will be added only after a concrete consumer needs them.
- `requireD1` validates the presence of a binding; it does not authorize database access.
- Publishing is intentionally deferred; add a dedicated trusted publishing release path before turning off `private`.

## Validation

```bash
pnpm --filter @tomny-dev/cloudflare lint
pnpm --filter @tomny-dev/cloudflare test
pnpm --filter @tomny-dev/cloudflare build
```

See [the platform architecture](../../docs/architecture/cloudflare-platform.md) for the incremental rollout plan.
