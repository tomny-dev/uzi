import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthCard } from "../auth-card/AuthCard";
import { AuthField, AuthForm, AuthModeSwitch, type AuthMode } from "./AuthForm";

function AuthDemo() {
  const [mode, setMode] = React.useState<AuthMode>("signin");
  return (
    <AuthCard title={mode === "signin" ? "Welcome back" : "Create your account"} subtitle="A shared, application-neutral authentication pattern">
      <AuthModeSwitch mode={mode} onModeChange={setMode} />
      <AuthForm onSubmit={(e) => e.preventDefault()}>
        <AuthField label="Email" htmlFor="demo-email"><input id="demo-email" type="email" autoComplete="email" placeholder="you@example.com" required /></AuthField>
        <AuthField label="Password" htmlFor="demo-password"><input id="demo-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required /></AuthField>
        <button type="submit">{mode === "signin" ? "Sign in" : "Create account"}</button>
      </AuthForm>
    </AuthCard>
  );
}

const meta = { title: "Templates/Auth Form", component: AuthDemo } satisfies Meta<typeof AuthDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
