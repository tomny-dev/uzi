import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { DataTable } from "./DataTable";

vi.mock("./data-table.module.css", () => ({
  default: new Proxy({} as Record<string, string>, {
    get(_, key) {
      return `uzi-${String(key)}`;
    },
  }),
}));

const mockData = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "admin" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "user" },
  { id: "3", name: "Charlie", email: "charlie@example.com", role: "user" },
];

const mockColumns = [
  { key: "name", label: "Name", accessor: (row: typeof mockData[0]) => row.name },
  { key: "email", label: "Email", accessor: (row: typeof mockData[0]) => row.email },
  { key: "role", label: "Role", accessor: (row: typeof mockData[0]) => row.role },
] as const;

describe("DataTable", () => {
  it("renders column headers", () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("Role")).toBeTruthy();
  });

  it("renders row data using accessors", () => {
    const { container } = render(<DataTable data={mockData} columns={mockColumns} />);
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("bob@example.com")).toBeTruthy();
    const cells = container.querySelectorAll(".uzi-cell");
    const cellTexts = Array.from(cells).map((c) => c.textContent);
    expect(cellTexts).toContain("admin");
    expect(cellTexts).toContain("user");
  });

  it("renders row data from raw keys when no accessor", () => {
    const cols = [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
    ] as const;
    render(<DataTable data={mockData} columns={cols} />);
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("admin")).toBeTruthy();
  });

  it("renders empty message when data is empty", () => {
    render(<DataTable data={[]} columns={mockColumns} />);
    expect(screen.getByText("No data found")).toBeTruthy();
  });

  it("renders custom empty message", () => {
    render(<DataTable data={[]} columns={mockColumns} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("uses the exact visible column count for empty rows", () => {
    const { container } = render(<DataTable data={[]} columns={mockColumns} />);
    const emptyCell = container.querySelector(".uzi-emptyCell") as HTMLTableCellElement;
    expect(emptyCell.colSpan).toBe(mockColumns.length);
  });

  it("renders loading skeleton", () => {
    const { container } = render(<DataTable data={mockData} columns={mockColumns} loading />);
    expect(container.querySelector(".uzi-loadingCell")).toBeTruthy();
    expect(container.querySelectorAll(".uzi-skeletonBar").length).toBeGreaterThan(0);
  });

  it("supports sortable columns with aria-sort on the column header", () => {
    const sortedCols = [
      { key: "name", label: "Name", sortable: true, accessor: (r: typeof mockData[0]) => r.name },
    ] as const;
    render(<DataTable data={mockData} columns={sortedCols} />);
    const header = screen.getByRole("columnheader", { name: /Name/ });
    expect(header.getAttribute("aria-sort")).toBe("none");
  });

  it("shows sort direction when sorted ascending", () => {
    const sortedCols = [
      { key: "name", label: "Name", sortable: true, accessor: (r: typeof mockData[0]) => r.name },
    ] as const;
    const { container } = render(<DataTable data={mockData} columns={sortedCols} />);
    const sortBtn = container.querySelector(".uzi-sortableHeader") as HTMLButtonElement;
    fireEvent.click(sortBtn);
    const header = screen.getByRole("columnheader", { name: /Name/ });
    expect(header.getAttribute("aria-sort")).toBe("ascending");
  });

  it("sorts by primitive accessor values when the column key is synthetic", () => {
    const syntheticData = [
      { id: "1", first: "Charlie", last: "Zulu" },
      { id: "2", first: "Alice", last: "Yankee" },
      { id: "3", first: "Bob", last: "Xray" },
    ];
    const columns = [
      {
        key: "displayName",
        label: "Display name",
        sortable: true,
        accessor: (row: typeof syntheticData[0]) => `${row.first} ${row.last}`,
      },
    ] as const;

    const { container } = render(<DataTable data={syntheticData} columns={columns} />);
    fireEvent.click(container.querySelector(".uzi-sortableHeader") as HTMLButtonElement);
    const rows = container.querySelectorAll(".uzi-tbody .uzi-row");
    const cellTexts = Array.from(rows).map((row) => row.querySelector(".uzi-cell")?.textContent);
    expect(cellTexts).toEqual(["Alice Yankee", "Bob Xray", "Charlie Zulu"]);
  });

  it("renders pagination when data exceeds page size", () => {
    const bigData = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: "user",
    }));
    const paginationColumns = [
      { key: "name", label: "Name", accessor: (r: typeof bigData[0]) => r.name },
      { key: "email", label: "Email", accessor: (r: typeof bigData[0]) => r.email },
    ] as const;
    render(
      <DataTable
        data={bigData}
        columns={paginationColumns}
        pageSize={10}
      />,
    );
    expect(screen.getByText(/Page \d+ of \d+/)).toBeTruthy();
  });

  it("does not render pagination when data fits in one page", () => {
    const { container } = render(
      <DataTable data={mockData} columns={mockColumns} pageSize={10} />,
    );
    expect(container.querySelector(".uzi-pagination")).toBeFalsy();
  });

  it("renders selectable rows with checkboxes", () => {
    const { container } = render(
      <DataTable data={mockData} columns={mockColumns} selectable />,
    );
    const checkboxes = container.querySelectorAll("input[type='checkbox']");
    expect(checkboxes.length).toBe(4);
  });

  it("renders row actions", () => {
    const actions = [
      { label: "Edit", onClick: () => {} },
      { label: "Delete", onClick: () => {} },
    ];
    const { container } = render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onRowAction={actions}
      />,
    );
    const editBtns = container.querySelectorAll(".uzi-actionBtn");
    const texts = Array.from(editBtns).map((b) => b.textContent);
    expect(texts).toContain("Edit");
    expect(texts).toContain("Delete");
  });

  it("applies custom className", () => {
    const { container } = render(
      <DataTable data={mockData} columns={mockColumns} className="my-custom-table" />,
    );
    expect(container.querySelector(".my-custom-table")).toBeTruthy();
  });

  it("uses custom rowKey extractor", () => {
    const customData = [
      { uid: "a1", name: "Alice" },
      { uid: "b2", name: "Bob" },
    ];
    const cols = [
      { key: "name", label: "Name", accessor: (r: { uid: string; name: string }) => r.name },
    ];
    const { container } = render(
      <DataTable data={customData} columns={cols} rowKey={(r) => (r as { uid: string }).uid} selectable />,
    );
    const checkboxes = container.querySelectorAll("input[type='checkbox']");
    expect(checkboxes.length).toBe(3);
  });

  it("sorts numeric values in correct ascending order", () => {
    const numericData = [
      { id: "1", value: 10 },
      { id: "2", value: 2 },
      { id: "3", value: 20 },
      { id: "4", value: 1 },
    ];
    const numericCols = [
      { key: "value", label: "Value", sortable: true, accessor: (r: typeof numericData[0]) => r.value },
    ] as const;
    const { container } = render(<DataTable data={numericData} columns={numericCols} />);
    const sortBtn = container.querySelector(".uzi-sortableHeader") as HTMLButtonElement;
    fireEvent.click(sortBtn);
    const rows = container.querySelectorAll(".uzi-tbody .uzi-row");
    const cellTexts = Array.from(rows).map((row) => row.querySelector(".uzi-cell")?.textContent);
    expect(cellTexts).toEqual(["1", "2", "10", "20"]);
  });

  it("sorts numeric values in correct descending order", () => {
    const numericData = [
      { id: "1", value: 10 },
      { id: "2", value: 2 },
      { id: "3", value: 20 },
      { id: "4", value: 1 },
    ];
    const numericCols = [
      { key: "value", label: "Value", sortable: true, accessor: (r: typeof numericData[0]) => r.value },
    ] as const;
    const { container } = render(<DataTable data={numericData} columns={numericCols} />);
    const sortBtn = container.querySelector(".uzi-sortableHeader") as HTMLButtonElement;
    fireEvent.click(sortBtn);
    fireEvent.click(sortBtn);
    const rows = container.querySelectorAll(".uzi-tbody .uzi-row");
    const cellTexts = Array.from(rows).map((row) => row.querySelector(".uzi-cell")?.textContent);
    expect(cellTexts).toEqual(["20", "10", "2", "1"]);
  });
});
