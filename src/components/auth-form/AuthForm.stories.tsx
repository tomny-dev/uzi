import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthPage } from "../auth-page/AuthPage";

function AuthDemo() {
  const [message, setMessage] = React.useState("");
  return (
    <>
      <AuthPage
        brand={<strong>Example App</strong>}
        onSignIn={async ({ email }) => { setMessage("Signed in as " + email); }}
        onSignUp={async ({ email }) => { setMessage("Account created for " + email); }}
      />
      {message && <output>{message}</output>}
    </>
  );
}
const meta = { title: "Templates/Auth Page", component: AuthDemo } satisfies Meta<typeof AuthDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};

function AdvancedAuthDemo() {
  return (
    <AuthPage
      brand={<strong>Trading Platform</strong>}
      signInIdentifier={{ type: "text", label: "Email or username", autoComplete: "username" }}
      signUpFields={[{ name: "username", label: "Username", required: true, maxLength: 100 }]}
      requirePasswordConfirmation={false}
      minSignInPasswordLength={8}
      onSignIn={async ({ identifier }) => { if (!identifier) throw new Error("Identifier required"); }}
      onSignUp={async ({ fields }) => { if (!fields?.username) throw new Error("Username required"); }}
    />
  );
}

/** Showcase optional fields while retaining the same all-in-one form. */
export const UsernameAndRegistrationFields: Story = { render: () => <AdvancedAuthDemo /> };
