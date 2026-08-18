import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";
import type { AvatarProps } from "./Avatar";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
  },
} satisfies Meta<AvatarProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { size: "md" },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/tomny-dev.png" alt="tomny-dev" />
      <AvatarFallback>TD</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      {(["sm", "md", "lg", "xl"] as AvatarProps["size"][]).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const WithImage: Story = {
  args: { size: "lg" },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/tomny-dev.png" alt="tomny-dev" />
      <AvatarFallback>TD</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  args: { size: "xl" },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>Uzi</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackStates: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      {["A", "U", "Z", "I", "Dev"].map((letter) => (
        <Avatar key={letter} size="md">
          <AvatarFallback>{letter}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const AllSizesWithFallback: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      {(["sm", "md", "lg", "xl"] as AvatarProps["size"][]).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarImage src="https://github.com/tomny-dev.png" alt="tomny-dev" />
          <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
