# CLAUDE.md

## Overview

`@tomny-dev/uzi` is a personal React component library. CSS modules for styling, no Tailwind dependency.

## Commands

```bash
pnpm install       # install deps
pnpm dev           # watch mode
pnpm build         # production build (Vite + tsc -> dist/)
pnpm lint          # type check only
pnpm test          # unit tests
```

## Publishing

Versioning and stable npm publishing are managed by Release Please:

1. Merge feature and fix PRs into `main` using Conventional Commit titles such as `fix: constrain modal height` or `feat: add auth card`.
2. The release workflow opens or updates a Release Please PR that bumps `package.json`, updates `CHANGELOG.md`, and advances `.release-please-manifest.json`.
3. Merge the Release Please PR to create the `vX.Y.Z` tag and GitHub release.
4. The same release workflow validates and publishes `@tomny-dev/uzi@X.Y.Z` to npm.

PR titles and squash/merge commit titles matter. Do not merge release-worthy changes with titles like `[codex] ...` or `fix modal sizing`, because Release Please will not treat those as releasable Conventional Commits.

Pull requests also publish preview builds to npm under a PR-specific dist-tag (for example `pr-123`) without updating `latest`. Use these to test consumer apps before merge.

Stable releases publish with npm provenance. Configure npm Trusted Publishing for the `Release` workflow, or keep a scoped `NPM_TOKEN` repository secret as a fallback.

## Adding Components

1. Create `src/components/<name>/<Name>.tsx` and `<name>.module.css`
2. Add `"use client";` at the top of any component that uses React hooks
3. Export from `src/index.ts`
4. Choose the right base before implementing:
   - native HTML for simple controls
   - Radix for accessibility-heavy interactive primitives
   - `uzi` composition for layout shells and opinionated templates

## Architecture

- **No Tailwind** - uses CSS modules
- **`cx()` utility** - exported from `src/utils/cx.ts`, use for conditional class names
- **Vite + TypeScript** - Vite builds the ESM/CJS bundles and CSS, while `tsc` emits type declarations to `dist/`
- **`"use client"` boundary** - client entry points declare `"use client"` in source; the server entry remains server-safe
- **`src/server.ts`** - separate Vite library entry with no `"use client"` boundary; safe to import in Next.js server components. Currently exports `getThemeScript`.
- **`@tomny-dev/uzi/server`** - the `/server` subpath export; consumer tsconfigs need `"moduleResolution": "bundler"` to resolve it

### Component philosophy

- **Native first for simple controls** - prefer plain HTML inputs when the browser behavior is already correct and styling requirements are modest.
- **Radix for hard primitives** - use Radix for components with non-trivial keyboard interaction, focus management, portals, overlays, or selection state machines.
- **`uzi` for the design system layer** - `uzi` should provide the styled API, tokens, and app-level templates rather than reinventing primitive behavior from scratch.

Good `uzi` targets: `TopBar`, `SidebarNav`, `AppShell`, themed wrappers, and opinionated composites.

Good Radix-backed targets: `Select`, `DropdownMenu`, `Modal`, `Toast`, and future `Popover`, `Tooltip`, `Tabs`, and similar interaction-heavy components.

## Design Tokens (CSS custom properties)

Defined in `src/theme/theme.css`. Components use these - never hardcode colors.

| Token | Purpose |
|---|---|
| `--background` | Page background |
| `--foreground` | Primary text |
| `--card` | Elevated surface (cards, panels) |
| `--border` | Borders and dividers |
| `--muted` | Subtle background fills |
| `--muted-foreground` | Secondary/placeholder text |
| `--primary` | Brand accent color |
| `--ring` | Focus ring base color |
| `--focus-ring` | `2px solid color-mix(in srgb, var(--ring) 50%, transparent)` - use on `:focus-visible` |
| `--focus-ring-offset` | `2px` - pair with `--focus-ring` |
| `--surface-topbar` | TopBar background |
| `--destructive` | Error/danger color |

### Focus rings

All interactive elements must use:
```css
:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}
```

Never use `outline: none` without replacing it with `:focus-visible`. Never use `box-shadow` as a focus ring substitute.

### Using alpha variants

Use `color-mix` - never hardcode rgba:
```css
background: color-mix(in srgb, var(--primary) 10%, transparent);
```

## Theming

- Themes are applied via `data-uzi-theme="dark|light"` on `<html>`
- Accents via `data-uzi-accent="amber|cyan|..."` on `<html>`
- `ThemeProvider` applies these at runtime; for SSR flash prevention, set attributes directly on `<html>` in the server layout
- `getThemeScript()` (from `@tomny-dev/uzi/server`) returns a blocking inline script string that reads localStorage and sets theme attributes before first paint - use when theme is user-switchable
- For fixed themes (e.g. always dark), skip `getThemeScript` and hardcode `className="dark" data-uzi-theme="dark" style={{ colorScheme: "dark" }}` on `<html>`

## AppShell layout contract

`AppShell` renders a full-viewport grid (`min-height: 100dvh`). The `main` area has no default padding - **each page is responsible for its own padding and max-width**. Use `mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8` as the standard page wrapper. Pages that need full-bleed layouts (e.g. split-panel UIs) can skip this wrapper and control their own layout directly.

## For Consumer Repos

When using `@tomny-dev/uzi` in a project, add this to the consumer's `CLAUDE.md`:

```md
## UI Components
This project uses `@tomny-dev/uzi` for UI primitives.
- No Tailwind - components use CSS modules internally
- `"use client"` is handled by the bundle - no need to wrap imports
- App-specific components (e.g. BrandLogo) should live in the app, not in uzi
- Server-safe exports (e.g. `getThemeScript`) are at `@tomny-dev/uzi/server`

Available components:
- `Button` - primary, secondary, outline, ghost variants
- `Card` - surface container with tone and padding props
- `Pill` - inline badge/tag
- `Alert` - feedback banner; tones: success, error, warning, info
- `Modal` - Radix-backed overlay dialog with size variants (sm, md, lg, xl)
- `ModalOverlay` - Radix-backed bare dialog layer; use when you need a custom modal layout
- `MultiSelect` - custom multi-option picker with checkbox-style menu
- `Select` - styled Radix-based single-select field
- `Dropdown` - deprecated compatibility alias for Select
- `AppShell` - responsive layout with collapsible sidebar and sticky topbar; no default padding on main area
- `SidebarNav` - sidebar navigation list
- `ThemeProvider` - applies theme/accent tokens; use `theme` prop for controlled (fixed) themes, `defaultTheme` for user-switchable
- `ThemeToggleButton` - light/dark toggle button for the topbar
- `ToastProvider` / `useToast` - Radix-backed toast notification system
- `cx` - utility for conditional class name merging
```

## Component List

| Component | Hooks used | Notes |
|---|---|---|
| `Button` | none | |
| `Card` | none | |
| `Pill` | none | |
| `Alert` | none | role="alert"; tones: success, error, warning, info |
| `Modal` | none | Built on `ModalOverlay` and Radix Dialog |
| `ModalOverlay` | none | Radix Dialog wrapper for custom modal layouts |
| `MultiSelect` | `useMemo`, `useCallback`, `forwardRef` | Custom multi-select with hidden input support |
| `Select` | `forwardRef` | Radix-backed single-select with styled popup content |
| `Dropdown` | `forwardRef` | Deprecated Select compatibility alias |
| `AppShell` | `useState`, `useEffect`, `useRef`, `useId` | |
| `SidebarNav` | none | Active item uses `color-mix(primary)` bg |
| `ThemeProvider` | `useState`, `useEffect` | Lazy initializers read localStorage synchronously |
| `ThemeToggleButton` | none | |
| `ToastProvider` / `useToast` | `createContext`, `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` | Radix Toast viewport and root primitives |
