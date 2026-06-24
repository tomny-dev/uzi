# Getting Started

## Installation

```bash
pnpm add @tomny-dev/uzi
```

## Importing Styles

Import the bundled component styles once at the entry point of your application:

```css
@import "@tomny-dev/uzi/styles.css";
```

If you are using Vite or a bundler that supports CSS imports in JavaScript, you can also import it from JS:

```ts
import "@tomny-dev/uzi/styles.css";
```

## Minimal Example (Button + Card + ThemeProvider)

Wrap your app in `ThemeProvider` and render any component:

```tsx
"use client";

import { Button, Card, ThemeProvider } from "@tomny-dev/uzi";

export function App() {
  return (
    <ThemeProvider defaultTheme="system" defaultAccent="blue">
      <Card padding="md">
        <h2>Welcome to uzi</h2>
        <Button onClick={() => alert("Hello!")}>Click me</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## The cx() Utility

`cx` is a lightweight utility that concatenates truthy string arguments with spaces. It is used by every uzi component for class merging so consumers can pass custom `className` props without conflicts.

```ts
import { cx } from "@tomny-dev/uzi";

cx("base-class", false, null, "conditional-class"); // "base-class conditional-class"
```

It is **not** `clsx` or `tailwind-merge` — it simply filters out falsy values and joins the rest with spaces. This means later arguments always win in case of duplicate class names.

## Accent Palette Reference

uzi ships with six accent palettes:

- `blue`
- `cyan`
- `violet`
- `emerald`
- `amber`
- `rose`

The default accent is `blue`. Change it via `ThemeProvider`'s `defaultAccent` prop or programmatically through `useTheme`'s `setAccent`:

```tsx
import { ThemeProvider, useTheme } from "@tomny-dev/uzi";

function AccentPicker() {
  const { accent, setAccent } = useTheme();
  return (
    <button onClick={() => setAccent("violet")}>Switch to violet</button>
  );
}
```

See [Theming](./theming.md) for the full API.