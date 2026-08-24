import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";
import type { AlertProps } from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["success", "error", "warning", "info"],
    },
  },
} satisfies Meta<AlertProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { tone: "success" },
  render: (args) => (
    <Alert {...args}>
      <strong>Success!</strong> Your changes have been saved.
    </Alert>
  ),
};

export const Error: Story = {
  args: { tone: "error" },
  render: (args) => (
    <Alert {...args}>
      <strong>Error!</strong> Something went wrong. Please try again.
    </Alert>
  ),
};

export const Warning: Story = {
  args: { tone: "warning" },
  render: (args) => (
    <Alert {...args}>
      <strong>Warning!</strong> Your session is about to expire.
    </Alert>
  ),
};

export const Info: Story = {
  args: { tone: "info" },
  render: (args) => (
    <Alert {...args}>
      <strong>Info</strong> A new version is available.
    </Alert>
  ),
};

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Alert tone="success">
        <strong>Success!</strong> Your changes have been saved.
      </Alert>
      <Alert tone="error">
        <strong>Error!</strong> Something went wrong.
      </Alert>
      <Alert tone="warning">
        <strong>Warning!</strong> Your session is about to expire.
      </Alert>
      <Alert tone="info">
        <strong>Info</strong> A new version is available.
      </Alert>
    </div>
  ),
};
