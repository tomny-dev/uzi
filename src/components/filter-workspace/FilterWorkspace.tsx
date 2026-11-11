"use client";

import * as React from "react";
import { Button } from "../button/Button";
import { cx } from "../../utils/cx";
import styles from "./filter-workspace.module.css";

/** Layout-only composition: the application owns filter definitions and evaluation. */
export type FilterBarProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Sport/books/scope selectors. */
  leading?: React.ReactNode;
  /** Search field expands to fill available space. */
  search?: React.ReactNode;
  /** Filter trigger, sort selector, and other trailing controls. */
  actions?: React.ReactNode;
  /** Optional active-filter chips rendered beneath the controls. */
  activeFilters?: React.ReactNode;
};

export function FilterBar({ leading, search, actions, activeFilters, className, children, ...rest }: FilterBarProps) {
  return <div className={cx(styles.bar, className)} {...rest}>
    {leading && <div className={styles.leading}>{leading}</div>}
    {search && <div className={styles.search}>{search}</div>}
    {actions && <div className={styles.actions}>{actions}</div>}
    {children}
    {activeFilters && <div className={styles.activeFilters}>{activeFilters}</div>}
  </div>;
}

export type FilterChip = {
  id: string;
  label: string;
  disabled?: boolean;
};

export type FilterChipsProps = {
  chips: readonly FilterChip[];
  onRemove: (id: string) => void;
  onClear?: () => void;
  clearLabel?: string;
  className?: string;
};

/** Only active filters produce chips, with individual and bulk removal. */
export function FilterChips({ chips, onRemove, onClear, clearLabel = "Clear all", className }: FilterChipsProps) {
  if (chips.length === 0) return null;
  return <div className={cx(styles.chips, className)} aria-label="Active filters">
    {chips.map(chip => <button type="button" key={chip.id}
      className={styles.chip} disabled={chip.disabled}
      aria-label={`Remove ${chip.label} filter`}
      onClick={() => onRemove(chip.id)}>
      <span>{chip.label}</span><span aria-hidden="true">×</span>
    </button>)}
    {onClear && <Button size="sm" variant="ghost" onClick={onClear}>{clearLabel}</Button>}
  </div>;
}

export type FilterPopoverProps = {
  children: React.ReactNode;
  label?: string;
  activeCount?: number;
  /** Use if a form contains invalid values; closing remains possible via Escape/outside click. */
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  className?: string;
  panelClassName?: string;
};

/** Anchored non-modal filter editor. Inputs stay mounted while open and do not affect layout. */
export function FilterPopover({
  children, label = "Filters", activeCount = 0, open, onOpenChange,
  className, panelClassName,
}: FilterPopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const panelId = React.useId();
  const [panelLeft, setPanelLeft] = React.useState<number | null>(null);

  const setOpen = React.useCallback((next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [open, onOpenChange]);

  React.useLayoutEffect(() => {
    if (!isOpen) {
      setPanelLeft(null);
      return;
    }
    // Position the non-modal overlay inside the viewport, even when its
    // trigger sits at the far left or right of a wrapping toolbar.
    const position = () => {
      if (!rootRef.current || !panelRef.current) return;
      const root = rootRef.current.getBoundingClientRect();
      const panel = panelRef.current.getBoundingClientRect();
      const gutter = 16;
      const width = panel.width;
      const preferredLeft = root.right - width;
      const viewportLeft = Math.max(gutter, Math.min(preferredLeft, window.innerWidth - width - gutter));
      setPanelLeft(viewportLeft - root.left);
    };
    position();
    window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    // Open the editor at its first actionable field instead of leaving keyboard
    // focus on the trigger behind a non-modal dialog.
    panelRef.current?.querySelector<HTMLElement>(
      'input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex="0"]',
    )?.focus();
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, setOpen]);

  return <div ref={rootRef} className={cx(styles.popoverRoot, className)}>
    <Button variant="outline" size="sm"
      aria-expanded={isOpen} aria-controls={panelId} aria-haspopup="dialog"
      onClick={() => setOpen(!isOpen)}>
      {label}{activeCount > 0 ? ` (${activeCount})` : ""}
    </Button>
    {isOpen && <div ref={panelRef} id={panelId} role="dialog" aria-label={label}
      aria-modal="false" className={cx(styles.panel, panelClassName)}
      style={panelLeft === null ? undefined : { left: panelLeft, right: "auto" }}>
      {children}
    </div>}
  </div>;
}
