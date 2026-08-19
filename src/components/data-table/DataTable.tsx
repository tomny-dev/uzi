"use client";

import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./data-table.module.css";

export type SortDirection = "asc" | "desc";

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export type DataTableRowAction = {
  label: string;
  onClick: (row: Record<string, unknown>) => void;
};

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: readonly Column<T>[];
  /** Array of action buttons to render per row */
  onRowAction?: DataTableRowAction[];
  /** Called when rows are selected; receives selected row IDs */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Whether the table is in a loading state */
  loading?: boolean;
  /** Message displayed when data is empty */
  emptyMessage?: string;
  /** Number of rows per page */
  pageSize?: number;
  /** Whether rows are selectable via checkbox */
  selectable?: boolean;
  /** Custom row key extractor (defaults to row.id) */
  rowKey?: (row: T) => string;
  /** Additional class name for the table wrapper */
  className?: string;
}

export function DataTable<T extends Record<string, unknown> = Record<string, unknown>>({
  data,
  columns,
  onRowAction,
  onSelectionChange,
  loading = false,
  emptyMessage = "No data found",
  pageSize = 10,
  selectable = false,
  rowKey = (row: T) => String(row.id ?? ""),
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDirection>("asc");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  const toggleAll = () => {
    const allKeys = displayedData.map((r) => rowKey(r));
    const allSelected = allKeys.every((k) => selected.has(k));
    const next = new Set(selected);
    if (allSelected) {
      allKeys.forEach((k) => next.delete(k));
    } else {
      allKeys.forEach((k) => next.add(k));
    }
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [data.length, page, totalPages]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const displayedData = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const displayedKeys = React.useMemo(() => displayedData.map(rowKey), [displayedData, rowKey]);
  const allPageSelected =
    displayedKeys.length > 0 && displayedKeys.every((k) => selected.has(k));
  const somePageSelected =
    displayedKeys.length > 0 && displayedKeys.some((k) => selected.has(k));

  return (
    <div className={cx(styles.wrapper, className)}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {selectable && (
                <th className={styles.headerCell} aria-label="Select all">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected && !allPageSelected;
                    }}
                    onChange={toggleAll}
                    className={styles.checkbox}
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cx(
                    styles.headerCell,
                    col.width && styles.headerCellFixed,
                    col.align && styles[`align${col.align.charAt(0).toUpperCase() + col.align.slice(1)}`],
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={cx(styles.sortableHeader, styles.clickableHeader)}
                      onClick={() => handleSort(col.key)}
                      aria-sort={
                        sortKey === col.key
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <span className={styles.headerLabel}>{col.label}</span>
                      <span className={styles.sortIcon} aria-hidden="true">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            "\u25B2"
                          ) : (
                            "\u25BC"
                          )
                        ) : (
                          "\u25B2\u25BC"
                        )}
                      </span>
                    </button>
                  ) : (
                    <span className={styles.headerLabel}>{col.label}</span>
                  )}
                </th>
              ))}
              {onRowAction && onRowAction.length > 0 && (
                <th className={styles.headerCell} style={{ width: "5rem" }}>
                  <span className={styles.headerLabel}>Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 2 : 1)}
                  className={styles.loadingCell}
                >
                  <div className={styles.loadingRow} aria-busy="true">
                    <div className={styles.skeletonBar} />
                    <div className={styles.skeletonBar} />
                    <div className={styles.skeletonBar} />
                  </div>
                  <div className={styles.loadingRow} aria-busy="true">
                    <div className={styles.skeletonBar} />
                    <div className={styles.skeletonBar} />
                    <div className={styles.skeletonBar} />
                  </div>
                  <div className={styles.loadingRow} aria-busy="true">
                    <div className={styles.skeletonBar} />
                    <div className={styles.skeletonBar} />
                    <div className={styles.skeletonBar} />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 2 : 1)} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayedData.map((row) => {
                const id = rowKey(row);
                return (
                  <tr key={id} className={cx(styles.row, selected.has(id) && styles.rowSelected)}>
                    {selectable && (
                      <td className={styles.cell}>
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => toggleRow(id)}
                          className={styles.checkbox}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={`${id}-${col.key}`}
                        className={cx(
                          styles.cell,
                          col.align && styles[`align${col.align.charAt(0).toUpperCase() + col.align.slice(1)}`],
                        )}
                      >
                        {col.accessor ? col.accessor(row) : String(row[col.key as keyof T] ?? "")}
                      </td>
                    ))}
                    {onRowAction && onRowAction.length > 0 && (
                      <td className={styles.cell}>
                        <div className={styles.rowActions}>
                          {onRowAction.map((action) => (
                            <button
                              key={action.label}
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => action.onClick(row)}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data.length > pageSize && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Page {safePage} of {totalPages}
          </span>
          <div className={styles.paginationButtons}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              &larr;
            </button>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
