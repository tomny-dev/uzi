import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

function openMenu() {
  const trigger = screen.getByRole("button");
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
}
import { MultiSelect } from "./MultiSelect";

vi.mock("./multi-select.module.css", () => ({
  default: new Proxy({}, { get: (_target, property) => String(property) }),
}));

const options = [
  { label: "Alpha", value: "alpha" },
  { label: "Beta", value: "beta" },
  { label: "Required", value: "required", disabled: true },
];

describe("MultiSelect", () => {
  it("lets formatValue describe an empty selection", () => {
    render(
      <MultiSelect
        options={options}
        value={[]}
        onChange={() => {}}
        formatValue={(selected) => selected.length === 0 ? "None selected" : `${selected.length} selected`}
      />,
    );
    expect(screen.getByText("None selected")).toBeTruthy();
  });

  it("selects all enabled options without adding disabled options", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} value={[]} onChange={onChange} bulkActions />);
    openMenu();
    fireEvent.click(screen.getByText("Select all"));
    expect(onChange).toHaveBeenCalledWith(["alpha", "beta"]);
  });

  it("preserves existing selection order when selecting all", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} value={["beta"]} onChange={onChange} bulkActions />);
    openMenu();
    fireEvent.click(screen.getByText("Select all"));
    expect(onChange).toHaveBeenCalledWith(["beta", "alpha"]);
  });

  it("clears enabled selections while preserving disabled selected values", () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        value={["alpha", "required"]}
        onChange={onChange}
        bulkActions
      />,
    );
    openMenu();
    expect(screen.getByText("Clear enabled")).toBeTruthy();
    fireEvent.click(screen.getByText("Clear enabled"));
    expect(onChange).toHaveBeenCalledWith(["required"]);
  });
});
