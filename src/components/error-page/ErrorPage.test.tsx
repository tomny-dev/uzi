import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { ErrorPage, NotFoundPage, MaintenancePage } from "./ErrorPage";

vi.mock("./error-page.module.css", () => ({
  default: new Proxy({} as Record<string, string>, {
    get(_, key) {
      return `uzi-${String(key)}`;
    },
  }),
}));

describe("ErrorPage", () => {
  it("renders default 500 error", () => {
    render(<ErrorPage />);
    expect(screen.getByText("500")).toBeTruthy();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("renders custom status code", () => {
    render(<ErrorPage statusCode={502} message="Bad gateway" />);
    expect(screen.getByText("502")).toBeTruthy();
    expect(screen.getByText("Bad gateway")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    render(<ErrorPage subtitle="The server encountered an unexpected error." />);
    expect(screen.getByText("The server encountered an unexpected error.")).toBeTruthy();
  });

  it("does not render subtitle when omitted", () => {
    const { container } = render(<ErrorPage />);
    expect(container.querySelector(".uzi-subtitle")).toBeFalsy();
  });

  it("renders action when provided", () => {
    render(<ErrorPage action={<button>Go home</button>} />);
    expect(screen.getByText("Go home")).toBeTruthy();
  });

  it("does not render action when omitted", () => {
    const { container } = render(<ErrorPage />);
    expect(container.querySelector(".uzi-action")).toBeFalsy();
  });

  it("renders icon by default", () => {
    const { container } = render(<ErrorPage />);
    expect(container.querySelector(".uzi-icon")).toBeTruthy();
  });

  it("does not render icon when showIcon is false", () => {
    const { container } = render(<ErrorPage showIcon={false} />);
    expect(container.querySelector(".uzi-icon")).toBeFalsy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ErrorPage className="my-custom-error" />,
    );
    expect(container.querySelector(".my-custom-error")).toBeTruthy();
  });

  it("renders with ReactNode message", () => {
    render(<ErrorPage message={<strong>Custom error</strong>} />);
    expect(screen.getByText("Custom error")).toBeTruthy();
  });
});

describe("NotFoundPage", () => {
  it("renders 404 status", () => {
    render(<NotFoundPage />);
    expect(screen.getByText("404")).toBeTruthy();
    expect(screen.getByText("Page not found")).toBeTruthy();
    expect(screen.getByText(/doesn't exist/)).toBeTruthy();
  });

  it("renders action when provided", () => {
    render(<NotFoundPage action={<button>Go home</button>} />);
    expect(screen.getByText("Go home")).toBeTruthy();
  });

  it("renders with custom className", () => {
    const { container } = render(<NotFoundPage className="custom-class" />);
    expect(container.querySelector(".custom-class")).toBeTruthy();
  });
});

describe("MaintenancePage", () => {
  it("renders 503 status", () => {
    render(<MaintenancePage />);
    expect(screen.getByText("503")).toBeTruthy();
    expect(screen.getByText("Site under maintenance")).toBeTruthy();
    expect(screen.getByText(/scheduled maintenance/)).toBeTruthy();
  });

  it("renders action when provided", () => {
    render(<MaintenancePage action={<button>Check status</button>} />);
    expect(screen.getByText("Check status")).toBeTruthy();
  });

  it("renders with custom className", () => {
    const { container } = render(<MaintenancePage className="custom-class" />);
    expect(container.querySelector(".custom-class")).toBeTruthy();
  });
});
