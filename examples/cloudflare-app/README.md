# Uzi Cloudflare Worker + D1 example

This is a **working in-repository example**, not yet a copy-and-paste standalone template. It depends on Uzi's private/unpublished `@tomny-dev/cloudflare` workspace through `workspace:*`. Do not copy it outside this repository until that package is published and dependencies are replaced with versioned releases.

## Local development

From the Uzi repository root, install with `pnpm install --frozen-lockfile`, then:

1. Build `pnpm --filter @tomny-dev/cloudflare build` and `pnpm build` (main Uzi library).
2. Replace the Worker name and D1 database ID/name placeholders in `wrangler.jsonc` after provisioning a dedicated D1 database. **Never use an existing production database for the example.** For local-only work, use a valid isolated D1 configuration; the ID is required by the config.
3. Run `pnpm --dir examples/cloudflare-app db:local` to apply the sample migration to local D1.
4. Run `pnpm --dir examples/cloudflare-app dev` to build the frontend. Run `pnpm --dir examples/cloudflare-app build`, then `cd examples/cloudflare-app && pnpm dlx wrangler@4 dev` to serve the static assets and API together.
5. Run `pnpm --dir examples/cloudflare-app typecheck` to verify TypeScript.

The Vite development server alone does **not** provide the Worker API; use `wrangler dev` for end-to-end local testing.

## Production deployment

Provision separate staging/production D1 databases and Worker names. Copy the example into the application repository only after its shared packages are published and the workspace references are replaced. Use the reusable workflow `.github/workflows/cloudflare-deploy.yml` from a **private application repository**, referencing a reviewed version of Uzi. Configure a protected GitHub environment named `production` and store `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` in that environment.

The deployment workflow applies remote D1 migrations **before** deploying the Worker. Migration changes are not rolled back by a Worker rollback: use backward-compatible migrations and backups. It does not create databases, manage secrets, or generate identifiers.

### Isolated public demo deployment (manual)

Uzi can deploy this example to a **separate demo-only Worker and D1 database**. The workflow `.github/workflows/cloudflare-demo.yml` is **manual-only** (`workflow_dispatch`), permitted only from the default `main` branch, and requires a dedicated GitHub environment named `uzi-demo`. It never runs for pull requests or on a new PR branch. The workflow will become dispatchable only after this PR is merged into `main`.

Before running it:

1. Create a new Cloudflare D1 database named `uzi-demo-<suffix>` and choose an isolated Worker named `uzi-demo-<suffix>`; **do not reuse existing or production resources**.
2. In GitHub **Settings → Environments → uzi-demo**, restrict deployments to `main` and add reviewer protection if available. Set environment variables `DEMO_WORKER_NAME`, `DEMO_D1_DATABASE_NAME`, `DEMO_D1_DATABASE_ID` (the actual UUID), and `DEMO_URL` (the Worker URL such as `https://uzi-demo-app.<account-subdomain>.workers.dev/`).
3. Add environment secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Use a narrowly scoped token with D1 edit, Workers Scripts edit, and required account access, limited to the intended account. Never add it as a public PR secret.
4. After merging, run **Actions → Cloudflare demo deployment → Run workflow** on `main`. GitHub-hosted runners install, build, apply the example's migrations to the explicitly configured demo database, deploy the demo Worker, and smoke-test its HTML, `/api/health`, and `/api/items` seeded row.

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
    secrets:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Both reusable workflows require `pnpm_version` because `pnpm/action-setup` otherwise depends on an optional caller `packageManager` field. Set it to the pnpm version supported by the downstream lockfile (for example, `10.0.0` for a pnpm 10 app); the workflow does not impose Uzi's own pnpm version on consumers.

Configure protected GitHub environments with required reviewers, restricted deployment branches, and least-privileged Cloudflare credentials. Pull requests never receive deployment secrets. A deployment must not start until quality has passed under branch protection. Reusable workflows run on **GitHub-hosted** `ubuntu-latest`, even when called from a private repository; they never run on personal Coolify infrastructure.

Before using the deployment workflow, provision and bind **the correct database for each environment**. This first workflow targets the configured D1 binding in `wrangler.jsonc`; it does not automatically select distinct Wrangler environments. Use dedicated staging and production configurations with explicit isolation rather than assuming they are separated.

