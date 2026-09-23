import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button/Button";
import { Input } from "../input/Input";
import { Select } from "../select/Select";
import { Toolbar, ToolbarGroup } from "./Toolbar";
import type { ToolbarProps } from "./Toolbar";

const meta = {
  title: "Foundations/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
  argTypes: {
    density: { control: "select", options: ["compact", "default"] },
    sticky: { control: "boolean" },
  },
} satisfies Meta<ToolbarProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilterWorkspace: Story = {
  args: { density: "compact" },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup label="Search" grow>
        <Input aria-label="Search" placeholder="Search..." style={{ minWidth: "12rem" }} />
      </ToolbarGroup>
      <ToolbarGroup label="Status">
        <Select
          aria-label="Status"
          fullWidth={false}
          value=""
          allowEmptyOption
          placeholder="All"
          options={[{ label: "Active", value: "active" }, { label: "Complete", value: "complete" }]}
          onChange={() => undefined}
        />
      </ToolbarGroup>
      <ToolbarGroup>
        <Button size="sm" variant="outline">Reset</Button>
        <Button size="sm">Refresh</Button>
      </ToolbarGroup>
    </Toolbar>
  ),
};
