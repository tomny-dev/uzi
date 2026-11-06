# @tomny-dev/uzi

Rapid-fire React UI components. Ship faster, build more.

Uzi is a reusable React component library for app interfaces, with design tokens, accessible interaction primitives, application layouts, and AI chat components.

## Install

```bash
pnpm add @tomny-dev/uzi
```

Uzi supports React 18 and 19 and uses CSS modules internally; Tailwind is not required.

## Quick start

Import the component stylesheet **once** in your application's global CSS:

```css
@import "@tomny-dev/uzi/styles.css";
```

Then use components in your app:

```tsx
"use client";

import { Button, Card, ThemeProvider } from "@tomny-dev/uzi";

export function App() {
  return (
    <ThemeProvider defaultTheme="system" defaultAccent="blue">
      <Card padding="md">
        <h2>Welcome to Uzi</h2>
        <Button onClick={() => alert("Hello!")}>Get started</Button>
      </Card>
    </ThemeProvider>
  );
}
```

For installation variants and a longer walkthrough, see [Getting Started](docs/getting-started.md).

## What's included

| Area | Examples |
|---|---|
| UI primitives | `Button`, `Card`, `Surface`, `Input`, `Label`, `Checkbox`, `Select`, `MultiSelect`, `Modal`, `DropdownMenu` |
| App layout | `AppShell`, `SidebarNav`, `TopBar`, `PageContainer`, `PageHeader`, `SectionHeader`, `Stack`, `Inline` |
| Common patterns | `Toolbar`, `ToolbarGroup`, `EmptyState`, `Avatar`, `Pill`, `Stat`, `StatGroup` |
| Theming and feedback | `ThemeProvider`, `useTheme`, `ThemeToggleButton`, `ToastProvider`, `useToast` |
| AI experiences | `AIChat`, `AIChatView`, `AIChatDock`, `FloatingActionStack`, `FloatingActionButton` |

These are representative exports, not an exhaustive API reference. Use the guides below for configuration and composition examples.

## Documentation

- [Getting Started](docs/getting-started.md) — Installation, styles, and first components
- [Theming](docs/theming.md) — Light/dark mode, accent palettes, theme APIs, and CSS overrides
- [Layout Patterns](docs/guides/layout-patterns.md) — Dashboard and header compositions
- [Application Scaffolding](docs/guides/application-scaffolding.md) — Page structure, empty states, and stats
- [Visual Hierarchy](docs/guides/visual-hierarchy.md) — Surface, typography, border, and toolbar conventions
- [Form Patterns](docs/guides/form-patterns.md) — Input, Select, MultiSelect, and SegmentedToggle
- [AI Chat](docs/guides/ai-chat.md) — Streaming API contracts, scope authorization, and renderers
- [SSR and Next.js](docs/ssr.md) — Server rendering, stylesheet imports, and server-safe exports

## Using Uzi with coding agents

Installing the package does not automatically tell Claude Code, Codex, or other agents to prefer Uzi components. Add a rule to your consuming application's `AGENTS.md`, `CLAUDE.md`, or equivalent instructing agents to check Uzi before creating new shared UI primitives.

For component discovery, usage examples, and agent configuration, see the [Uzi MCP server guide](mcp/README.md). The MCP server is not bundled in the main npm package.

## SSR and Next.js

For SSR frameworks, keep the stylesheet import shown above to prevent a flash of unstyled components. The main package entry is a client entry; `@tomny-dev/uzi/server` exposes the server-safe `getThemeScript`, while `@tomny-dev/uzi/utils` exposes environment-neutral helpers such as `cx`.

See [SSR and Next.js](docs/ssr.md) for details.

## Contributing

Working on Uzi itself? See [CONTRIBUTING.md](CONTRIBUTING.md) for local development, Storybook, testing, and design conventions. Infrastructure maintainers can find the Cloudflare Pages setup in [Storybook Deployment](docs/deployment.md).
