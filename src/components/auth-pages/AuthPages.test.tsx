import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { SignInPage, SignUpPage, ForgotPasswordPage } from "./AuthPages";

vi.mock("./auth-pages.module.css", () => ({
  default: {
    authLayout: "uzi-authLayout",
    authCard: "uzi-authCard",
    authBrand: "uzi-authBrand",
    authHeader: "uzi-authHeader",
    authTitle: "uzi-authTitle",
    authSubtitle: "uzi-authSubtitle",
    authForm: "uzi-authForm",
    field: "uzi-field",
    label: "uzi-label",
    input: "uzi-input",
    error: "uzi-error",
    passwordWrapper: "uzi-passwordWrapper",
    toggle: "uzi-toggle",
    eyeIcon: "uzi-eyeIcon",
    checkboxRow: "uzi-checkboxRow",
    checkboxLabel: "uzi-checkboxLabel",
    checkbox: "uzi-checkbox",
    forgotLink: "uzi-forgotLink",
    submitButton: "uzi-submitButton",
    spinner: "uzi-spinner",
    divider: "uzi-divider",
    authFooter: "uzi-authFooter",
    sentMessage: "uzi-sentMessage",
    sentText: "uzi-sentText",
    backLink: "uzi-backLink",
  },
}));

// ── Helpers ──
const signInFooter = <a href="/signup">Sign up</a>;
const signUpFooter = <a href="/signin">Sign in</a>;
const forgotFooter = <a href="/signin">Sign in</a>;

// Query by full label text as rendered
const getEmailInput = () => screen.getByLabelText("Email address");
const getPasswordInput = () => screen.getByLabelText("Password");
const getPasswordInputs = () => screen.getAllByLabelText("Password");

const getSubmitButton = () => screen.getByRole("button", { name: /Sign in|Create account|Send reset link|Signing in|Sending|Reset now/i });
const findEyeToggle = () => screen.getByRole("button", { name: /Show|Hide password/i });

describe("SignInPage", () => {
  it("renders title and subtitle", () => {
    render(<SignInPage title="Sign in" subtitle="Welcome back" footer={signInFooter} />);
    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeTruthy();
    expect(screen.getByText("Welcome back")).toBeTruthy();
  });

  it("renders email and password fields", () => {
    render(<SignInPage title="Sign in" footer={signInFooter} />);
    expect(getEmailInput()).toBeTruthy();
    expect(getPasswordInput()).toBeTruthy();
  });

  it("renders remember me checkbox and forgot password link", () => {
    render(<SignInPage title="Sign in" footer={signInFooter} forgotLinkHref="/forgot" />);
    expect(screen.getByLabelText("Remember me")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Forgot password?" }).getAttribute("href")).toBe("/forgot");
  });

  it("calls onSubmit with correct data on valid submit", () => {
    const handleSubmit = vi.fn();
    render(
      <SignInPage
        title="Sign in"
        footer={signInFooter}
        onSubmit={handleSubmit}
      />,
    );
    fireEvent.change(getEmailInput(), { target: { value: "user@test.com" } });
    fireEvent.change(getPasswordInput(), { target: { value: "password123" } });
    fireEvent.click(getSubmitButton());
    expect(handleSubmit).toHaveBeenCalledWith({ email: "user@test.com", password: "password123", rememberMe: false });
  });

  it("shows validation error for empty email", () => {
    render(<SignInPage title="Sign in" footer={signInFooter} />);
    fireEvent.click(getSubmitButton());
    expect(screen.getByText("Email is required")).toBeTruthy();
  });

  it("shows validation error for invalid email", () => {
    render(<SignInPage title="Sign in" footer={signInFooter} />);
    fireEvent.change(getEmailInput(), { target: { value: "not-an-email" } });
    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);
    expect(screen.getByText("Enter a valid email")).toBeTruthy();
    expect(screen.getByText("Password is required")).toBeTruthy();
  });

  it("shows validation error for empty password", () => {
    render(<SignInPage title="Sign in" footer={signInFooter} />);
    fireEvent.change(getEmailInput(), { target: { value: "user@test.com" } });
    fireEvent.click(getSubmitButton());
    expect(screen.getByText("Password is required")).toBeTruthy();
  });

  it("toggles password visibility", () => {
    render(<SignInPage title="Sign in" footer={signInFooter} />);
    const passwordInput = getPasswordInput();
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(findEyeToggle());
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(findEyeToggle());
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows loading state", () => {
    render(<SignInPage title="Sign in" footer={signInFooter} loading />);
    const button = getSubmitButton();
    expect(button).toBeDisabled();
    expect(screen.getByText("Signing in...")).toBeTruthy();
  });

  it("shows footer", () => {
    render(<SignInPage title="Sign in" footer={<a href="/signup">No account? Sign up</a>} />);
    expect(screen.getByRole("link", { name: "No account? Sign up" })).toBeTruthy();
  });

  it("renders custom brand", () => {
    render(
      <SignInPage
        title="Sign in"
        brand={<svg data-testid="brand" />}
        footer={signInFooter}
      />,
    );
    expect(screen.getByTestId("brand")).toBeTruthy();
  });

  it("auto-focuses the email field", () => {
    render(<SignInPage title="Sign in" footer={signInFooter} />);
    expect(document.activeElement).toHaveAttribute("type", "email");
  });
});

describe("SignUpPage", () => {
  it("renders title", () => {
    render(<SignUpPage title="Create an account" footer={signUpFooter} />);
    expect(screen.getByRole("heading", { level: 1, name: "Create an account" })).toBeTruthy();
  });

  it("renders email, password, and confirm password fields", () => {
    render(<SignUpPage title="Sign up" footer={signUpFooter} />);
    expect(getEmailInput()).toBeTruthy();
    expect(getPasswordInputs().length).toBe(2);
  });

  it("shows password length validation error", () => {
    render(<SignUpPage title="Sign up" footer={signUpFooter} checkboxLabel="I agree" />);
    fireEvent.change(getEmailInput(), { target: { value: "user@test.com" } });
    fireEvent.change(getPasswordInputs()[0], { target: { value: "short" } });
    fireEvent.change(getPasswordInputs()[1], { target: { value: "short" } });
    fireEvent.click(screen.getByLabelText("I agree"));
    fireEvent.click(getSubmitButton());
    expect(screen.getByText("At least 8 characters")).toBeTruthy();
  });

  it("shows password mismatch error", () => {
    render(<SignUpPage title="Sign up" footer={signUpFooter} checkboxLabel="I agree" />);
    fireEvent.change(getEmailInput(), { target: { value: "user@test.com" } });
    fireEvent.change(getPasswordInputs()[0], { target: { value: "password123" } });
    fireEvent.change(getPasswordInputs()[1], { target: { value: "different" } });
    fireEvent.click(screen.getByLabelText("I agree"));
    fireEvent.click(getSubmitButton());
    expect(screen.getByText("Passwords do not match")).toBeTruthy();
  });

  it("shows checkbox agreement error", () => {
    render(<SignUpPage title="Sign up" footer={signUpFooter} checkboxLabel="I agree to the Terms" />);
    fireEvent.click(getSubmitButton());
    expect(screen.getByText("You must agree to continue")).toBeTruthy();
  });

  it("calls onSubmit with correct data on valid submit", () => {
    const handleSubmit = vi.fn();
    render(
      <SignUpPage
        title="Sign up"
        footer={signUpFooter}
        checkboxLabel="I agree"
        onSubmit={handleSubmit}
      />,
    );
    fireEvent.change(getEmailInput(), { target: { value: "user@test.com" } });
    fireEvent.change(getPasswordInputs()[0], { target: { value: "password123456" } });
    fireEvent.change(getPasswordInputs()[1], { target: { value: "password123456" } });
    fireEvent.click(screen.getByLabelText("I agree"));
    fireEvent.click(getSubmitButton());
    expect(handleSubmit).toHaveBeenCalledWith({ email: "user@test.com", password: "password123456", agreed: true });
  });

  it("renders checkbox link when provided", () => {
    render(
      <SignUpPage
        title="Sign up"
        footer={signUpFooter}
        checkboxLabel="I agree to the Terms"
        checkboxLinkText="Terms of Service"
        checkboxLinkHref="/terms"
      />,
    );
    expect(screen.getByRole("link", { name: "Terms of Service" }).getAttribute("href")).toBe("/terms");
  });
});

describe("ForgotPasswordPage", () => {
  it("renders title and subtitle", () => {
    render(<ForgotPasswordPage title="Reset password" footer={forgotFooter} />);
    expect(screen.getByRole("heading", { level: 1, name: "Reset password" })).toBeTruthy();
    expect(screen.getByText(/Enter your email/i)).toBeTruthy();
  });

  it("calls onSubmit on valid email", () => {
    const handleSubmit = vi.fn();
    render(<ForgotPasswordPage title="Reset password" footer={forgotFooter} onSubmit={handleSubmit} />);
    fireEvent.change(getEmailInput(), { target: { value: "user@test.com" } });
    fireEvent.click(getSubmitButton());
    expect(handleSubmit).toHaveBeenCalledWith({ email: "user@test.com" });
  });

  it("shows success state after submit", async () => {
    render(<ForgotPasswordPage title="Reset password" footer={forgotFooter} onSubmit={() => {}} />);
    fireEvent.change(getEmailInput(), { target: { value: "user@test.com" } });
    fireEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByText(/If an account exists/i)).toBeTruthy();
    });
    expect(screen.getByText("user@test.com")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to sign in" }).getAttribute("href")).toBe("/signin");
  });

  it("shows error for empty email", () => {
    render(<ForgotPasswordPage title="Reset password" footer={forgotFooter} />);
    fireEvent.click(getSubmitButton());
    expect(screen.getByText("Email is required")).toBeTruthy();
  });

  it("shows error for invalid email", async () => {
    render(<ForgotPasswordPage title="Reset password" footer={forgotFooter} />);
    fireEvent.change(getEmailInput(), { target: { value: "invalid" } });
    fireEvent.click(getSubmitButton());
    ;
  });

  it("shows loading state", () => {
    render(<ForgotPasswordPage title="Reset password" footer={forgotFooter} loading />);
    const button = getSubmitButton();
    expect(button).toBeDisabled();
    expect(screen.getByText("Sending...")).toBeTruthy();
  });

  it("renders custom back link in success state", () => {
    render(<ForgotPasswordPage title="Reset password" footer={forgotFooter} backLinkText="← Back to login" backLinkHref="/login" />);
    fireEvent.change(getEmailInput(), { target: { value: "user@test.com" } });
    fireEvent.click(getSubmitButton());
    expect(screen.getByRole("link", { name: "← Back to login" }).getAttribute("href")).toBe("/login");
  });

  it("renders custom button text", () => {
    render(<ForgotPasswordPage title="Reset password" footer={forgotFooter} buttonText="Reset now" />);
    expect(getSubmitButton()).toHaveTextContent("Reset now");
  });
});
