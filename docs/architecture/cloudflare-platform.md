# Uzi full-stack platform: Cloudflare integration

Tracking issue: [#119](https://github.com/tomny-dev/uzi/issues/119).

## Current repository audit (November 2026)

- `@tomny-dev/uzi` is the React UI package, with root, `/server`, and `/utils` exports. Its client boundary is verified by `scripts/verify-client-boundary.mjs`.
- `packages/ai` is already a separate, server-only `@tomny-dev/ai` workspace using independent build, tests and publishing.
- The root `pnpm-workspace.yaml` includes `packages/*`; an additional package does not require a separate repository or root dependency.
- Existing CI builds the UI and AI packages on Node 24. Release Please handles the UI package; the AI package has separate publishing conventions.
- A Cloudflare integration must not be added to the UI entrypoint, `/server` export, or Vite UI build without a specific compatibility review.

## Decision

Keep the **platform source in this repository**, while preserving package/runtime boundaries. The initial Cloudflare foundation is `packages/cloudflare` and is deliberately private until its API, downstream integration and release workflows are validated. No standalone platform repository or framework replacement.

### Responsibilities

| Uzi platform owns | Application owns |
| --- | --- |
| Generic Worker helpers and typed binding access | Cloudflare resource creation, binding identifiers and secrets |
| API error contract and reusable integration conventions | App routing, business logic, authentication and authorization policy |
| D1 access conventions | D1 schema, migrations, transactional requirements and query design |
| Shared workflow templates and validation conventions | Environment approvals, deployment credentials, per-app rollout and recovery |
| A small optional starter example | Production app customization and deployment |

Cloudflare is the **default for new full-stack apps**, not a requirement of `@tomny-dev/uzi` UI consumers. Prefer Workers with Static Assets for new apps; do not migrate existing Pages projects as part of this foundation.

## Module boundaries and rollout

1. **Foundation (this PR):** `@tomny-dev/cloudflare` workspace, `requireD1`, `apiError`, tests and documentation. Keep `private: true` until a dedicated publication path is designed and exercised.
2. **First consumer:** add one minimal Worker + D1 + Uzi UI example, using application-owned SQL migrations and request-level auth. Verify local/preview/production data isolation.
3. **Reusable workflows:** extract verified quality, D1 migration and deployment procedures into reusable `workflow_call` workflows with pinned references; use self-hosted `[self-hosted, coolify]` runners. Keep one deploy owner, honor least-privilege permissions and avoid `actions/upload-artifact`.
4. **Publication:** implement trusted publishing for the Cloudflare workspace and a semver/update policy. Package upgrades require downstream CI and deploy; reusable workflow references have a separate versioning lifecycle.
5. **Optional integrations:** R2, Queues, cron, Cloudflare Workflows and AI only when validated by a concrete application need.

## Non-goals

- Duplicating Cloudflare's native D1 API or wrapping arbitrary SQL in a new ORM.
- Adding required `wrangler`, Cloudflare Workers runtime or React dependencies to all Uzi consumers.
- Introducing multiple repos or a large generator prior to the working example.
- Migrating all downstream applications or changing Uzi's current UI publishing path in one PR.

## Validation checklist

- `pnpm --filter @tomny-dev/cloudflare lint`
- `pnpm --filter @tomny-dev/cloudflare test`
- `pnpm --filter @tomny-dev/cloudflare build`
- Full repository typecheck, tests and UI/client-boundary build
- Consumer validation before enabling a publish workflow
