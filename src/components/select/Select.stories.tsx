import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";
import type { SelectProps } from "./Select";

const options: SelectProps["options"] = [
  { label: "JavaScript", value: "js" },
  { label: "TypeScript", value: "ts" },
  { label: "Python", value: "py" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
  },
} satisfies Meta<SelectProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options,
    value: "",
    onChange: () => {},
    placeholder: "Select a language",
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <Select
        {...args}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const OptionsArray: Story = {
  render: () => {
    const [value, setValue] = useState("ts");
    return (
      <Select
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Choose a language"
      />
    );
  },
};

export const ControlledState: Story = {
  render: () => {
    const [value, setValue] = useState("js");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Select
          options={options}
          value={value}
          onChange={setValue}
          placeholder="Select a language"
        />
        <span style={{ fontSize: "0.875rem" }}>Selected: {value || "none"}</span>
      </div>
    );
  },
};

export const WithPlaceholder: Story = {
  args: {
    options,
    value: "",
    onChange: () => {},
    placeholder: "Pick a language...",
    allowEmptyOption: true,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <Select
        {...args}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    options,
    value: "py",
    onChange: () => {},
    disabled: true,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <Select
        {...args}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const FullWidthAndCompact: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
      <Select
        options={options}
        value="js"
        onChange={() => {}}
        placeholder="Full width (default)"
        fullWidth={true}
      />
      <Select
        options={options}
        value="ts"
        onChange={() => {}}
        placeholder="Compact"
        fullWidth={false}
      />
    </div>
  ),
};
