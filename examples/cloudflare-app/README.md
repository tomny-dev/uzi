# Uzi Cloudflare Worker + D1 example

This is a **working in-repository example**, not yet a copy-and-paste standalone template. It depends on Uzi's private/unpublished `@tomny-dev/cloudflare` workspace through `workspace:*`. Do not copy it outside this repository until that package is published and dependencies are replaced with versioned releases.

## Local development

From the Uzi repository root, install with `pnpm install --frozen-lockfile`, then:

1. Build `pnpm --filter @tomny-dev/cloudflare build` and `pnpm build` (main Uzi library).
2. Replace the Worker name and D1 database ID/name placeholders in `wrangler.jsonc` after provisioning a dedicated D1 database. **Never use an existing production database for the example.** For local-only work, use a valid isolated D1 configuration; the ID is required by the config.
3. Run `pnpm --dir examples/cloudflare-app db:local` to apply the sample migration to local D1.
4. Run `pnpm --dir examples/cloudflare-app dev` to build the frontend. Run `pnpm --dir examples/cloudflare-app build`, then `pnpm --dir examples/cloudflare-app exec pnpm dlx wrangler@4 dev` to serve the static assets and API together.
5. Run `pnpm --dir examples/cloudflare-app typecheck` to verify TypeScript.

The Vite development server alone does **not** provide the Worker API; use `wrangler dev` for end-to-end local testing.

## Production deployment

Provision separate staging/production D1 databases and Worker names. Copy the example into the application repository only after its shared packages are published and the workspace references are replaced. Use the reusable workflow `.github/workflows/cloudflare-deploy.yml` from a **private application repository**, referencing a reviewed version of Uzi. Configure a protected GitHub environment named `production` and store `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` in that environment.

The deployment workflow applies remote D1 migrations **before** deploying the Worker. Migration changes are not rolled back by a Worker rollback: use backward-compatible migrations and backups. It does not create databases, manage secrets, or generate identifiers.

No external deployment is performed by this example or by the public Uzi repository CI.
