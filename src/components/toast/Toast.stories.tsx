import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./ToastContext";
import type { ToastType } from "./types";
import { Button } from "../button/Button";

function ToastDemo() {
  const { push, success, error, warning, info } = useToast();
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Button variant="outline" size="sm" onClick={() => push("Generic toast message")}>Push</Button>
      <Button size="sm" onClick={() => success("Operation completed!")}>Success</Button>
      <Button variant="destructive" size="sm" onClick={() => error("Something went wrong!")}>Error</Button>
      <Button variant="secondary" size="sm" onClick={() => warning("Please review your input.")}>Warning</Button>
      <Button variant="outline" size="sm" onClick={() => info("Here is some information.")}>Info</Button>
    </div>
  );
}

function ToastWithAction() {
  const { push } = useToast();
  return (
    <Button variant="outline" size="sm" onClick={() => {
      push("File downloaded", {
        type: "success",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo clicked"),
        },
      });
    }}>Toast with action</Button>
  );
}

function ToastWithDuration() {
  const { push } = useToast();
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Button variant="outline" size="sm" onClick={() => push("Short toast (1s)", { duration: 1000 })}>1s duration</Button>
      <Button variant="outline" size="sm" onClick={() => push("Long toast (8s)", { duration: 8000 })}>8s duration</Button>
      <Button variant="outline" size="sm" onClick={() => push("Indefinite toast", { duration: 0 })}>Indefinite</Button>
    </div>
  );
}

function ToastTypeButtons() {
  const { success, error, warning, info } = useToast();
  const types: { type: ToastType; fn: () => void; label: string }[] = [
    { type: "success", fn: () => success("Success toast"), label: "Success" },
    { type: "error", fn: () => error("Error toast"), label: "Error" },
    { type: "warning", fn: () => warning("Warning toast"), label: "Warning" },
    { type: "info", fn: () => info("Info toast"), label: "Info" },
  ];
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {types.map(({ type, fn, label }) => (
        <Button key={type} variant="outline" size="sm" onClick={fn}>{label}</Button>
      ))}
    </div>
  );
}

const meta = {
  title: "Components/Toast",
  component: ToastProvider,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HookDemo: Story = {
  render: () => <ToastDemo />,
};

export const WithAction: Story = {
  render: () => <ToastWithAction />,
};

export const DurationVariants: Story = {
  render: () => <ToastWithDuration />,
};

export const ToastTypes: Story = {
  render: () => <ToastTypes />,
};

export const AllToasts: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Intent-based methods</h4>
        <ToastDemo />
      </div>
      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Generic push</h4>
        <ToastWithAction />
      </div>
      <div>
        <h4 style={{ margin: "0 0 0.5rem 0" }}>Duration variants</h4>
        <ToastWithDuration />
      </div>
    </div>
  ),
};
