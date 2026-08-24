import type { Meta, StoryObj } from "@storybook/react";
import { TopBar } from "./TopBar";
import type { TopBarProps } from "./TopBar";
import { ThemeToggleButton } from "../theme-toggle-button/ThemeToggleButton";
import { Button } from "../button/Button";

const meta = {
  title: "Components/TopBar",
  component: TopBar,
  tags: ["autodocs"],
  argTypes: {
    brandingLocation: { control: "select", options: ["left", "center"] },
  },
} satisfies Meta<TopBarProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ marginTop: "0" }}>
      <TopBar brand="MyApp" brandHref="#" />
      <div style={{ padding: "2rem" }}>
        <p>Content below top bar</p>
      </div>
    </div>
  ),
};

export const BrandLeft: Story = {
  render: () => (
    <div style={{ marginTop: "0" }}>
      <TopBar
        brand="MyApp"
        brandHref="#"
        brandingLocation="left"
        start={<span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Dashboard</span>}
        actions={<Button variant="outline" size="sm">Settings</Button>}
      />
      <div style={{ padding: "2rem" }}>
        <p>Content below top bar</p>
      </div>
    </div>
  ),
};

export const BrandCenter: Story = {
  render: () => (
    <div style={{ marginTop: "0" }}>
      <TopBar
        brand="MyApp"
        brandHref="#"
        brandingLocation="center"
        actions={<Button variant="outline" size="sm">Settings</Button>}
      />
      <div style={{ padding: "2rem" }}>
        <p>Content below top bar</p>
      </div>
    </div>
  ),
};

export const StickyAndStatic: Story = {
  render: () => (
    <div style={{ marginTop: "0" }}>
      <TopBar brand="Sticky" isSticky={true} />
      <div style={{ padding: "1rem" }}>
        <p>Sticky top bar (default)</p>
      </div>
      <div style={{ height: "200px" }} />
      <div style={{ marginTop: "0" }}>
        <TopBar brand="Static" isSticky={false} />
        <div style={{ padding: "1rem" }}>
          <p>Static top bar (isSticky=false)</p>
        </div>
      </div>
    </div>
  ),
};

export const WithThemeToggle: Story = {
  render: () => (
    <div style={{ marginTop: "0" }}>
      <TopBar
        brand="MyApp"
        showThemeToggle
      />
      <div style={{ padding: "2rem" }}>
        <p>Top bar with theme toggle button</p>
      </div>
    </div>
  ),
};

export const LayoutVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <TopBar
        brand="Left Brand"
        brandingLocation="left"
        start={<span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Page</span>}
        actions={<ThemeToggleButton />}
      />
      <TopBar
        brand="Center Brand"
        brandingLocation="center"
        actions={<ThemeToggleButton />}
      />
    </div>
  ),
};

export const WithCenterContent: Story = {
  render: () => (
    <div style={{ marginTop: "0" }}>
      <TopBar
        brand="MyApp"
        brandingLocation="left"
        center={
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Button variant="ghost" size="sm">Home</Button>
            <Button variant="ghost" size="sm">Docs</Button>
            <Button variant="ghost" size="sm">Support</Button>
          </div>
        }
        actions={<ThemeToggleButton />}
      />
      <div style={{ padding: "2rem" }}>
        <p>Top bar with center navigation links</p>
      </div>
    </div>
  ),
};
