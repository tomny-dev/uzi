import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedToggle } from "./SegmentedToggle";
import type { SegmentedToggleProps } from "./SegmentedToggle";

const viewOptions: SegmentedToggleProps["options"] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const meta = {
  title: "Components/SegmentedToggle",
  component: SegmentedToggle,
  tags: ["autodocs"],
} satisfies Meta<SegmentedToggleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("day");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <SegmentedToggle
          options={viewOptions}
          value={value}
          onChange={setValue}
          aria-label="View toggle"
        />
        <span style={{ fontSize: "0.875rem" }}>Selected: {value}</span>
      </div>
    );
  },
};

export const ViewToggle: Story = {
  render: () => {
    const [value, setValue] = useState("day");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <SegmentedToggle
          options={viewOptions}
          value={value}
          onChange={setValue}
          aria-label="View toggle"
        />
        <span style={{ fontSize: "0.875rem" }}>Selected: {value}</span>
      </div>
    );
  },
};

export const DisabledOptions: Story = {
  render: () => {
    const [value, setValue] = useState("day");
    const optionsWithDisabled: SegmentedToggleProps["options"] = [
      { label: "Day", value: "day" },
      { label: "Week", value: "week", disabled: true },
      { label: "Month", value: "month" },
    ];
    return (
      <SegmentedToggle
        options={optionsWithDisabled}
        value={value}
        onChange={setValue}
        aria-label="View toggle with disabled"
      />
    );
  },
};

export const CustomLabels: Story = {
  render: () => {
    const [value, setValue] = useState("list");
    const customOptions: SegmentedToggleProps["options"] = [
      { label: <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" /></svg>
        List
      </span>, value: "list" },
      { label: <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
        Grid
      </span>, value: "grid" },
      { label: <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Stack
      </span>, value: "stack" },
    ];
    return (
      <SegmentedToggle
        options={customOptions}
        value={value}
        onChange={setValue}
        aria-label="Layout toggle"
      />
    );
  },
};

export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = useState("all");
    const options: SegmentedToggleProps["options"] = [
      { label: "All", value: "all" },
      { label: "Unread", value: "unread" },
    ];
    return (
      <SegmentedToggle
        options={options}
        value={value}
        onChange={setValue}
        aria-label="Filter toggle"
      />
    );
  },
};
