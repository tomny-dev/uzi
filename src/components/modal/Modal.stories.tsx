import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";
import type { ModalProps, ModalSize } from "./Modal";
import { ModalOverlay } from "./Modal";
import type { ModalOverlayProps } from "./Modal";
import { Button } from "../button/Button";

const meta = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
  },
} satisfies Meta<ModalProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { open: true, onClose: () => {}, title: "Default Modal", size: "md" },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setOpen(false)}>Save</Button>
          </div>
        }
      >
        <p>Modal content goes here.</p>
      </Modal>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const sizes: ModalSize[] = ["sm", "md", "lg", "xl"];
    return (
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {sizes.map((size) => {
          const SizeStory = () => {
            const [open, setOpen] = useState(false);
            return (
              <>
                <Button variant="outline" size="sm" onClick={() => setOpen(true)}>{size} size</Button>
                {open && (
                  <Modal open={open} onClose={() => setOpen(false)} title={`${size.toUpperCase()} Modal`} size={size}>
                    <p>This is a {size} modal.</p>
                  </Modal>
                )}
              </>
            );
          };
          return <SizeStory key={size} />;
        })}
      </div>
    );
  },
};

export const WithSubtitle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open with subtitle</Button>
        {open && (
          <Modal open={open} onClose={() => setOpen(false)} title="Settings" subtitle="Configure your preferences">
            <p>Settings content here.</p>
          </Modal>
        )}
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open with footer</Button>
        {open && (
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="Confirm Action"
            footer={
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="destructive" size="sm" onClick={() => setOpen(false)}>Delete</Button>
              </div>
            }
          >
            <p>Are you sure you want to proceed? This action cannot be undone.</p>
          </Modal>
        )}
      </>
    );
  },
};

export const ControlledPattern: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Controlled Modal">
          <p>Open: {open ? "yes" : "no"}</p>
        </Modal>
      </>
    );
  },
};

export const Overlay: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Overlay</Button>
        {open && (
          <ModalOverlay open={open} onClose={() => setOpen(false)}>
            <div style={{ padding: "2rem", background: "var(--background)", borderRadius: "8px" }}>
              <h3>Custom Overlay Content</h3>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} style={{ marginTop: "1rem" }}>Close</Button>
            </div>
          </ModalOverlay>
        )}
      </>
    );
  },
};
