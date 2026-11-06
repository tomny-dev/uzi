# Contributing to Uzi

This guide is for people developing the `@tomny-dev/uzi` library. If you only want to use the components in an application, start with the [README](./README.md) and [Getting Started](./docs/getting-started.md) instead.

## Prerequisites

- Node.js 24 or newer
- pnpm 8 or newer (the repository pins pnpm 8.15.8)

Install dependencies from the repository root:

```bash
pnpm install --frozen-lockfile
```

## Develop and preview components

Run the local Storybook component catalog:

```bash
pnpm storybook
```

Open [http://localhost:6006](http://localhost:6006). Stories live beside their components under `src/components/**` with filenames ending in `*.stories.tsx`. Add or update stories when changing component variants, states, or interactions.

The **Components / AIChat** stories cover streaming, custom renderers, scoped requests, message limits, error recovery, and an externally controlled runtime with mock approvals. They use mocks and do not require external AI credentials.

To build the static Storybook output:

```bash
pnpm build-storybook
```

This creates `storybook-static/`.

## Validate changes

Run the same principal checks as CI before opening a pull request:

```bash
pnpm lint
pnpm test
pnpm build
pnpm build-storybook
```

The [CI workflow](./.github/workflows/ci.yml) runs type-checking, tests, the package build, the Storybook build, and package packing on pull requests and pushes to `main`.

## Component design principles

Uzi is not intended to replace accessible platform primitives or established interaction libraries:

- Use native HTML when it provides the necessary behavior.
- Use Radix for interaction-heavy primitives such as menus, dialogs, popovers, toasts, and custom selects.
- Keep Uzi's public API focused on components, styling, design tokens, and reusable application patterns such as `TopBar`, `SidebarNav`, and `AppShell`.
- Prefer cohesive reusable compositions over rebuilding low-level controls.
- Follow the existing component APIs and design patterns documented in [the guides](./docs/getting-started.md).

## Deployment

Storybook hosting is maintained separately from local development. See [Storybook deployment](./docs/deployment.md) for the Cloudflare Pages project, workflow, and required secrets. Consumers of the published npm package do not need to run or deploy Storybook.
