import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SidebarNav } from "./SidebarNav";
import type { SidebarNavProps } from "./SidebarNav";

const navItems: SidebarNavProps["items"] = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Projects", href: "/projects" },
  { label: "Settings", href: "/settings" },
  { label: "Help", href: "/help" },
];

const sectionedItems: SidebarNavProps["sections"] = [
  {
    id: "main",
    label: "Main",
    items: [
      { label: "Dashboard", href: "/", active: true },
      { label: "Projects", href: "/projects" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      { label: "General", href: "/settings" },
      { label: "Security", href: "/settings/security" },
      { label: "Billing", href: "/settings/billing", badge: "New" },
    ],
  },
];

const meta = {
  title: "Components/SidebarNav",
  component: SidebarNav,
  tags: ["autodocs"],
  argTypes: {
    collapsed: { control: "boolean" },
  },
} satisfies Meta<SidebarNavProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FlatNav: Story = {
  args: { items: navItems },
};

export const SectionedNav: Story = {
  args: { sections: sectionedItems },
};

export const ActiveDetection: Story = {
  args: { items: navItems, currentPath: "/projects" },
  render: (args) => {
    const [currentPath, setCurrentPath] = useState("/projects");
    return (
      <div style={{ display: "flex", gap: "1rem" }}>
        <SidebarNav {...args} items={navItems} currentPath={currentPath} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => setCurrentPath(item.href || "/")}
              style={{ padding: "0.25rem 0.5rem", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.875rem" }}
            >
              Navigate to {item.href}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

export const CollapsedState: Story = {
  args: { items: navItems, collapsed: true },
};

export const WithIconsAndBadges: Story = {
  render: () => {
    const itemsWithIcons: SidebarNavProps["items"] = [
      {
        label: "Dashboard",
        href: "/",
        active: true,
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
      },
      {
        label: "Projects",
        href: "/projects",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>,
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
        badge: "3",
      },
    ];
    return <SidebarNav items={itemsWithIcons} />;
  },
};

export const WithHeaderFooter: Story = {
  render: () => (
    <SidebarNav
      items={navItems}
      header={
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
          <strong>MyApp</strong>
        </div>
      }
      footer={
        <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border)", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
          v0.2.12
        </div>
      }
    />
  ),
};

export const DisabledItems: Story = {
  render: () => {
    const itemsWithDisabled: SidebarNavProps["items"] = [
      { label: "Dashboard", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Admin", href: "/admin", disabled: true },
      { label: "Settings", href: "/settings" },
    ];
    return <SidebarNav items={itemsWithDisabled} />;
  },
};

export const MatchStrategyMostSpecific: Story = {
  render: () => {
    const items: SidebarNavProps["items"] = [
      { label: "Dashboard", href: "/" },
      { label: "Settings", href: "/settings" },
      { label: "Security", href: "/settings/security" },
      { label: "Billing", href: "/settings/billing" },
    ];
    return <SidebarNav items={items} currentPath="/settings/security" matchStrategy="most-specific" />;
  },
};
