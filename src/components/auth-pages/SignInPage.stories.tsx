import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef } from "react";
import { SignInPage } from "./AuthPages";

const meta = {
  title: "Components/AuthPages/SignInPage",
  component: SignInPage,
  tags: ["autodocs"],
} satisfies Meta<typeof SignInPage>;

export default meta;
type Story = StoryObj<typeof meta>;

function SignInErrorState() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.querySelector("form")?.requestSubmit();
  }, []);

  return (
    <div ref={containerRef}>
      <SignInPage onSubmit={() => {}} loading={false} />
    </div>
  );
}

export const Default: Story = {
  render: () => <SignInPage />,
};

export const WithSubtitle: Story = {
  render: () => (
    <SignInPage
      subtitle="Enter your credentials to access your account"
      footer={<span>Don't have an account? <a href="/signup" style={{ color: "var(--primary)" }}>Sign up</a></span>}
    />
  ),
};

export const WithBrand: Story = {
  render: () => (
    <SignInPage
      title="Welcome back"
      subtitle="Sign in to your MyApp account"
      brand={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
          </svg>
          <span style={{ fontWeight: 700 }}>MyApp</span>
        </div>
      }
    />
  ),
};

export const CustomPlaceholders: Story = {
  render: () => (
    <SignInPage
      emailPlaceholder="Corporate email"
      passwordPlaceholder="Your password"
      forgotLinkHref="/forgot"
      forgotLinkText="Need help?"
    />
  ),
};

export const WithErrorState: Story = {
  render: () => <SignInErrorState />,
};

export const LoadingState: Story = {
  render: () => (
    <SignInPage
      onSubmit={() => {}}
      loading
    />
  ),
};

export const WithForgotLink: Story = {
  render: () => (
    <SignInPage
      forgotLinkText="Forgot your password?"
      forgotLinkHref="/forgot"
      footer={
        <span>
          Don't have an account?{" "}
          <a href="/signup" style={{ color: "var(--primary)" }}>Sign up</a>
        </span>
      }
    />
  ),
};
