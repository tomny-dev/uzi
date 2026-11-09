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
