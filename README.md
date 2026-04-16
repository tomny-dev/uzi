# @tomny-dev/uzi

Rapid-fire React UI components. Ship faster, build more.

## Install

```bash
pnpm add @tomny-dev/uzi
```

## Usage

```tsx
import { Button, Card, Modal, useToast } from "@tomny-dev/uzi";
```

## Components

| Component    | Description                              |
|--------------|------------------------------------------|
| `Button`     | Primary, secondary, outline, ghost variants |
| `Card`       | Surface container with tone/padding control |
| `Pill`       | Inline badge/tag                         |
| `Modal`      | Accessible overlay dialog                |
| `Dropdown`   | Select-style dropdown                    |
| `AppShell`   | Responsive layout with collapsible sidebar |
| `SidebarNav` | Sidebar navigation list                  |
| `ToastProvider` / `useToast` | Toast notification system |

## Development

```bash
pnpm install
pnpm dev    # watch mode
pnpm build  # production build
pnpm lint   # type check
```

## Claude Code

A `CLAUDE.md` is included with architecture notes, component conventions, and publishing details. If you're using Claude Code in a consumer repo, you can reference it in your own `CLAUDE.md`:

```md
## UI Components
See node_modules/@tomny-dev/uzi/CLAUDE.md for component API and usage notes.
```
