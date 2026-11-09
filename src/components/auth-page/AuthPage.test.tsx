import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthPage } from "./AuthPage";

describe("AuthPage", () => {
  it("submits normalized credentials and shows client-side validation", async () => {
    const onSignIn = vi.fn().mockResolvedValue(undefined);
    render(<AuthPage onSignIn={onSignIn} />);
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i, hidden: false }));
    expect(screen.getByText("Email is required")).toBeTruthy();
    expect(onSignIn).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "  user@example.com  " } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i, hidden: false }));
    await waitFor(() => expect(onSignIn).toHaveBeenCalledWith({ email: "user@example.com", password: "secret" }));
  });

  it("requires confirmed signup passwords and optional terms when configured", async () => {
    const onSignUp = vi.fn().mockResolvedValue(undefined);
    render(<AuthPage defaultMode="signup" onSignUp={onSignUp} signUpOptions={{ requireTerms: true }} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "longpassword" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "mismatch" } });
    fireEvent.click(screen.getByRole("button", { name: /^create account$/i }));
    expect(screen.getByText("Passwords do not match")).toBeTruthy();
    expect(onSignUp).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "longpassword" } });
    fireEvent.click(screen.getByRole("button", { name: /^create account$/i }));
    expect(screen.getByText("Accept the terms to continue")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /^create account$/i }));
    await waitFor(() => expect(onSignUp).toHaveBeenCalledWith({ email: "user@example.com", password: "longpassword" }));
  });

  it("handles rejected auth requests and supports password visibility", async () => {
    const onSignIn = vi.fn().mockRejectedValue(new Error("Incorrect credentials"));
    const onError = vi.fn();
    render(<AuthPage onSignIn={onSignIn} onError={onError} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect((screen.getByLabelText("Password") as HTMLInputElement).type).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Incorrect credentials"));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("explains unavailable account actions rather than displaying a silent disabled form", () => {
    const { rerender } = render(<AuthPage defaultMode="signup" />);
    expect(screen.getByRole("status").textContent).toBe("Sign-up is not available.");
    expect((screen.getByRole("button", { name: "Create account" }) as HTMLButtonElement).disabled).toBe(true);

    rerender(<AuthPage mode="signin" />);
    expect(screen.getByRole("status").textContent).toBe("Sign-in is not available.");
    expect((screen.getByRole("button", { name: "Sign in" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("respects controlled navigation without assuming a router", () => {
    const onModeChange = vi.fn();
    render(<AuthPage mode="signin" onModeChange={onModeChange} onSignIn={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(onModeChange).toHaveBeenCalledWith("signup");
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy();
  });
  it("supports a username sign-in identifier without email validation", async () => {
    const onSignIn = vi.fn().mockResolvedValue(undefined);
    render(<AuthPage onSignIn={onSignIn}
      signInIdentifier={{ type: "text", label: "Email or username", placeholder: "Your account" }}
      minSignInPasswordLength={8} />);
    fireEvent.change(screen.getByLabelText("Email or username"), { target: { value: "  trader42  " } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "securepassword" } });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    await waitFor(() => expect(onSignIn).toHaveBeenCalledWith(expect.objectContaining({
      email: "trader42", identifier: "trader42", password: "securepassword",
    })));
  });

  it("collects configurable signup fields without mandatory password confirmation", async () => {
    const onSignUp = vi.fn().mockResolvedValue(undefined);
    render(<AuthPage defaultMode="signup" onSignUp={onSignUp} requirePasswordConfirmation={false}
      signUpFields={[{ name: "username", label: "Username", required: true, maxLength: 100 }]} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "securepassword" } });
    fireEvent.click(screen.getByRole("button", { name: /^create account$/i }));
    expect(screen.getByRole("alert").textContent).toContain("Username is required");
    expect(screen.queryByLabelText("Confirm password")).toBeNull();
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.click(screen.getByRole("button", { name: /^create account$/i }));
    await waitFor(() => expect(onSignUp).toHaveBeenCalledWith(expect.objectContaining({
      email: "user@example.com", fields: { username: "testuser" },
    })));
  });

  it("shows an external session verification error", () => {
    render(<AuthPage initialError="Session verification failed" onSignIn={vi.fn()} />);
    expect(screen.getByRole("alert").textContent).toBe("Session verification failed");
  });

  it("validates required identifiers using the displayed field label", () => {
    render(<AuthPage onSignIn={vi.fn()} signInIdentifier={{ label: "Email or username", type: "text" }} />);
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    expect(screen.getByRole("alert").textContent).toBe("Email or username is required");
  });

  it("does not submit values from removed conditional signup fields", async () => {
    const onSignUp = vi.fn().mockResolvedValue(undefined);
    const props = {
      defaultMode: "signup" as const,
      onSignUp,
      requirePasswordConfirmation: false,
    };
    const { rerender } = render(<AuthPage {...props}
      signUpFields={[{ name: "username", label: "Username" }]} />);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "oldusername" } });
    rerender(<AuthPage {...props} signUpFields={[]} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /^create account$/i }));
    await waitFor(() => expect(onSignUp).toHaveBeenCalledWith({ email: "person@example.com", password: "password123" }));
  });

  it("allows empty optional signup inputs with minimum length", async () => {
    const onSignUp = vi.fn().mockResolvedValue(undefined);
    render(<AuthPage defaultMode="signup" onSignUp={onSignUp}
      requirePasswordConfirmation={false}
      signUpFields={[{ name: "nickname", label: "Nickname", minLength: 3 }]} />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /^create account$/i }));
    await waitFor(() => expect(onSignUp).toHaveBeenCalledWith(expect.objectContaining({ fields: { nickname: "" } })));
  });

});
