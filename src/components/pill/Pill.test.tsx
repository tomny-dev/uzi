import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Pill } from "./Pill";

vi.mock("./pill.module.css", () => ({
  default: new Proxy({}, { get: (_target, property) => String(property) }),
}));

describe("Pill", () => {
  it("renders a static, non-focusable label by default", () => {
    render(<Pill tone="success">Upcoming</Pill>);
    const label = screen.getByText("Upcoming");
    expect(label.closest("span.pill")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders an accessible button with a safe default type", () => {
    const onClick = vi.fn();
    render(<Pill as="button" aria-label="Filter by NCAAF" onClick={onClick}>NCAAF</Pill>);
    const button = screen.getByRole("button", { name: "Filter by NCAAF" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("interactive");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("supports explicit button types and prevents disabled interactions", () => {
    const onClick = vi.fn();
    render(<Pill as="button" type="submit" disabled onClick={onClick}>Disabled</Pill>);
    const button = screen.getByRole("button", { name: "Disabled" }) as HTMLButtonElement;
    expect(button.type).toBe("submit");
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
