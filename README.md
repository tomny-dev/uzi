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
