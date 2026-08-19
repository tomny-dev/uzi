import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { EmptyStatePage } from "./EmptyStatePage";

vi.mock("./empty-state-page.module.css", () => ({
  default: new Proxy({} as Record<string, string>, {
    get(_, key) {
      return `uzi-${String(key)}`;
    },
  }),
}));

describe("EmptyStatePage", () => {
  it("renders default noData variant", () => {
    render(<EmptyStatePage />);
    expect(screen.getByText("No data yet")).toBeTruthy();
    expect(screen.getByText("When you add data, it will appear here.")).toBeTruthy();
  });

  it("renders noConnection variant", () => {
    render(<EmptyStatePage variant="noConnection" />);
    expect(screen.getByText("No connection")).toBeTruthy();
    expect(screen.getByText("Check your network settings and try again.")).toBeTruthy();
  });

  it("renders noPermissions variant", () => {
    render(<EmptyStatePage variant="noPermissions" />);
    expect(screen.getByText("Access denied")).toBeTruthy();
    expect(screen.getByText("You don't have permission to view this content.")).toBeTruthy();
  });

  it("renders custom title", () => {
    render(<EmptyStatePage title="Custom title" />);
    expect(screen.getByText("Custom title")).toBeTruthy();
  });

  it("renders custom description", () => {
    render(<EmptyStatePage description="Custom description" />);
    expect(screen.getByText("Custom description")).toBeTruthy();
  });

  it("renders primary action", () => {
    render(<EmptyStatePage primaryAction={<button>Create</button>} />);
    expect(screen.getByText("Create")).toBeTruthy();
  });

  it("renders secondary action", () => {
    render(<EmptyStatePage secondaryAction={<button>Learn more</button>} />);
    expect(screen.getByText("Learn more")).toBeTruthy();
  });

  it("renders both actions", () => {
    render(
      <EmptyStatePage
        primaryAction={<button>Primary</button>}
        secondaryAction={<button>Secondary</button>}
      />,
    );
    expect(screen.getByText("Primary")).toBeTruthy();
    expect(screen.getByText("Secondary")).toBeTruthy();
  });

  it("does not render actions area when no actions provided", () => {
    const { container } = render(<EmptyStatePage />);
    expect(container.querySelector(".uzi-actions")).toBeFalsy();
  });

  it("renders custom icon", () => {
    render(<EmptyStatePage icon={<svg data-testid="custom-icon" />} />);
    expect(screen.getByTestId("custom-icon")).toBeTruthy();
  });

  it("does not render custom icon when variant icon used", () => {
    const { container } = render(<EmptyStatePage />);
    expect(container.querySelector("[data-testid='custom-icon']")).toBeFalsy();
    expect(container.querySelector(".uzi-iconSvg")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyStatePage className="my-custom-class" />,
    );
    expect(container.querySelector(".my-custom-class")).toBeTruthy();
  });

  it("renders card wrapper", () => {
    const { container } = render(<EmptyStatePage />);
    expect(container.querySelector(".uzi-card")).toBeTruthy();
  });

  it("renders heading level 2", () => {
    const { container } = render(<EmptyStatePage />);
    expect(container.querySelector(".uzi-card h2")).toBeTruthy();
  });
});
