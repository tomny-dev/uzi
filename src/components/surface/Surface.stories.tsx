import type { Meta, StoryObj } from "@storybook/react";
import { Surface } from "./Surface";
import type { SurfaceProps } from "./Surface";

const meta = {
  title: "Foundations/Surface",
  component: Surface,
  tags: ["autodocs"],
  argTypes: {
    level: { control: "select", options: ["base", "subtle", "raised", "selected"] },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    radius: { control: "select", options: ["none", "sm", "md", "lg"] },
    bordered: { control: "boolean" },
  },
} satisfies Meta<SurfaceProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Levels: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
      {(["base", "subtle", "raised", "selected"] as const).map((level) => (
        <Surface key={level} level={level} bordered padding="lg">
          <strong>{level}</strong>
          <p style={{ margin: "0.5rem 0 0", color: "var(--uzi-text-secondary)" }}>
            Use surface contrast before adding stronger borders or shadows.
          </p>
        </Surface>
      ))}
    </div>
  ),
};
