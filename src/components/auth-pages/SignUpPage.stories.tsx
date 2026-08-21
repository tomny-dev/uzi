import type { Meta, StoryObj } from "@storybook/react";
import { SignUpPage } from "./AuthPages";

const meta = {
  title: "Components/AuthPages/SignUpPage",
  component: SignUpPage,
  tags: ["autodocs"],
} satisfies Meta<typeof SignUpPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SignUpPage />,
};

export const WithSubtitle: Story = {
  render: () => (
    <SignUpPage
      subtitle="Start your 30-day free trial"
      footer={<span>Already have an account? <a href="/signin" style={{ color: "var(--primary)" }}>Sign in</a></span>}
    />
  ),
};

export const WithBrand: Story = {
  render: () => (
    <SignUpPage
      title="Create your account"
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

export const WithTermsCheckbox: Story = {
  render: () => (
    <SignUpPage
      checkboxLabel="I agree to the"
      checkboxLinkText="Terms of Service"
      checkboxLinkHref="/terms"
      footer={<span>Already have an account? <a href="/signin" style={{ color: "var(--primary)" }}>Sign in</a></span>}
    />
  ),
};

export const CustomPlaceholders: Story = {
  render: () => (
    <SignUpPage
      emailPlaceholder="Email address"
      passwordPlaceholder="Create a password"
      confirmPasswordPlaceholder="Confirm your password"
      checkboxLabel="I agree to the"
      checkboxLinkText="Privacy Policy"
      checkboxLinkHref="/privacy"
    />
  ),
};

export const LoadingState: Story = {
  render: () => (
    <SignUpPage
      onSubmit={() => {}}
      loading
    />
  ),
};

export const Minimal: Story = {
  render: () => (
    <SignUpPage
      title="Get started"
      subtitle="No credit card required"
    />
  ),
};
