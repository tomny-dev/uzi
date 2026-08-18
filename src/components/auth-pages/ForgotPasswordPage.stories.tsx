import type { Meta, StoryObj } from "@storybook/react";
import { ForgotPasswordPage } from "./AuthPages";

const meta = {
  title: "Components/AuthPages/ForgotPasswordPage",
  component: ForgotPasswordPage,
  tags: ["autodocs"],
} satisfies Meta<typeof ForgotPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ForgotPasswordPage />,
};

export const WithBrand: Story = {
  render: () => (
    <ForgotPasswordPage
      brand={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
          </svg>
          <span style={{ fontWeight: 700 }}>MyApp</span>
        </div>
      }
      footer={<a href="/signin" style={{ color: "var(--primary)" }}>Back to sign in</a>}
    />
  ),
};

export const CustomText: Story = {
  render: () => (
    <ForgotPasswordPage
      title="Reset your password"
      subtitle="We'll send you a link to reset it"
      buttonText="Send me a reset link"
      backLinkText="← Back to login"
      backLinkHref="/signin"
    />
  ),
};

export const SentState: Story = {
  render: () => {
    const { useState, useEffect } = require("react");
    const [sent, setSent] = useState(false);
    useEffect(() => { setSent(true); }, []);
    return (
      <ForgotPasswordPage
        onSubmit={() => {}}
        loading={false}
      />
    );
  },
};

export const LoadingState: Story = {
  render: () => (
    <ForgotPasswordPage
      onSubmit={() => {}}
      loading
    />
  ),
};

export const WithFooter: Story = {
  render: () => (
    <ForgotPasswordPage
      footer={
        <span>
          Remember your password?{" "}
          <a href="/signin" style={{ color: "var(--primary)" }}>Sign in</a>
        </span>
      }
    />
  ),
};

export const Minimal: Story = {
  render: () => (
    <ForgotPasswordPage
      title="Forgot password?"
      subtitle="Enter your email address"
    />
  ),
};
