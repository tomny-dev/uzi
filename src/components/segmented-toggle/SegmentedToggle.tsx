"use client";

import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./segmented-toggle.module.css";

export type SegmentedToggleOption<T extends string = string> = {
  label: ReactNode;
  value: T;
};

export type SegmentedToggleProps<T extends string = string> = {
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label"?: string;
};

export function SegmentedToggle<T extends string = string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div className={styles.track} role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={opt.value === value}
          className={cx(styles.option, opt.value === value && styles.active)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
