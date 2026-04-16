# CLAUDE.md

## Overview

`@tomny-dev/uzi` is a personal React component library. CSS modules for styling, no Tailwind dependency.

## Commands

```bash
pnpm install       # install deps
pnpm dev           # watch mode
pnpm build         # production build (tsup → dist/)
pnpm lint          # type check only
```

## Publishing

Every push to `main` automatically:
1. Bumps the patch version in `package.json`
2. Commits the version bump with `[skip ci]`
3. Publishes to npm as `@tomny-dev/uzi`

For minor/major bumps, edit `package.json` version manually before pushing.

## Adding Components

1. Create `src/components/<name>/<Name>.tsx` and `<name>.module.css`
2. Add `"use client";` at the top of any component that uses React hooks
3. Export from `src/index.ts`

## Architecture

- **No Tailwind** — uses CSS modules
- **`cx()` utility** — exported from `src/utils/cx.ts`, use for conditional class names
- **tsup** bundles to `dist/` in both ESM and CJS with type declarations
- **`"use client"` banner** — added to the entire bundle via `tsup.config.ts` so Next.js App Router consumers don't need to worry about it

## For Consumer Repos

When using `@tomny-dev/uzi` in a project, add this to the consumer's `CLAUDE.md`:

```md
## UI Components
This project uses `@tomny-dev/uzi` for UI primitives.
- No Tailwind — components use CSS modules internally
- `"use client"` is handled by the bundle — no need to wrap imports
- App-specific components (e.g. BrandLogo) should live in the app, not in uzi

Available components:
- `Button` — primary, secondary, outline, ghost variants; supports `as="a"` for anchor rendering
- `Card` — surface container with tone and padding props
- `Pill` — inline badge/tag
- `Modal` — accessible overlay dialog with size variants
- `Dropdown` — select-style dropdown with option list
- `AppShell` — responsive layout with collapsible sidebar and sticky topbar
- `SidebarNav` — sidebar navigation list
- `ToastProvider` / `useToast` — toast notification system; wrap app in `ToastProvider`, call `useToast()` to trigger toasts
- `cx` — utility for conditional class name merging
```

## Component List

| Component | Hooks used |
|---|---|
| `Button` | none |
| `Card` | none |
| `Pill` | none |
| `Modal` | `useRef` |
| `Dropdown` | `useState`, `useRef`, `useEffect` |
| `AppShell` | `useState`, `useEffect`, `useRef`, `useId` |
| `SidebarNav` | none |
| `ToastProvider` / `useToast` | `createContext`, `useState`, `useEffect`, `useRef` |
