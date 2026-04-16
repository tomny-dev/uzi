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
| `Pill` | Inline badge/tag |
| `Modal` | Accessible overlay dialog |
| `Dropdown` | Select-style dropdown |
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
