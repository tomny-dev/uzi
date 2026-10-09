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

  it("stages bulk actions until Apply and preserves the applied trigger label", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} value={["alpha"]} onChange={onChange}
      bulkActions draftMode minSelected={1}
      formatValue={(selected) => `${selected.length} applied`} />);
    openMenu();
    fireEvent.click(screen.getByText("Clear enabled"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("1 applied")).toBeTruthy();
    expect((screen.getByText("Apply") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByText("Select all"));
    fireEvent.click(screen.getByText("Apply"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(["alpha", "beta"]);
  });

  it("cancels an unfinished draft without changing applied values", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} value={["alpha"]} onChange={onChange}
      bulkActions draftMode minSelected={1} />);
    openMenu();
    fireEvent.click(screen.getByText("Clear enabled"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(onChange).not.toHaveBeenCalled();
    openMenu();
    expect(screen.getByText("Clear enabled")).toBeTruthy();
    expect(screen.getByRole("menuitemcheckbox", { name: "Alpha" }).getAttribute("aria-checked")).toBe("true");
  });

  it("rejects removing the last selection in immediate mode", () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} value={["alpha"]} onChange={onChange} minSelected={1} />);
    openMenu();
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Alpha" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens a fresh draft after the parent replaces the applied value", () => {
    const onChange = vi.fn();
    const view = render(<MultiSelect options={options} value={["alpha"]} onChange={onChange}
      draftMode bulkActions minSelected={1} />);
    view.rerender(<MultiSelect options={options} value={["beta"]} onChange={onChange}
      draftMode bulkActions minSelected={1} />);
    openMenu();
    expect(screen.getByRole("menuitemcheckbox", { name: "Beta" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("menuitemcheckbox", { name: "Alpha" }).getAttribute("aria-checked")).toBe("false");
    fireEvent.click(screen.getByText("Cancel"));
    expect(onChange).not.toHaveBeenCalled();
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
