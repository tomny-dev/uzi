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

  it("respects controlled navigation without assuming a router", () => {
    const onModeChange = vi.fn();
    render(<AuthPage mode="signin" onModeChange={onModeChange} onSignIn={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(onModeChange).toHaveBeenCalledWith("signup");
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeTruthy();
  });
});
