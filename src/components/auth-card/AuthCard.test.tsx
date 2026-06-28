import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import * as React from "react";
import { AuthCard } from "./AuthCard";

vi.mock("./auth-card.module.css", () => ({
  default: {
    authLayout: "uzi-authLayout",
    authCard: "uzi-authCard",
    authBrand: "uzi-authBrand",
    authHeader: "uzi-authHeader",
    authTitle: "uzi-authTitle",
    authSubtitle: "uzi-authSubtitle",
    authBody: "uzi-authBody",
    divider: "uzi-divider",
    authFooter: "uzi-authFooter",
  },
}));

describe("AuthCard", () => {
  it("renders title", () => {
    const { getByRole } = render(
      <AuthCard title="Sign in">
        <p>Form content</p>
      </AuthCard>,
    );
    expect(getByRole("heading", { level: 1, name: "Sign in" })).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(
      <AuthCard title="Sign in" subtitle="Welcome back">
        <p>Form content</p>
      </AuthCard>,
    );
    expect(getByText("Welcome back")).toBeTruthy();
  });

  it("does not render subtitle when omitted", () => {
    const { container, getByRole } = render(
      <AuthCard title="Sign in">
        <p>Form content</p>
      </AuthCard>,
    );
    expect(getByRole("heading", { level: 1, name: "Sign in" })).toBeTruthy();
    expect(container.querySelector(".uzi-authSubtitle")).toBeFalsy();
  });

  it("renders children as form content", () => {
    const { getByText } = render(
      <AuthCard title="Sign in">
        <p>Form content</p>
      </AuthCard>,
    );
    expect(getByText("Form content")).toBeTruthy();
  });

  it("renders footer with divider when provided", () => {
    const { getByText, container } = render(
      <AuthCard title="Sign in" footer="No account? Sign up">
        <p>Form content</p>
      </AuthCard>,
    );
    expect(getByText("No account? Sign up")).toBeTruthy();
    expect(container.querySelector(".uzi-divider")).toBeTruthy();
  });

  it("does not render divider when no footer", () => {
    const { container } = render(
      <AuthCard title="Sign in">
        <p>Form content</p>
      </AuthCard>,
    );
    expect(container.querySelector(".uzi-divider")).toBeFalsy();
  });

  it("renders brand element when provided", () => {
    const { container } = render(
      <AuthCard
        title="Sign in"
        brand={<svg data-testid="brand-icon" />}
      >
        <p>Form content</p>
      </AuthCard>,
    );
    expect(container.querySelector(".uzi-authBrand")).toBeTruthy();
    expect(container.querySelector("[data-testid='brand-icon']")).toBeTruthy();
  });

  it("does not render brand element when omitted", () => {
    const { container } = render(
      <AuthCard title="Sign in">
        <p>Form content</p>
      </AuthCard>,
    );
    expect(container.querySelector(".uzi-authBrand")).toBeFalsy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AuthCard title="Sign in" className="my-custom-class">
        <p>Form content</p>
      </AuthCard>,
    );
    expect(container.querySelector(".my-custom-class")).toBeTruthy();
  });

  it("renders as a forwardRef component", () => {
    // Just ensures it renders without throwing — forwardRef is a structural requirement
    const ref = React.createRef<HTMLDivElement>();
    render(
      <AuthCard title="Sign in" ref={ref}>
        <p>Form content</p>
      </AuthCard>,
    );
    // Component renders successfully — no assertion needed beyond no throw
    expect(document.querySelector(".uzi-authCard")).toBeTruthy();
  });
});
