import type { Meta, StoryObj } from "@storybook/react";
import { AuthCard } from "./AuthCard";
import type { AuthCardProps } from "./AuthCard";
import { Button } from "../button/Button";
import { Input } from "../input/Input";
import { Label } from "../label/Label";

const meta = {
  title: "Components/AuthCard",
  component: AuthCard,
  tags: ["autodocs"],
} satisfies Meta<AuthCardProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultSignIn: Story = {
  render: () => (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back, please enter your details"
      footer={
        <span>
          Don't have an account?{" "}
          <a href="/signup" style={{ color: "var(--primary)" }}>Sign up</a>
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <Button type="button">Sign in</Button>
      </div>
    </AuthCard>
  ),
};

export const WithBrand: Story = {
  render: () => (
    <AuthCard
      brand={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span style={{ fontWeight: 700 }}>MyApp</span>
        </div>
      }
      title="Create an account"
      subtitle="Start your 30-day free trial"
      footer={
        <span>
          Already have an account?{" "}
          <a href="/signin" style={{ color: "var(--primary)" }}>Sign in</a>
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Input placeholder="Full name" />
        <Input type="email" placeholder="you@example.com" />
        <Input type="password" placeholder="••••••••" />
        <Button type="button">Create account</Button>
      </div>
    </AuthCard>
  ),
};

export const ResetPassword: Story = {
  render: () => (
    <AuthCard
      title="Reset password"
      subtitle="Enter your email to receive a reset link"
      footer={
        <a href="/signin" style={{ color: "var(--primary)" }}>
          Back to sign in
        </a>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Input type="email" placeholder="you@example.com" />
        <Button type="button">Send reset link</Button>
      </div>
    </AuthCard>
  ),
};

export const NoFooter: Story = {
  render: () => (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Input type="email" placeholder="you@example.com" />
        <Input type="password" placeholder="••••••••" />
        <Button type="button">Sign in</Button>
      </div>
    </AuthCard>
  ),
};

export const CustomClassName: Story = {
  render: () => (
    <AuthCard
      title="Custom auth"
      subtitle="With custom styling"
      className="storybook-auth-card"
      footer={<span>Custom footer</span>}
    >
      <Input placeholder="Username" />
      <Input type="password" placeholder="••••••••" />
      <Button type="button">Submit</Button>
    </AuthCard>
  ),
};
