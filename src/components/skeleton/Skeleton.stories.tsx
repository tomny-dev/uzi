import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";
import type { SkeletonProps } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    radius: {
      control: "select",
      options: ["sm", "md", "lg", "full"],
    },
  },
} satisfies Meta<SkeletonProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { width: "150px", height: "20px" },
};

export const WidthHeightCombinations: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Skeleton width="100%" height="12px" />
      <Skeleton width="80%" height="16px" />
      <Skeleton width="60%" height="20px" />
      <Skeleton width="40%" height="24px" />
      <Skeleton width="20%" height="32px" />
    </div>
  ),
};

export const RadiusPresets: Story = {
  args: { height: "20px", width: "150px" },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {(["sm", "md", "lg", "full"] as SkeletonProps["radius"][]).map((radius) => (
        <Skeleton key={radius} {...args} radius={radius} />
      ))}
    </div>
  ),
};

export const LoadingCard: Story = {
  render: () => (
    <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Skeleton width="80px" height="80px" radius="full" />
      <Skeleton width="100%" height="16px" />
      <Skeleton width="70%" height="14px" />
      <div style={{ height: "1px", background: "var(--border)" }} />
      <Skeleton width="100%" height="12px" />
      <Skeleton width="90%" height="12px" />
    </div>
  ),
};

export const LoadingList: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Skeleton width="40px" height="40px" radius="full" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <Skeleton width="60%" height="14px" />
            <Skeleton width="40%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllRadiusWithFullWidth: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {(["sm", "md", "lg", "full"] as SkeletonProps["radius"][]).map((radius) => (
        <Skeleton key={radius} width="100%" height="40px" radius={radius} />
      ))}
    </div>
  ),
};
