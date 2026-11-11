import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchAutocomplete, type SearchAutocompleteProps, type SearchSuggestion } from "../../index";

const recommendations: SearchSuggestion[] = [
  { id: "a", label: "Minecraft", href: "/minecraft", group: "Games" },
  { id: "b", label: "Palworld", href: "/palworld", group: "Games" },
];

describe("SearchAutocomplete", () => {
  it("exposes the autocomplete and its props through the public package entrypoint", () => {
    const props: SearchAutocompleteProps = { recommendations };
    expect(typeof SearchAutocomplete).toBe("function");
    expect(props.recommendations).toBe(recommendations);
  });

  it("shows recommendations on focus and supports arrow-key navigation", () => {
    const navigate = vi.fn();
    render(<SearchAutocomplete aria-label="Search" recommendations={recommendations} onNavigate={navigate} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(screen.getByText("Minecraft")).toBeTruthy();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(navigate).toHaveBeenCalledWith(recommendations[0]);
  });

  it("filters local recommendations and handles free-text submission", () => {
    const onSearch = vi.fn();
    render(<SearchAutocomplete aria-label="Search" recommendations={recommendations} onSearch={onSearch} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "pal" } });
    expect(screen.getByText("Palworld")).toBeTruthy();
    expect(screen.queryByText("Minecraft")).toBeNull();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearch).toHaveBeenCalledWith("pal");
  });

  it("loads asynchronous results", async () => {
    const search = vi.fn(async () => [{ id: "c", label: "Crafting", href: "/crafting" }]);
    render(<SearchAutocomplete aria-label="Search" search={search} debounceMs={0} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "craft" } });
    await waitFor(() => expect(screen.getByText("Crafting")).toBeTruthy());
    expect(search).toHaveBeenCalledWith("craft", expect.any(AbortSignal));
  });

  it("closes on Escape", () => {
    render(<SearchAutocomplete aria-label="Search" recommendations={recommendations} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});
