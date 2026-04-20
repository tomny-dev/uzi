"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./segmented-toggle.module.css";

export type SegmentedToggleOption<T extends string = string> = {
  label: ReactNode;
  value: T;
  disabled?: boolean;
};

export type SegmentedToggleProps<T extends string = string> = {
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

export function SegmentedToggle<T extends string = string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
}: SegmentedToggleProps<T>) {
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const fallbackIndex = options.findIndex((opt) => !opt.disabled);
  const lastEnabledIndex = options.findLastIndex((opt) => !opt.disabled);
  const tabbableIndex =
    selectedIndex >= 0 && !options[selectedIndex]?.disabled
      ? selectedIndex
      : fallbackIndex;

  const focusItem = (index: number) => {
    itemRefs.current[index]?.focus();
  };

  const findEnabledIndex = (
    startIndex: number,
    direction: 1 | -1,
  ): number => {
    if (options.length === 0) return -1;

    let nextIndex = startIndex;
    for (let i = 0; i < options.length; i += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        return nextIndex;
      }
    }

    return startIndex;
  };

  const selectIndex = (index: number) => {
    const nextOption = options[index];
    if (!nextOption || nextOption.disabled || nextOption.value === value) {
      return;
    }
    onChange(nextOption.value);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        event.preventDefault();
        const nextIndex = findEnabledIndex(index, 1);
        focusItem(nextIndex);
        selectIndex(nextIndex);
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        event.preventDefault();
        const nextIndex = findEnabledIndex(index, -1);
        focusItem(nextIndex);
        selectIndex(nextIndex);
        break;
      }
      case "Home": {
        event.preventDefault();
        focusItem(fallbackIndex);
        if (fallbackIndex >= 0) {
          selectIndex(fallbackIndex);
        }
        break;
      }
      case "End": {
        event.preventDefault();
        if (lastEnabledIndex >= 0) {
          focusItem(lastEnabledIndex);
          selectIndex(lastEnabledIndex);
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div
      className={cx(styles.track, className)}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {options.map((opt, index) => (
        <button
          key={opt.value}
          ref={(node) => {
            itemRefs.current[opt.index] = node;
          }}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          disabled={opt.disabled}
          tabIndex={
            opt.disabled
              ? -1
              : opt.index === tabbableIndex
                ? 0
                : -1
          }
          onClick={() => {
            if (opt.value !== value) {
              onChange(opt.value);
            }
          }}
          onKeyDown={(event) =>
            handleKeyDown(event, opt.index)
          }
          className={cx(styles.option)}
        >
          <span className={styles.label}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
