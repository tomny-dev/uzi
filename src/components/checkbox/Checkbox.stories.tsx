import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";
import { Label } from "../label/Label";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="default" />
      <Label htmlFor="default" style={{ margin: 0 }}>Unchecked checkbox</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked" style={{ margin: 0 }}>Checked checkbox</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="disabled" disabled defaultChecked />
      <Label htmlFor="disabled" style={{ margin: 0 }}>Disabled checked</Label>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "240px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="terms" />
        <Label htmlFor="terms" style={{ margin: 0 }}>I agree to the terms</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="newsletter" defaultChecked />
        <Label htmlFor="newsletter" style={{ margin: 0 }}>Subscribe to newsletter</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="updates" />
        <Label htmlFor="updates" style={{ margin: 0 }}>Receive product updates</Label>
      </div>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="required" required />
      <Label htmlFor="required" style={{ margin: 0 }}>Agreement is required</Label>
    </div>
  ),
};

export const ControlledState: Story = {
  render: () => {
    const { useState } = require("react");
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Checkbox id="controlled" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <Label htmlFor="controlled" style={{ margin: 0 }}>Controlled: {checked ? "checked" : "unchecked"}</Label>
        </div>
      </div>
    );
  },
};
