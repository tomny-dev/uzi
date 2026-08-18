import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Label text" },
};

export const WithHtmlFor: Story = {
  args: { htmlFor: "email", children: "Email address" },
};

export const InlineWithInput: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "280px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="name">Name</Label>
        <input id="name" type="text" placeholder="Your name" style={{ padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "6px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" placeholder="you@example.com" style={{ padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "6px" }} />
      </div>
    </div>
  ),
};

export const CustomClassName: Story = {
  args: {
    children: "Custom styled label",
    className: "custom-label",
    style: { color: "var(--destructive)", fontWeight: 600 } as React.CSSProperties,
  },
};

export const WithCheckbox: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <input id="agree" type="checkbox" style={{ width: "16px", height: "16px" }} />
      <Label htmlFor="agree" style={{ margin: 0 }}>I agree to the terms</Label>
    </div>
  ),
};
