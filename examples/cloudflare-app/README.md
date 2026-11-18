# Uzi Cloudflare Worker + D1 example

This is a **working in-repository example**, not yet a copy-and-paste standalone template. It depends on Uzi's private/unpublished `@tomny-dev/cloudflare` workspace through `workspace:*`. Do not copy it outside this repository until that package is published and dependencies are replaced with versioned releases.

## Local development

From the Uzi repository root, install with `pnpm install --frozen-lockfile`, then:

1. Build `pnpm --filter @tomny-dev/cloudflare build` and `pnpm build` (main Uzi library).
2. Replace the Worker name and D1 database ID/name placeholders in `wrangler.jsonc` after provisioning a dedicated D1 database. **Never use an existing production database for the example.** For local-only work, use a valid isolated D1 configuration; the ID is required by the config.
3. Run `pnpm --dir examples/cloudflare-app db:local` to apply the sample migration to local D1.
4. Run `pnpm --dir examples/cloudflare-app dev` to build the frontend. Run `pnpm --dir examples/cloudflare-app build`, then `cd examples/cloudflare-app && pnpm dlx wrangler@4.163.0 dev` to serve the static assets and API together.
5. Run `pnpm --dir examples/cloudflare-app typecheck` and `pnpm --dir examples/cloudflare-app test` to verify Worker API behavior (requires the built Cloudflare workspace package).

The Vite development server alone does **not** provide the Worker API; use `wrangler dev` for end-to-end local testing. The `wrangler@4.163.0` version is intentionally fixed in this example and its workflow templates; when moving the starter into a standalone app, install Wrangler as a devDependency with a lockfile and use `pnpm exec wrangler`.

For public Uzi CI, `scripts/prepare-cloudflare-demo.mjs` supplies a disposable synthetic local D1 configuration, then tests the migration using `--local --persist-to`. No production credentials are used. This validates that the migration applies to a fresh DB; it does **not** prove a production upgrade, runtime behavior inside workerd, or a successful remote deployment.

## Production deployment

Provision separate staging/production D1 databases and Worker names. Copy the example into the application repository only after its shared packages are published and the workspace references are replaced. Use the reusable workflow `.github/workflows/cloudflare-deploy.yml` from a **private application repository**, referencing a reviewed version of Uzi. Configure a protected GitHub environment named `production` and store `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` in that environment.

Deployment verification calls the same reusable quality workflow used by standalone checks, with local D1 migration verification enabled. It checks out the caller application without receiving deployment secrets; only successful verification can enter the protected deployment job.

The protected job fetches its resource guard from the public Uzi repository by an immutable Git blob ID and verifies those exact bytes before execution. This keeps the guard available in downstream caller checkouts without installing Uzi tooling or following a mutable branch. The guard uses TypeScript from the caller application's installed dependencies to parse Wrangler JSONC, as the inline guard did previously. A GitHub API failure (including rate limiting) or a hash mismatch stops deployment before remote writes. When editing `scripts/cloudflare-deploy-guard.mjs`, update `guard_blob` in the deployment workflow to `git hash-object --no-filters scripts/cloudflare-deploy-guard.mjs`; CI checks that the pin matches the tested source. The blob becomes available after the change is pushed to Uzi and remains referenced by the merged source tree, including after a squash merge.

The deployment workflow runs **typecheck, test, build and optional lint/format:check scripts, then local D1 migration verification** before the protected deployment job. The protected job rebuilds, compares Worker name and D1 database ID against GitHub **environment variables**, applies remote migrations and deploys only when the resources match, then runs an HTTPS smoke check.

In each GitHub protected environment (for example `production` or `staging`), configure:

- Variables: `CLOUDFLARE_WORKER_NAME`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_SMOKE_URL` (a public HTTPS health endpoint that returns 2xx).
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` stored in the **selected protected environment**, scoped to the intended Cloudflare account. The called deploy job reads these directly; environment secrets cannot be forwarded through a reusable-workflow caller.
- Restrict branches, require reviewers where available, and use a **different Worker and database** for each environment.

The app must provide `typecheck`, `test`, and `build` scripts, plus a `wrangler.jsonc` or alternate `wrangler_config` file whose **top-level Worker name and D1 binding** match that environment's variables. Use distinct configuration files for distinct environments; the workflow does not infer or select a `--env` block automatically. An absent/mismatched resource variable causes a failure **before remote writes**. The default `wrangler_version` is pinned to `4.163.0`; downstream consumers can explicitly override it and should move to lockfile-managed Wrangler when practical.

Remote D1 migrations run **before** Worker deployment and **cannot be rolled back by reverting Worker code**. Use backward-compatible expand/contract migrations and make a recovery plan. The local migration check uses a fresh database and does not replace staged upgrade tests. This workflow does not provision resources, manage app secrets, or generate identifiers.

### Isolated public demo deployment (manual)

Uzi can deploy this example to a **separate demo-only Worker and D1 database**. The workflow `.github/workflows/cloudflare-demo.yml` is **manual-only** (`workflow_dispatch`), permitted only from the default `main` branch, and requires a dedicated GitHub environment named `uzi-demo`. It never runs for pull requests or on a new PR branch. The workflow is dispatchable on `main` after the starter PR merge; its real deployment must still be verified.

Before running it:

1. Create a new Cloudflare D1 database named `uzi-demo-<suffix>` and choose an isolated Worker named `uzi-demo-<suffix>`; **do not reuse existing or production resources**.
2. In GitHub **Settings → Environments → uzi-demo**, restrict deployments to `main` and add reviewer protection if available. Set environment variables `DEMO_WORKER_NAME`, `DEMO_D1_DATABASE_NAME`, `DEMO_D1_DATABASE_ID` (the actual UUID), and `DEMO_URL` (the Worker URL such as `https://uzi-demo-app.<account-subdomain>.workers.dev/`).
3. Add environment secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Use a narrowly scoped token with D1 edit, Workers Scripts edit, and required account access, limited to the intended account. Never add it as a public PR secret.
4. After merging, run **Actions → Cloudflare demo deployment → Run workflow** on `main`. GitHub-hosted runners install, build, validate local migrations, apply the example's migrations to the explicitly configured demo database, deploy the demo Worker, and smoke-test its HTML, `/api/health`, and `/api/items` seeded row.

Missing or invalid configuration fails before migration/deployment. The smoke test fails when the live HTML, API, or D1 record is unavailable. Database migration success is **not** reversible through Worker rollback; keep the demo database disposable. Wrangler's preview and local DB are not the remote demo DB.

Do **not** add this job to ordinary pull-request CI. Until that manual deployment succeeds, do not claim the real Cloudflare end-to-end path has been validated.

No external deployment is performed by ordinary public Uzi CI.

## Reusable workflow callers

A downstream app can add workflow callers pointing at a **reviewed immutable commit SHA** of Uzi (replace `<PINNED_UZI_SHA>`):

```yaml
# .github/workflows/quality.yml
name: Cloudflare quality
on: [pull_request]
permissions:
  contents: read
jobs:
  quality:
    uses: tomny-dev/uzi/.github/workflows/cloudflare-quality.yml@<PINNED_UZI_SHA>
    with:
      app_directory: .
      pnpm_version: '10.0.0' # Match the downstream caller's packageManager version
      verify_d1_migrations: true
      database_binding: DB
```

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  deploy:
    uses: tomny-dev/uzi/.github/workflows/cloudflare-deploy.yml@<PINNED_UZI_SHA>
    with:
      app_directory: .
      database_binding: DB
      environment_name: production
      pnpm_version: '10.0.0' # Match the downstream caller's packageManager version
      deploy_ref: refs/heads/main
```

The reusable deploy workflow accepts **environment-only** Cloudflare credentials; its `workflow_call` secret declarations are optional so the caller does not have to pass repository-level secrets. The protected deploy job checks that both credentials exist before remote writes. Keep production Cloudflare secrets out of repository/org secrets and restrict the selected GitHub environment to protected deployment refs.

Both reusable workflows require `pnpm_version` because `pnpm/action-setup` otherwise depends on an optional caller `packageManager` field. Set it to the pnpm version supported by the downstream lockfile (for example, `10.0.0` for a pnpm 10 app); the workflow does not impose Uzi's own pnpm version on consumers.

Configure protected GitHub environments with required reviewers, restricted deployment branches, least-privileged Cloudflare credentials, and the three required environment variables above. Pull requests never receive deployment secrets. The reusable deploy workflow now runs its own verification job and will not start remote writes unless that job passes. Reusable workflows run on **GitHub-hosted** `ubuntu-24.04`, even when called from a private repository; they never run on personal Coolify infrastructure.

Before using the deployment workflow, provision and bind **the correct database for each environment**. The workflow targets the configured D1 binding in the explicitly selected config file and verifies the expected database ID and Worker name against protected environment variables. It does not automatically select distinct Wrangler environments; give staging and production separate top-level configs and resource IDs.
