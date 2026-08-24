import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import type { InputProps } from "./Input";
import { Label } from "../label/Label";
import { Checkbox } from "../checkbox/Checkbox";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
  },
} satisfies Meta<InputProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
};

export const InputTypes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "300px" }}>
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="tel" placeholder="Phone input" />
      <Input type="url" placeholder="URL input" />
      <Input type="search" placeholder="Search input" />
    </div>
  ),
};

export const LabelPairing: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "300px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Your email" />
      </div>
    </div>
  ),
};

export const DisabledState: Story = {
  args: { placeholder: "Disabled input", disabled: true },
};

export const RequiredState: Story = {
  args: { placeholder: "Required input", required: true },
};

export const CheckboxLabelGroup: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "300px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="terms" />
        <Label htmlFor="terms" style={{ margin: 0 }}>I agree to the terms</Label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="newsletter" />
        <Label htmlFor="newsletter" style={{ margin: 0 }}>Subscribe to newsletter</Label>
      </div>
    </div>
  ),
};

export const FormGroup: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "300px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="Choose a username" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Create a password" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="remember" />
        <Label htmlFor="remember" style={{ margin: 0 }}>Remember me</Label>
      </div>
    </div>
  ),
};
