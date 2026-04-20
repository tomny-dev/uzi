import type { HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./progress.module.css";

export type ProgressTone = "default" | "success" | "warning" | "danger";

export type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  /** Value 0–100. */
  value: number;
  /** Visual tone. Defaults to "default". */
  tone?: ProgressTone;
  /** Accessible label. */
  "aria-label"?: string;
};

export function Progress({
  value,
  tone = "default",
  className,
  "aria-label": ariaLabel,
  ...rest
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cx(styles.track, className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      {...rest}
    >
      <div
        className={cx(styles.fill, styles[`tone-${tone}`])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
