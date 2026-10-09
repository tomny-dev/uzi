"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cx } from "../../utils/cx";
import styles from "./multi-select.module.css";

export type MultiSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
  /** Optional decorative leading visual. The label remains the accessible option name. */
  icon?: React.ReactElement;
};

export type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  fullWidth?: boolean;
  maxVisibleValues?: number;
  /** Formats the closed trigger text from the selected options, including an empty selection. */
  formatValue?: (selected: MultiSelectOption[]) => string;
  /** Shows Select all and Clear all actions. Bulk actions modify enabled options only. */
  bulkActions?: boolean;
  /** Stage changes until Apply. Cancel/dismiss discards the draft. */
  draftMode?: boolean;
  minSelected?: number;
  selectAllLabel?: string;
  /** Label for clearing all enabled selections. Disabled selected options remain selected. */
  clearAllLabel?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select options",
      fullWidth = true,
      maxVisibleValues = 2,
      formatValue,
      bulkActions = false,
      draftMode = false,
      minSelected = 0,
      selectAllLabel = "Select all",
      clearAllLabel,
      className,
      disabled = false,
      name,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [draft, setDraft] = React.useState<string[]>(value);
    const editValue = draftMode && open ? draft : value;
    const updateSelection = (next: string[]) => {
      if (draftMode) setDraft(next);
      else if (next.length >= minSelected) onChange(next);
    };
    const selectedSet = React.useMemo(() => new Set(editValue), [editValue]);
    const selectedOptions = React.useMemo(
      () => options.filter((opt) => selectedSet.has(opt.value)),
      [options, selectedSet],
    );

    const enabledValues = React.useMemo(
      () => options.filter((option) => !option.disabled).map((option) => option.value),
      [options],
    );
    const allEnabledSelected =
      enabledValues.length > 0 && enabledValues.every((entry) => selectedSet.has(entry));
    const hasDisabledOptions = options.some((option) => option.disabled);
    const resolvedClearAllLabel =
      clearAllLabel ?? (hasDisabledOptions ? "Clear enabled" : "Clear all");

    const formattedValue = React.useMemo(
      () => formatValue?.(selectedOptions),
      [formatValue, selectedOptions],
    );

    const toggleValue = React.useCallback(
      (nextValue: string) => {
        if (selectedSet.has(nextValue)) {
          updateSelection(editValue.filter((entry) => entry !== nextValue));
          return;
        }

        updateSelection([...editValue, nextValue]);
      },
      [updateSelection, selectedSet, editValue],
    );

    const visibleCount = Math.max(1, maxVisibleValues);
    const visibleOptions = selectedOptions.slice(0, visibleCount);
    const overflowCount = Math.max(
      0,
      selectedOptions.length - visibleOptions.length,
    );

    return (
      <DropdownMenuPrimitive.Root modal={false} open={open} onOpenChange={(next) => {
        if (next) setDraft([...value]);
        setOpen(next);
      }}>
        <div
          className={cx(
            styles.wrapper,
            fullWidth && styles.wrapperFullWidth,
            className,
          )}
        >
          <DropdownMenuPrimitive.Trigger asChild>
            <button
              ref={ref}
              type="button"
              className={styles.trigger}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              disabled={disabled}
            >
              <span className={styles.value}>
                {formatValue ? (
                  <span className={styles.summary}>{formattedValue}</span>
                ) : selectedOptions.length === 0 ? (
                  <span className={styles.placeholder}>{placeholder}</span>
                ) : (
                  <>
                    {visibleOptions.map((option) => (
                      <span key={option.value} className={styles.chip}>
                        {option.icon ? <span className={styles.optionIcon} aria-hidden="true">{option.icon}</span> : null}
                        {option.label}
                      </span>
                    ))}
                    {overflowCount > 0 ? (
                      <span className={cx(styles.chip, styles.chipSummary)}>
                        +{overflowCount}
                      </span>
                    ) : null}
                  </>
                )}
              </span>
              <span className={styles.chevron} aria-hidden="true">
                <svg
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </DropdownMenuPrimitive.Trigger>

          {name
            ? value.map((entry) => (
                <input key={entry} type="hidden" name={name} value={entry} />
              ))
            : null}

          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              className={styles.menu}
              sideOffset={4}
              align="start"
            >
              {bulkActions && enabledValues.length > 0 ? (
                <>
                  <DropdownMenuPrimitive.Item
                    className={styles.bulkAction}
                    disabled={allEnabledSelected}
                    onSelect={(event) => {
                      event.preventDefault();
                      updateSelection([...editValue, ...enabledValues.filter((entry) => !selectedSet.has(entry))]);
                    }}
                  >
                    {selectAllLabel}
                  </DropdownMenuPrimitive.Item>
                  <DropdownMenuPrimitive.Item
                    className={styles.bulkAction}
                    disabled={!enabledValues.some((entry) => selectedSet.has(entry))}
                    onSelect={(event) => {
                      event.preventDefault();
                      const enabledSet = new Set(enabledValues);
                      updateSelection(editValue.filter((entry) => !enabledSet.has(entry)));
                    }}
                  >
                    {resolvedClearAllLabel}
                  </DropdownMenuPrimitive.Item>
                </>
              ) : null}
              {bulkActions && enabledValues.length > 0 ? (
                <DropdownMenuPrimitive.Separator className={styles.separator} />
              ) : null}
              {options.map((option) => {
                const selected = selectedSet.has(option.value);

                return (
                  <DropdownMenuPrimitive.CheckboxItem
                    key={option.value}
                    className={cx(
                      styles.option,
                      selected && styles.optionSelected,
                      option.disabled && styles.optionDisabled,
                    )}
                    checked={selected}
                    disabled={option.disabled}
                    onCheckedChange={() => toggleValue(option.value)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    <span
                      className={cx(
                        styles.indicator,
                        selected && styles.indicatorSelected,
                        option.disabled && styles.indicatorDisabled,
                      )}
                      aria-hidden="true"
                    >
                      <DropdownMenuPrimitive.ItemIndicator forceMount>
                        <svg
                          viewBox="0 0 16 16"
                          width="16"
                          height="16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.5 8.5 6.5 11.5 12.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </DropdownMenuPrimitive.ItemIndicator>
                    </span>
                    <span className={styles.optionLabel}>
                          {option.icon ? <span className={styles.optionIcon} aria-hidden="true">{option.icon}</span> : null}
                          {option.label}
                        </span>
                  </DropdownMenuPrimitive.CheckboxItem>
                );
              })}
              {draftMode ? (
                <div className={styles.draftActions}>
                  <button type="button" className={styles.draftButton} onClick={() => setOpen(false)}>Cancel</button>
                  <button type="button" className={styles.draftButton} disabled={editValue.length < minSelected} onClick={() => {
                    onChange(editValue);
                    setOpen(false);
                  }}>Apply</button>
                </div>
              ) : null}
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </div>
      </DropdownMenuPrimitive.Root>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
