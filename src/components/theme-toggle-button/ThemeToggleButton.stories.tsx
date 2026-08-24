import type { Meta, StoryObj } from "@storybook/react";
import { ThemeToggleButton } from "./ThemeToggleButton";
import type { ThemeToggleButtonProps } from "./ThemeToggleButton";
import { TopBar } from "../top-bar/TopBar";

const meta = {
  title: "Components/ThemeToggleButton",
  component: ThemeToggleButton,
  tags: ["autodocs"],
  argTypes: {
    showLabel: { control: "boolean" },
  },
} satisfies Meta<ThemeToggleButtonProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <ThemeToggleButton />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <ThemeToggleButton />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <ThemeToggleButton showLabel />
    </div>
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <ThemeToggleButton showLabel lightLabel="Switch to dark" darkLabel="Switch to light" />
    </div>
  ),
};

export const InsideTopBar: Story = {
  render: () => (
    <TopBar
      brand="MyApp"
      showThemeToggle
      themeToggleProps={{ showLabel: true }}
    />
  ),
};

export const IconAndTextVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <ThemeToggleButton aria-label="Toggle theme icon only" />
      <ThemeToggleButton showLabel />
    </div>
  ),
};
