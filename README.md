# @tomny-dev/uzi

Rapid-fire React UI components. Ship faster, build more.

## Install

```bash
pnpm add @tomny-dev/uzi
```

## Usage

```tsx
import { Button, Card, Modal, ThemeProvider, useToast } from "@tomny-dev/uzi";
```

If you want the packaged component styles, import the exported stylesheet once in your app:

```css
@import "@tomny-dev/uzi/styles.css";
```

## Using With Coding Agents

Installing `@tomny-dev/uzi` in an app does not by itself cause Claude Code, Codex, or similar agents to prefer `uzi` components. You should add that policy to the consumer repo's agent guidance.

Recommended snippet for the consumer repo's `CLAUDE.md`, `AGENTS.md`, or equivalent:

```md
## UI Components

- Prefer `@tomny-dev/uzi` for shared UI primitives and layout components.
- Check `uzi` before creating new local primitives such as buttons, inputs, labels, cards, modals, selects, dropdown menus, alerts, shells, navigation, and theme controls.
- Only introduce a repo-local primitive when `uzi` lacks the required behavior or when the local file is intentionally app-specific composition.
- Keep imports consistent with the surrounding area of the codebase. If the repo already uses thin wrappers around `uzi`, follow that local pattern.
```

If you want agents to discover props and examples directly, also configure the `uzi` MCP server. See [`mcp/README.md`](./mcp/README.md).

## Themes

`uzi` ships with built-in light/dark tokens and a small accent palette layer.

```tsx
"use client";

import { Button, ThemeProvider, useTheme } from "@tomny-dev/uzi";

function ThemeToggle() {
  const { resolvedTheme, toggleTheme, accent, setAccent } = useTheme();

  return (
    <div>
      <Button onClick={toggleTheme}>
        {resolvedTheme === "dark" ? "Switch to light" : "Switch to dark"}
      </Button>
      <Button variant="outline" onClick={() => setAccent(accent === "violet" ? "blue" : "violet")}>
        Toggle accent
      </Button>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" defaultAccent="blue">
      <ThemeToggle />
    </ThemeProvider>
  );
}
```

Supported themes:

- `light`
- `dark`
- `system`

Supported accent palettes:

- `blue`
- `cyan`
- `violet`
- `emerald`
- `amber`
- `rose`

## Component Philosophy

`uzi` is not meant to be a from-scratch accessibility framework.

- Use native HTML for simple form controls when the platform already gives the right behavior.
- Use Radix for interaction-heavy primitives such as menus, dialogs, popovers, toasts, and custom selects.
- Use `uzi` for the public component API, styling, tokens, and higher-level templates like `TopBar`, `SidebarNav`, and `AppShell`.

In practice, `uzi` should spend its complexity budget on reusable app scaffolding and cohesive design, not on rebuilding low-level widget behavior that Radix or the browser already solves.

## Components

| Component | Description |
|---|---|
| `Avatar` | Profile image with fallback states |
| `Button` | Primary, secondary, outline, ghost variants |
| `Card` | Surface container with tone/padding control |
| `Checkbox` | Checkbox form primitive |
| `Input` | Text input primitive |
| `Label` | Form label primitive |
| `MultiSelect` | Custom multi-option picker with checkbox-style menu |
| `Pill` | Inline badge/tag |
| `Modal` | Radix-backed overlay dialog |
| `Select` | Styled Radix-based single-select field |
| `Dropdown` | Deprecated compatibility alias for Select |
| `DropdownMenu` | Radix-based action menu primitives |
| `AppShell` | Responsive layout with collapsible sidebar |
| `SidebarNav` | Sidebar navigation list |
| `TopBar` | Composable header shell for brand, nav triggers, and actions |
| `ThemeToggleButton` | Reusable light/dark toggle wired to `ThemeProvider` |
| `ThemeProvider` / `useTheme` | Light/dark + accent palette theming |
| `ToastProvider` / `useToast` | Radix-backed toast notification system |

`TopBar` supports:

- `brandingLocation="left" | "center"`
- `isSticky={true | false}`
- `showThemeToggle`
- `themeToggleProps`

## Documentation

- [Getting Started](docs/getting-started.md) — Installation, setup, and first component
- [Theming](docs/theming.md) — ThemeProvider, useTheme, accent palettes, CSS overrides
- [Layout Patterns](docs/guides/layout-patterns.md) — Dashboard, full-width header, center-branded
- [Form Patterns](docs/guides/form-patterns.md) — Input, Select, MultiSelect, SegmentedToggle patterns

## SSR Notes

This package bundles CSS inline into the JavaScript output via `vite-plugin-css-injected-by-js`.
At runtime, a `<style>` tag is injected into the document head so consumers do **not** need
to import `./styles.css` for client-side rendering.

If your app uses SSR (Next.js, Remix, etc.), the injected `<style>` tag won't run on the
server, so there may be a brief flash of unstyled content on the first client render.
Consumers who need SSR-safe styles should continue importing the separate stylesheet:

```css
@import "@tomny-dev/uzi/styles.css";
```

## Notes

- No Tailwind — components use CSS modules internally
- `"use client"` is handled by the bundle — no need to wrap imports
- `react` and `react-dom` are peer dependencies, provided by your app
