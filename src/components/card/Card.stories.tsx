import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import type { CardProps } from "./Card";
import { Button } from "../button/Button";
import { Pill } from "../pill/Pill";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["default", "muted", "contrast"],
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    interactive: { control: "boolean" },
    as: { control: "select", options: ["div", "section", "article"] },
  },
} satisfies Meta<CardProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { padding: "md" },
  render: (args) => (
    <Card {...args}>
      <h3 style={{ margin: "0 0 0.5rem 0" }}>Card Title</h3>
      <p style={{ margin: 0 }}>Default card content with md padding.</p>
    </Card>
  ),
};

export const Tones: Story = {
  args: { padding: "md" },
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {(["default", "muted", "contrast"] as CardProps["tone"][]).map((tone) => (
        <Card key={tone} {...args} tone={tone} style={{ width: "200px" }}>
          <h4 style={{ margin: "0 0 0.5rem 0" }}>{tone}</h4>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>Card tone: {tone}</p>
        </Card>
      ))}
    </div>
  ),
};

export const PaddingPresets: Story = {
  args: { tone: "default" },
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {(["none", "sm", "md", "lg"] as CardProps["padding"][]).map((padding) => (
        <Card key={padding} {...args} padding={padding} style={{ width: "160px" }}>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>Padding: {padding}</p>
        </Card>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  args: { padding: "md", interactive: true },
  render: (args) => (
    <Card {...args} style={{ width: "280px" }}>
      <h3 style={{ margin: "0 0 0.5rem 0" }}>Interactive Card</h3>
      <p style={{ margin: "0 0 1rem 0" }}>Hover or focus for affordance.</p>
      <Button variant="outline" size="sm">Action</Button>
    </Card>
  ),
};

export const SemanticElements: Story = {
  args: { padding: "lg" },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Card {...args} as="article">
        <h3 style={{ margin: "0 0 0.5rem 0" }}>Article Card</h3>
        <p style={{ margin: 0 }}>Rendered as <code>article</code> element.</p>
      </Card>
      <Card {...args} as="section">
        <h3 style={{ margin: "0 0 0.5rem 0" }}>Section Card</h3>
        <p style={{ margin: 0 }}>Rendered as <code>section</code> element.</p>
      </Card>
    </div>
  ),
};

export const CardWithPill: Story = {
  args: { padding: "md", tone: "default" },
  render: (args) => (
    <Card {...args} style={{ width: "280px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h4 style={{ margin: 0 }}>Status</h4>
        <Pill tone="success" size="sm">Active</Pill>
      </div>
      <p style={{ margin: 0, fontSize: "0.875rem" }}>Card with pill component inside.</p>
    </Card>
  ),
};

export const AllTonesAndPadding: Story = {
  render: () => {
    const tones: CardProps["tone"][] = ["default", "muted", "contrast"];
    const paddings: CardProps["padding"][] = ["none", "sm", "md", "lg"];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tones.map((tone) => (
          <div key={tone} style={{ display: "flex", gap: "0.5rem" }}>
            {paddings.map((padding) => (
              <Card key={`${tone}-${padding}`} tone={tone} padding={padding} style={{ width: "100px", minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "0.75rem" }}>{`${tone.padEnd(6)}${padding}`}</span>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
