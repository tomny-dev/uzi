import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";
import type { DropdownProps } from "./Dropdown";

const options: DropdownProps["options"] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
} satisfies Meta<DropdownProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("all");
    return (
      <Dropdown
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Status"
      />
    );
  },
};

export const WithPlaceholder: Story = {
  render: () => {
    const [value, setValue] = useState("active");
    return (
      <Dropdown
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Filter by status"
      />
    );
  },
};

export const ControlledState: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Dropdown
          options={options}
          value={value}
          onChange={setValue}
          placeholder="Select status"
          allowClear
        />
        <span style={{ fontSize: "0.875rem" }}>Selected: {value || "none"}</span>
      </div>
    );
  },
};

export const WithoutClear: Story = {
  render: () => {
    const [value, setValue] = useState("active");
    return (
      <Dropdown
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Status"
        allowClear={false}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Dropdown
      options={options}
      value="active"
      onChange={() => {}}
      placeholder="Disabled dropdown"
      disabled
    />
  ),
};

export const CompactDisplay: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Dropdown
        options={options}
        value="all"
        onChange={() => {}}
        placeholder="All"
        fullWidth={false}
      />
      <Dropdown
        options={options}
        value="active"
        onChange={() => {}}
        placeholder="Active"
        fullWidth
      />
    </div>
  ),
};
