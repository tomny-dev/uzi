import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "../checkbox/Checkbox";
import { Input } from "../input/Input";
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
        <Input id="name" type="text" placeholder="Your name" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
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
      <Checkbox id="agree" />
      <Label htmlFor="agree" style={{ margin: 0 }}>I agree to the terms</Label>
    </div>
  ),
};
