import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef } from "react";
import { ForgotPasswordPage } from "./AuthPages";

const meta = {
  title: "Components/AuthPages/ForgotPasswordPage",
  component: ForgotPasswordPage,
  tags: ["autodocs"],
} satisfies Meta<typeof ForgotPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

function ForgotPasswordSentState() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const input = containerRef.current?.querySelector<HTMLInputElement>('input[type="email"]');
    const form = containerRef.current?.querySelector("form");
    if (!input || !form) return;

    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    valueSetter?.call(input, "person@example.com");
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const timeout = window.setTimeout(() => form.requestSubmit(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div ref={containerRef}>
      <ForgotPasswordPage onSubmit={() => {}} loading={false} />
    </div>
  );
}

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
  render: () => <ForgotPasswordSentState />,
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
