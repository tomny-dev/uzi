"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cx } from "../../utils/cx";
import styles from "./multi-select.module.css";

export type MultiSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  fullWidth?: boolean;
  maxVisibleValues?: number;
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
      className,
      disabled = false,
      name,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
    },
    ref,
  ) => {
    const selectedSet = React.useMemo(() => new Set(value), [value]);
    const selectedOptions = React.useMemo(
      () => options.filter((opt) => selectedSet.has(opt.value)),
      [options, selectedSet],
    );

    const toggleValue = React.useCallback(
      (nextValue: string) => {
        if (selectedSet.has(nextValue)) {
          onChange(value.filter((entry) => entry !== nextValue));
          return;
        }

        onChange([...value, nextValue]);
      },
      [onChange, selectedSet, value],
    );

    const visibleCount = Math.max(1, maxVisibleValues);
    const visibleOptions = selectedOptions.slice(0, visibleCount);
    const overflowCount = Math.max(
      0,
      selectedOptions.length - visibleOptions.length,
    );

    return (
      <DropdownMenuPrimitive.Root modal={false}>
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
                {selectedOptions.length === 0 ? (
                  <span className={styles.placeholder}>{placeholder}</span>
                ) : (
                  <>
                    {visibleOptions.map((option) => (
                      <span key={option.value} className={styles.chip}>
                        {option.label}
                      </span>
                    ))}
                    {overflowCount > 0 ? (
                      <span
                        className={cx(
                          styles.chip,
                          styles.chipSummary,
                        )}
                      >
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
                    <span className={styles.optionLabel}>{option.label}</span>
                  </DropdownMenuPrimitive.CheckboxItem>
                );
              })}
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </div>
      </DropdownMenuPrimitive.Root>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
