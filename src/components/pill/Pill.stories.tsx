import type { Meta, StoryObj } from "@storybook/react";
import { Pill } from "./Pill";
import type { PillProps } from "./Pill";

const meta = {
  title: "Components/Pill",
  component: Pill,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "success", "warning", "info", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    as: { control: "select", options: ["span", "div", "button"] },
  },
  args: { children: "Pill Label" },
} satisfies Meta<PillProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { tone: "neutral" },
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {(["neutral", "success", "warning", "info", "danger"] as PillProps["tone"][]).map((tone) => (
        <Pill key={tone} tone={tone}>{tone}</Pill>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  args: { tone: "neutral" },
  render: (args) => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Pill {...args} size="sm">Small</Pill>
      <Pill {...args} size="md">Medium</Pill>
    </div>
  ),
};

export const AllTonesAndSizes: Story = {
  render: () => {
    const tones: PillProps["tone"][] = ["neutral", "success", "warning", "info", "danger"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {tones.map((tone) => (
          <div key={tone} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Pill tone={tone} size="sm">{tone} sm</Pill>
            <Pill tone={tone} size="md">{tone} md</Pill>
          </div>
        ))}
      </div>
    );
  },
};

export const IconVariant: Story = {
  args: { tone: "success", size: "md" },
  render: (args) => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Pill {...args} icon={
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }>Verified</Pill>
      <Pill tone="warning" size="sm" icon={
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v6M8 11.5v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      }>Warning</Pill>
      <Pill tone="danger" size="md" icon={
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      }>Error</Pill>
    </div>
  ),
};

export const ElementTypes: Story = {
  args: { tone: "info", size: "md" },
  render: (args) => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Pill {...args} as="span">Span (default)</Pill>
      <Pill {...args} as="div">Div</Pill>
      <Pill {...args} as="button">Button</Pill>
    </div>
  ),
};
