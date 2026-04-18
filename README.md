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
| `Modal` | Accessible overlay dialog |
| `Select` | Native select field for choosing one option |
| `Dropdown` | Deprecated compatibility alias for Select |
| `DropdownMenu` | Radix-based action menu primitives |
| `AppShell` | Responsive layout with collapsible sidebar |
| `SidebarNav` | Sidebar navigation list |
| `TopBar` | Composable header shell for brand, nav triggers, and actions |
| `ThemeToggleButton` | Reusable light/dark toggle wired to `ThemeProvider` |
| `ThemeProvider` / `useTheme` | Light/dark + accent palette theming |
| `ToastProvider` / `useToast` | Toast notification system |

`TopBar` supports:

- `brandingLocation="left" | "center"`
- `isSticky={true | false}`
- `showThemeToggle`
- `themeToggleProps`

## Notes

- No Tailwind — components use CSS modules internally
- `"use client"` is handled by the bundle — no need to wrap imports
- `react` and `react-dom` are peer dependencies, provided by your app
