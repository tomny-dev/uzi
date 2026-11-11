import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchAutocomplete, type SearchAutocompleteProps, type SearchSuggestion } from "../../index";
import { resolveSafeSuggestionHref } from "./SearchAutocomplete";

const recommendations: SearchSuggestion[] = [
  { id: "a", label: "Minecraft", href: "/minecraft", group: "Games" },
  { id: "b", label: "Palworld", href: "/palworld", group: "Games" },
];

describe("SearchAutocomplete", () => {
  it("rejects executable or invalid URL schemes while keeping normal navigation", () => {
    const base = "https://tultr.com/search?q=palworld";
    expect(resolveSafeSuggestionHref("/minecraft", base)).toBe("https://tultr.com/minecraft");
    expect(resolveSafeSuggestionHref("?q=crafting", base)).toBe("https://tultr.com/search?q=crafting");
    expect(resolveSafeSuggestionHref("https://example.com/guide", base)).toBe("https://example.com/guide");

    for (const href of [
      "javascript:alert(1)",
      "  JaVaScRiPt:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
      "http://[",
    ]) {
      expect(resolveSafeSuggestionHref(href, base)).toBeNull();
    }
  });

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

  it("does not display or navigate stale async suggestions after the query changes", async () => {
    const navigate = vi.fn();
    let finishSecond: ((items: readonly SearchSuggestion[]) => void) | undefined;
    const search = vi.fn((query: string): Promise<readonly SearchSuggestion[]> => {
      if (query === "mine") return Promise.resolve([recommendations[0]]);
      return new Promise((resolve) => { finishSecond = resolve; });
    });
    render(<SearchAutocomplete aria-label="Search" search={search} debounceMs={0} onNavigate={navigate} />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "mine" } });
    await waitFor(() => expect(screen.getByText("Minecraft")).toBeTruthy());

    fireEvent.change(input, { target: { value: "pal" } });
    expect(screen.queryByText("Minecraft")).toBeNull();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(navigate).not.toHaveBeenCalled();

    await waitFor(() => expect(search).toHaveBeenCalledWith("pal", expect.any(AbortSignal)));
    finishSecond?.([recommendations[1]]);
    await waitFor(() => expect(screen.getByText("Palworld")).toBeTruthy());
    expect(screen.queryByText("Minecraft")).toBeNull();
  });

  it("dismisses suggestions when tabbing away in either direction", () => {
    render(<SearchAutocomplete aria-label="Search" recommendations={recommendations} />);
    const input = screen.getByRole("combobox");
    for (const shiftKey of [false, true]) {
      fireEvent.focus(input);
      expect(input.getAttribute("aria-expanded")).toBe("true");
      const event = fireEvent.keyDown(input, { key: "Tab", shiftKey });
      expect(event).toBe(true);
      expect(input.getAttribute("aria-expanded")).toBe("false");
      expect(screen.queryByRole("listbox")).toBeNull();
    }
  });

  it("closes on Escape", () => {
    render(<SearchAutocomplete aria-label="Search" recommendations={recommendations} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});
