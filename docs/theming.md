# Theming

## ThemeProvider Props

```tsx
import { ThemeProvider } from "@tomny-dev/uzi";
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | App tree to render inside the theme context. |
| `theme` | `"light" \| "dark" \| "system"` | — | **Controlled** current theme. When provided, `defaultTheme` is ignored and external state owns the value. |
| `defaultTheme` | `"light" \| "dark" \| "system"` | `"system"` | **Uncontrolled** initial theme before any user interaction or stored value. |
| `accent` | `"blue" \| "cyan" \| "violet" \| "emerald" \| "amber" \| "rose"` | — | **Controlled** current accent palette. When provided, `defaultAccent` is ignored. |
| `defaultAccent` | `"blue" \| "cyan" \| "violet" \| "emerald" \| "amber" \| "rose"` | `"blue"` | **Uncontrolled** initial accent palette. |
| `onThemeChange` | `(theme: UziTheme) => void` | — | Callback fired whenever the theme changes (both user-driven and programmatic). |
| `onAccentChange` | `(accent: UziAccent) => void` | — | Callback fired whenever the accent changes. |
| `storageKey` | `string` | `"uzi-theme"` | Key used in `localStorage` for persisting the theme preference. |
| `accentStorageKey` | `string` | `"uzi-accent"` | Key used in `localStorage` for persisting the accent preference. |
| `disableStorage` | `boolean` | `false` | When `true`, skips reading/writing to `localStorage` entirely. Useful for SSR or when you manage persistence yourself. |
| `toastConfig` | `ToastConfig` | — | Optional configuration forwarded to the built-in `ToastProvider`. |

### Controlled vs Uncontrolled Usage

**Uncontrolled** (most common):

```tsx
<ThemeProvider defaultTheme="system" defaultAccent="blue">
  <App />
</ThemeProvider>
```

The library manages state internally, reads from `localStorage` on mount, and persists changes automatically.

**Controlled**:

```tsx
function App() {
  const [theme, setTheme] = useState<UziTheme>("dark");
  return (
    <ThemeProvider theme={theme} onThemeChange={setTheme}>
      <AppContent />
    </ThemeProvider>
  );
}
```

When `theme` or `accent` is provided, the corresponding value becomes fully controlled — internal state and `localStorage` are ignored for that property.

## useTheme Return Value

```tsx
import { useTheme } from "@tomny-dev/uzi";
```

| Property | Type | Description |
|---|---|---|
| `theme` | `"light" \| "dark" \| "system"` | The current (possibly controlled) theme value. |
| `resolvedTheme` | `"light" \| "dark"` | The actual resolved theme — `"system"` is evaluated against the OS preference at runtime. |
| `accent` | `"blue" \| "cyan" \| "violet" \| "emerald" \| "amber" \| "rose"` | The current (possibly controlled) accent palette. |
| `setTheme` | `(theme: UziTheme) => void` | Set the theme. Updates internal state, writes to `localStorage`, and fires `onThemeChange`. No-op when theme is controlled externally. |
| `setAccent` | `(accent: UziAccent) => void` | Set the accent palette. Same behavior as `setTheme` but for accents. |
| `toggleTheme` | `() => void` | Toggle between `"light"` and `"dark"`. Ignores `"system"` — always flips the resolved theme. No-op when theme is controlled externally. |

```tsx
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
```

## Supported Themes

| Value | Behavior |
|---|---|
| `"light"` | Always renders the light theme. |
| `"dark"` | Always renders the dark theme. |
| `"system"` | Follows the OS `prefers-color-scheme` setting. Updates live when the user changes their system preference. |

## Supported Accent Palettes

Six accent palettes are available:

- `blue` (default)
- `cyan`
- `violet`
- `emerald`
- `amber`
- `rose`

Each accent palette defines a set of CSS custom properties that color interactive elements — buttons, focus rings, selected states, and links.

## localStorage Persistence

By default, `ThemeProvider` reads the user's theme and accent preferences from `localStorage` on mount and writes to it on every change:

| Storage Key | Default Value |
|---|---|
| Theme preference | `"uzi-theme"` |
| Accent preference | `"uzi-accent"` |

To use custom keys:

```tsx
<ThemeProvider storageKey="my-app-theme" accentStorageKey="my-app-accent">
  <App />
</ThemeProvider>
```

To disable persistence entirely:

```tsx
<ThemeProvider disableStorage>
  <App />
</ThemeProvider>
```

## CSS Custom Property Overrides

Consumers can extend or override uzi's design tokens by setting CSS custom properties on `:root` or any ancestor. The library sets `data-uzi-theme` and `data-uzi-accent` attributes on the document root for targeted overrides:

```css
/* Override the accent color for all interactive elements */
:root {
  --uzi-color-accent: #ff6b6b;
}

/* Target a specific accent palette */
[data-uzi-accent="emerald"] {
  --uzi-color-accent: #34d399;
}

/* Dark-mode-specific override */
[data-uzi-theme="dark"] .sidebar {
  background: #1a1a2e;
}
```

Check the source file `src/theme/theme.css` for the full list of available tokens.