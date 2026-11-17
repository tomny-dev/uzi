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

1. **Foundation (merged #120):** `@tomny-dev/cloudflare` workspace, `requireD1`, `apiError`, tests and documentation. Keep `private: true` until a dedicated publication path is designed and exercised.
2. **First example (merged #123):** the React/Vite + Worker + D1 example and app-owned migration live in this monorepo. Real remote demo deployment and independently installed consumer validation remain pending.
3. **Reusable workflows (merged #123; hardening in progress):** reusable `workflow_call` quality and deployment workflows are available. Deploy verification must include required app scripts, a fresh local migration run, protected-environment resource identity checks and a smoke test; use GitHub-hosted runners (`ubuntu-latest`) for public Uzi CI, especially untrusted pull requests. Never expose private self-hosted Coolify runners to public Uzi workflows; private downstream repositories may independently use their own approved runners. Keep one deploy owner, honor least-privilege permissions and avoid `actions/upload-artifact`.
4. **Publication:** implement trusted publishing for the Cloudflare workspace and a semver/update policy. Package upgrades require downstream CI and deploy; reusable workflow references have a separate versioning lifecycle.
5. **Optional integrations (deferred):** R2, Queues, cron, Cloudflare Workflows and AI only when validated by a concrete application need.

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

## Delivery safety and rollout checkpoints (2026-11-17)

- Reusable deployment requires a protected GitHub environment whose `CLOUDFLARE_WORKER_NAME`, `CLOUDFLARE_D1_DATABASE_ID`, and `CLOUDFLARE_SMOKE_URL` variables match the app's selected Wrangler configuration. Staging/production should have distinct top-level configs and physical resources. Never infer that changing GitHub environment automatically changes Wrangler's D1 bindings.
- The protected deploy job runs **only after app tests/build and a disposable local D1 migration check**, rejects missing/mismatched configuration before remote writes, applies remote migrations, deploys the Worker, and runs an HTTPS health check. Changes to already-applied remote DB migrations require an explicit recovery plan.
- Cloudflare demo deployment stays manual-only from `main`; ordinary public PR CI must not receive Cloudflare credentials or access to private Coolify runners.
- The example remains in-repository and `@tomny-dev/cloudflare` stays unpublished until a verified runtime deployment and real standalone consumer establish its public contract. No claim of production readiness is made by TypeScript or package build checks alone.
- Wrangler is pinned to a reviewed exact version in the reusable workflows while this package is a private workspace; migrate to a project-locked Wrangler devDependency for a standalone starter without breaking frozen-lockfile CI.
