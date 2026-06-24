# Layout Patterns

uzi provides three layout primitives — `AppShell`, `SidebarNav`, and `TopBar` — that compose into responsive application scaffolds. This guide covers common patterns.

## Dashboard with Collapsible Sidebar

The most common pattern: a full-height shell with a sticky top bar, a collapsible sidebar on the left, and scrollable main content.

```tsx
"use client";

import {
  AppShell,
  SidebarNav,
  TopBar,
  Button,
} from "@tomny-dev/uzi";

const navItems = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Projects", href: "/projects" },
  { label: "Settings", href: "/settings" },
];

export function Dashboard() {
  return (
    <AppShell
      sidebar={
        <SidebarNav
          items={navItems}
          currentPath="/"
          ariaLabel="Main navigation"
        />
      }
      brand={<span>My App</span>}
      topbarEnd={
        <Button variant="outline" size="sm">
          Export
        </Button>
      }
    >
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <p>Your content goes here.</p>
      </main>
    </AppShell>
  );
}
```

The sidebar is **open by default on desktop** and **collapsed on mobile**, where it slides in as an overlay with a backdrop.

## Full-Width Top Bar Without Sidebar

Use `TopBar` directly when you don't need a sidebar — for marketing pages, login screens, or full-width tools.

```tsx
"use client";

import { TopBar, Button } from "@tomny-dev/uzi";

export function LandingPage() {
  return (
    <>
      <TopBar
        brand={<span>My App</span>}
        brandHref="/"
        actions={
          <>
            <Button variant="ghost" size="sm">Sign in</Button>
            <Button variant="primary" size="sm">Get started</Button>
          </>
        }
        isSticky={true}
      />
      <main style={{ padding: 48 }}>
        <h1>Welcome</h1>
      </main>
    </>
  );
}
```

## Center-Branded Header Pattern

Place the brand in the center of the top bar — common for search pages, dashboards with breadcrumbs on the left.

```tsx
"use client";

import { TopBar, Button, useTheme } from "@tomny-dev/uzi";

export function CenterBrandedHeader() {
  return (
    <TopBar
      brandingLocation="center"
      brand={<span>Search</span>}
      start={
        <nav aria-label="Breadcrumb">
          <a href="/">Home</a> / <span>Results</span>
        </nav>
      }
      actions={
        <TopBarThemeToggle />
      }
    />
  );
}

function TopBarThemeToggle() {
  const { toggleTheme } = useTheme();
  return <Button variant="ghost" onClick={toggleTheme}>🌙</Button>;
}
```

`brandingLocation` accepts `"left"` (default) or `"center"`. When set to `"center"`, the brand moves to the middle region and `start` content shifts to the left of it.

## Route Transitions (`closeSidebarOnChangeKey`)

On mobile, the sidebar stays open until the user taps the backdrop or scrolls. For single-page apps that change routes programmatically, use `closeSidebarOnChangeKey` to auto-close the sidebar when the route changes:

```tsx
"use client";

import { useEffect, useState } from "react";
import { AppShell, SidebarNav, type SidebarNavItem } from "@tomny-dev/uzi";

const navItems: SidebarNavItem[] = []; // Define your navigation items here

export function RouterAwareShell() {
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    // Replace with your router's pathname subscription
    setPathname(window.location.pathname);
  }, []);

  return (
    <AppShell
      sidebar={<SidebarNav items={navItems} currentPath={pathname} />}
      brand={<span>My App</span>}
      closeSidebarOnChangeKey={pathname}  // Closes sidebar on mobile when route changes
    >
      <h1>{pathname}</h1>
    </AppShell>
  );
}
```

The sidebar accepts any value as `closeSidebarOnChangeKey` — it closes whenever the reference or primitive value differs from the previous render. A route pathname is the most common choice.

## Custom Sidebar Width

Override the default sidebar width with the `sidebarWidth` prop:

```tsx
<AppShell
  sidebar={<SidebarNav items={navItems} />}
  brand={<span>My App</span>}
  sidebarWidth="220px"       // string CSS value
  // or
  sidebarWidth={300}         // number treated as pixels
>
```

## Collapsed Sidebar State

`SidebarNav` supports a `collapsed` prop that hides labels and descriptions, showing only icons:

```tsx
<SidebarNav
  items={navItems}
  collapsed={true}
  iconSize={20}
/>
```

This is useful for space-constrained layouts or user-preferred compact modes.