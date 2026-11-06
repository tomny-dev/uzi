# Storybook Deployment (Maintainers)

This guide documents deployment of Uzi's **Storybook component catalog**. It is not a deployment guide for applications using `@tomny-dev/uzi`.

## Where it runs

The static Storybook site is deployed to a Cloudflare Pages project named `uzi-storybook`. The production branch is `main`.

The source of truth is [`.github/workflows/storybook-deploy.yml`](../.github/workflows/storybook-deploy.yml), which runs on pushes to `main` and can also be triggered manually with `workflow_dispatch`. It:

1. Checks out the repository and sets up Node.js 24 and pnpm.
2. Runs `pnpm install --frozen-lockfile`.
3. Builds Storybook with `pnpm build-storybook`.
4. Publishes `storybook-static/` using Wrangler 4 to the `uzi-storybook` Pages project with `--branch=main`.

The [CI workflow](../.github/workflows/ci.yml) independently builds Storybook on pull requests and pushes to `main`, without deploying it.

## Cloudflare configuration

Ensure that the Cloudflare Pages project exists and that its production branch is `main`. Configure these **GitHub Actions repository secrets**:

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages Write access to the project |
| `CLOUDFLARE_ACCOUNT_ID` | Account that owns the Pages project |

Use a least-privilege token and keep credentials in GitHub Actions secrets, not in source files. A custom domain (for example `uzi.tomny.dev`) can be connected in Cloudflare Pages if desired; verify that it is configured before publishing it as the canonical Storybook URL.

## Local build verification

From a checkout with dependencies installed:

```bash
pnpm build-storybook
```

The static site is output to `storybook-static/`. For interactive development, use `pnpm storybook` as described in [CONTRIBUTING.md](../CONTRIBUTING.md).

## Release and troubleshooting

- Merging to `main` triggers the deployment workflow; users of the npm package do not perform these steps.
- If deployment fails, inspect the [Storybook deployment workflow](../.github/workflows/storybook-deploy.yml), Cloudflare Pages project configuration, and secret availability.
- A successful Storybook build in CI verifies buildability, not that the Cloudflare deployment completed; check the deployment job separately.
- After deployment, verify that the hosted catalog loads and a few representative stories render correctly.
