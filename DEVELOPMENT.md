# Development

## Commands

```bash
pnpm install
pnpm dev    # watch mode
pnpm build  # production build
pnpm lint   # type check
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

Pull requests publish preview builds to npm under a PR-specific dist-tag without touching `latest`.

Example install command for PR `123`:

```bash
pnpm add @tomny-dev/uzi@pr-123
```

The workflow also posts the exact install command back onto the PR after publishing.

## Publishing

Every push to `main` automatically bumps the patch version and publishes to npm as `@tomny-dev/uzi`.

For minor/major bumps, edit the version in `package.json` manually before pushing.
