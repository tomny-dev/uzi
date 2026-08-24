import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./Progress";
import type { ProgressProps } from "./Progress";
import { useState } from "react";
import { Button } from "../button/Button";

const meta = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["default", "success", "warning", "danger"],
    },
    value: { control: "number", min: 0, max: 100 },
  },
} satisfies Meta<ProgressProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 50, "aria-label": "Default progress" },
};

export const Tones: Story = {
  render: () => {
    const tones: ProgressProps["tone"][] = ["default", "success", "warning", "danger"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tones.map((tone) => (
          <div key={tone} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.875rem" }}>{tone}</span>
            <Progress value={65} tone={tone} aria-label={`${tone} progress`} />
          </div>
        ))}
      </div>
    );
  },
};

export const ValueRange: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {[0, 10, 25, 50, 75, 90, 100].map((value) => (
        <div key={value} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.875rem", display: "flex", justifyContent: "space-between" }}>
            <span>{value}%</span>
          </span>
          <Progress value={value} aria-label={`Progress at ${value}%`} />
        </div>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <Progress value={value} aria-label="Interactive progress" />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="outline" size="sm" onClick={() => setValue(Math.max(0, value - 10))}>-10%</Button>
          <span style={{ display: "flex", alignItems: "center", minWidth: "3rem", justifyContent: "center" }}>{value}%</span>
          <Button size="sm" onClick={() => setValue(Math.min(100, value + 10))}>+10%</Button>
        </div>
      </div>
    );
  },
};

export const ARIAExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Progress value={45} tone="default" aria-label="Upload progress" />
      <Progress value={80} tone="success" aria-label="Storage usage" />
      <Progress value={35} tone="warning" aria-label="Memory usage" />
      <Progress value={95} tone="danger" aria-label="CPU usage" />
    </div>
  ),
};

export const AllTonesAndValues: Story = {
  render: () => {
    const tones: ProgressProps["tone"][] = ["default", "success", "warning", "danger"];
    const values = [25, 50, 75];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {tones.map((tone) => (
          <div key={tone} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {values.map((value) => (
              <div key={value} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "80px" }}>
                <Progress value={value} tone={tone} aria-label={`${tone} at ${value}%`} />
                <span style={{ fontSize: "0.75rem", textAlign: "center" }}>{value}%</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
