import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AuthField, AuthForm, AuthModeSwitch } from "./AuthForm";

describe("shared auth components", () => {
  it("switches modes without submitting its parent form", () => {
    const onModeChange = vi.fn();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<AuthForm onSubmit={onSubmit}><AuthModeSwitch mode="signin" onModeChange={onModeChange} /><button type="submit">Continue</button></AuthForm>);
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(onModeChange).toHaveBeenCalledWith("signup");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sign in" }).getAttribute("aria-pressed")).toBe("true");
  });
  it("labels its fields and exposes inline errors", () => {
    render(<AuthField label="Email" htmlFor="email" error="Email is required"><input id="email" aria-describedby="email-error" aria-invalid="true" /></AuthField>);
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Email is required");
  });
});
