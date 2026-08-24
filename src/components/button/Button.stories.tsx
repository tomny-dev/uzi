import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "md", "lg", "icon"],
    },
    asChild: { control: "boolean" },
    as: { control: "select", options: ["button", "a", undefined] },
    href: { control: "text" },
  },
  args: { children: "Button" },
} satisfies Meta<ButtonProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = { args: { variant: "primary" } };

export const Secondary: Story = { args: { variant: "secondary" } };

export const Outline: Story = { args: { variant: "outline" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Destructive: Story = { args: { variant: "destructive" } };

export const Link: Story = { args: { variant: "link" } };

export const Sizes: Story = {
  args: { variant: "default" },
  render: (args) => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Button variant={args.variant} size="sm">Small</Button>
      <Button variant={args.variant} size="md">Medium</Button>
      <Button variant={args.variant} size="default">Default</Button>
      <Button variant={args.variant} size="lg">Large</Button>
      <Button variant={args.variant} size="icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
        </svg>
      </Button>
    </div>
  ),
};

export const AnchorVariant: Story = {
  args: { as: "a", href: "#", variant: "primary" },
};

export const AllVariantsAndSizes: Story = {
  render: () => {
    const variants: ButtonProps["variant"][] = ["default", "primary", "secondary", "outline", "ghost", "destructive", "link"];
    const sizes: ButtonProps["size"][] = ["sm", "md", "default", "lg"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {variants.map((variant) => (
          <div key={variant} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {variant} {size}
              </Button>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
