import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "./AppShell";
import type { AppShellProps } from "./AppShell";
import { SidebarNav } from "../sidebar-nav/SidebarNav";
import { TopBar } from "../top-bar/TopBar";

const sidebarItems = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Projects", href: "/projects" },
  { label: "Settings", href: "/settings" },
];

const meta = {
  title: "Components/AppShell",
  component: AppShell,
  tags: ["autodocs"],
} satisfies Meta<AppShellProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AppShell
      brand="MyApp"
      brandHref="#"
      sidebar={<SidebarNav items={sidebarItems} />}
    >
      <div style={{ padding: "2rem" }}>
        <h1>Dashboard</h1>
        <p>Main content area</p>
      </div>
    </AppShell>
  ),
};

export const FullDashboardLayout: Story = {
  render: () => (
    <AppShell
      brand="MyApp"
      brandHref="#"
      showThemeToggle
      sidebar={
        <SidebarNav
          items={[
            { label: "Dashboard", href: "/", active: true },
            { label: "Projects", href: "/projects" },
            { label: "Settings", href: "/settings" },
          ]}
        />
      }
    >
      <div style={{ padding: "2rem" }}>
        <h1>Full Dashboard</h1>
        <p>Responsive app shell with sidebar and top bar.</p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <div style={{ padding: "1rem", background: "var(--muted)", borderRadius: "8px", flex: 1 }}>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Stats</h3>
            <p style={{ margin: 0 }}>Content placeholder</p>
          </div>
          <div style={{ padding: "1rem", background: "var(--muted)", borderRadius: "8px", flex: 1 }}>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Activity</h3>
            <p style={{ margin: 0 }}>Content placeholder</p>
          </div>
        </div>
      </div>
    </AppShell>
  ),
};

export const CustomSidebarWidth: Story = {
  render: () => (
    <AppShell
      brand="MyApp"
      sidebarWidth="320"
      sidebar={<SidebarNav items={sidebarItems} />}
    >
      <div style={{ padding: "2rem" }}>
        <p>Custom sidebar width: 320px</p>
      </div>
    </AppShell>
  ),
};

export const ResponsiveSidebar: Story = {
  render: () => (
    <AppShell
      brand="MyApp"
      brandHref="#"
      sidebar={<SidebarNav items={sidebarItems} />}
      onSidebarToggle={(open) => {
        // In Storybook, we can just log the state
        console.log("Sidebar open:", open);
      }}
    >
      <div style={{ padding: "2rem" }}>
        <p>Resize the browser to see responsive behavior.</p>
        <p>On mobile (&lt;960px), the sidebar collapses and a hamburger menu appears.</p>
      </div>
    </AppShell>
  ),
};

export const WithTopbarContent: Story = {
  render: () => (
    <AppShell
      brand="MyApp"
      topbarStart={<span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Home</span>}
      topbarEnd={<span style={{ fontSize: "0.875rem" }}>user@example.com</span>}
      sidebar={<SidebarNav items={sidebarItems} />}
    >
      <div style={{ padding: "2rem" }}>
        <p>Top bar with custom start/end content</p>
      </div>
    </AppShell>
  ),
};
