# Development

## Commands

```bash
pnpm install
pnpm dev    # watch mode
pnpm build  # production build
pnpm lint   # type check
pnpm test   # unit tests
```

## Local development against a consumer app

`uzi` is intended to be developed locally against real consumer apps before publishing. Use a `file:` dependency rather than `pnpm link` to avoid peer dependency resolution issues with `react` and `react-dom`.

1. In this repo, install and start watch mode:

```bash
pnpm install
pnpm dev
```

2. In the consumer app, point the dependency at the local repo:

```json
{
  "dependencies": {
    "@tomny-dev/uzi": "file:../../../uzi"
  }
}
```

3. In the consumer app, reinstall and restart the dev server:

```bash
pnpm install
```

4. To return to the published npm version, replace the `file:` path with a semver version and reinstall.

### Next.js note

Some Next.js apps may need to transpile the linked package explicitly:

```js
// next.config.js
module.exports = {
  transpilePackages: ["@tomny-dev/uzi"],
};
```

## Adding a component

1. Create `src/components/<name>/<Name>.tsx` and `<name>.module.css`
2. Add `"use client";` at the top of any component that uses React hooks
3. Export from `src/index.ts`

### Choose the right base

Before building a new component, decide whether it should be native HTML, Radix-backed, or a higher-level `uzi` composition.

- Use native HTML for simple controls like text inputs and labels.
- Use Radix for interaction-heavy primitives such as dialogs, menus, popovers, toasts, and custom selects.
- Use `uzi` itself for styling, tokens, and app templates like shells, nav, and headers.

Avoid introducing new bespoke low-level widgets unless native HTML and Radix both clearly fail the use case.

## Pre-publish verification

```bash
pnpm build
pnpm pack
```

Install the generated tarball in a consumer app to verify exports, CSS, and packaging before publishing.

## Preview builds for pull requests

Ready-for-review pull requests from this repository publish preview builds to npm under a PR-specific dist-tag without touching `latest`.

Example install command for PR `123`:

```bash
pnpm add @tomny-dev/uzi@pr-123
```

Each workflow run also publishes a new exact prerelease version for that PR and posts both install commands back onto the PR:

- `@pr-123` tracks the latest preview build for PR 123
- `@0.x.y-pr.123.<run>.<attempt>.<sha>` pins one exact build

## Publishing

Versioning and stable npm publishing are managed by Release Please:

1. Merge feature and fix PRs into `main` using Conventional Commit messages such as `fix: ...` or `feat: ...`.
2. The release workflow opens or updates a Release Please PR that bumps `package.json`, updates `CHANGELOG.md`, and advances `.release-please-manifest.json`.
3. Merge the Release Please PR to create the `uzi-vX.Y.Z` tag and GitHub release.
4. The same release workflow validates and publishes `@tomny-dev/uzi@X.Y.Z` to npm.

Stable releases publish with npm provenance. Configure npm Trusted Publishing for the `Release` workflow, or keep a scoped `NPM_TOKEN` repository secret as a fallback. Preview builds continue to use `NPM_TOKEN` because they publish PR-specific prerelease versions.
