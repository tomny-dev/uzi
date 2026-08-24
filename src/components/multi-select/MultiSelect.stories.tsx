import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "./MultiSelect";
import type { MultiSelectProps } from "./MultiSelect";

const options: MultiSelectProps["options"] = [
  { label: "JavaScript", value: "js" },
  { label: "TypeScript", value: "ts" },
  { label: "Python", value: "py" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Ruby", value: "rb" },
];

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
} satisfies Meta<MultiSelectProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <MultiSelect
          options={options}
          value={value}
          onChange={setValue}
          placeholder="Select languages"
        />
        <span style={{ fontSize: "0.875rem" }}>Selected: {value.join(", ") || "none"}</span>
      </div>
    );
  },
};

export const CheckboxMenu: Story = {
  render: () => {
    const [value, setValue] = useState(["js", "ts", "py"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <MultiSelect
          options={options}
          value={value}
          onChange={setValue}
          placeholder="Select languages"
        />
        <span style={{ fontSize: "0.875rem" }}>Selected: {value.join(", ")}</span>
      </div>
    );
  },
};

export const ChipDisplay: Story = {
  render: () => {
    const [value, setValue] = useState(["js", "ts", "py", "go", "rust", "rb"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <MultiSelect
          options={options}
          value={value}
          onChange={setValue}
          placeholder="Select languages"
          maxVisibleValues={2}
        />
        <span style={{ fontSize: "0.875rem" }}>6 selected, max 2 visible</span>
      </div>
    );
  },
};

export const OverflowBehavior: Story = {
  render: () => {
    const [value, setValue] = useState(["js", "ts", "py", "go"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <MultiSelect
          options={options}
          value={value}
          onChange={setValue}
          maxVisibleValues={2}
        />
        <span style={{ fontSize: "0.875rem" }}>4 selected, 2 visible, "+2" overflow</span>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <MultiSelect
      options={options}
      value={["js", "ts"]}
      onChange={() => {}}
      placeholder="Disabled"
      disabled
    />
  ),
};

export const WithDisabledOptions: Story = {
  render: () => {
    const disabledOptions = [
      ...options,
      { label: "Perl", value: "pl", disabled: true },
      { label: "Haskell", value: "hs", disabled: true },
    ];
    const [value, setValue] = useState(["js"]);
    return (
      <MultiSelect
        options={disabledOptions}
        value={value}
        onChange={setValue}
        placeholder="Select languages"
      />
    );
  },
};
