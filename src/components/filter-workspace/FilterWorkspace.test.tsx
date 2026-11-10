import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FilterBar, FilterChips, FilterPopover } from "./FilterWorkspace";

describe("FilterBar", () => {
  it("groups search, leading selection and actions without requiring domain filter state", () => {
    render(<FilterBar leading={<button>Books</button>} search={<input aria-label="Find market" />}
      actions={<button>Sort</button>} activeFilters={<span>Active filter</span>} />);
    expect(screen.getByRole("button", { name: "Books" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Find market" })).toBeTruthy();
    expect(screen.getByText("Active filter")).toBeTruthy();
  });
});

describe("FilterChips", () => {
  it("removes a selected filter or clears all, while respecting disabled chips", () => {
    const remove = vi.fn();
    const clear = vi.fn();
    render(<FilterChips chips={[{ id: "history", label: "History ≥ 80%" }, {
      id: "locked", label: "Locked", disabled: true,
    }]} onRemove={remove} onClear={clear} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove History ≥ 80% filter" }));
    expect(remove).toHaveBeenCalledWith("history");
    expect(screen.getByRole("button", { name: "Remove Locked filter" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it("renders no empty chips or clear action", () => {
    const { container } = render(<FilterChips chips={[]} onRemove={vi.fn()} onClear={vi.fn()} />);
    expect(container.childElementCount).toBe(0);
  });
});

describe("FilterPopover", () => {
  it("opens the anchored editor, closes on Escape and restores focus", () => {
    render(<FilterPopover activeCount={2}><input aria-label="Minimum odds" /></FilterPopover>);
    const trigger = screen.getByRole("button", { name: "Filters (2)" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when clicking outside and supports a controlled open state", () => {
    const changed = vi.fn();
    const { rerender } = render(<><FilterPopover open={true} onOpenChange={changed}>
      <input aria-label="Minimum odds" /></FilterPopover><button>Outside</button></>);
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(changed).toHaveBeenCalledWith(false);
    rerender(<FilterPopover open={false} onOpenChange={changed}><input aria-label="Minimum odds" /></FilterPopover>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
