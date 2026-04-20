/**
 * Compact label component for status chips and tags.
 *
 * @remarks
 * Supports tone and size presets, and can render any inline element.
 *
 * @param props.as - Element to render (defaults to `span`).
 * @param props.tone - Visual tone variant.
 * @param props.size - Size preset.
 * @param props.icon - Optional leading icon.
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./pill.module.css";

export type PillTone = "neutral" | "success" | "warning" | "info" | "danger";
export type PillSize = "sm" | "md";

type PillElement = "span" | "div" | "button";

export type PillProps = HTMLAttributes<HTMLElement> & {
  /** Optional rendered element; defaults to `span`. */
  as?: PillElement;
  /** Visual tone; adjusts color and border. */
  tone?: PillTone;
  /** Size preset. */
  size?: PillSize;
  /** Leading icon node (not focusable). */
  icon?: ReactNode;
};

export function Pill({
  as,
  tone = "neutral",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: PillProps) {
  const Component: PillElement = as ?? "span";
  const classes = cx(styles.pill, styles[`tone-${tone}`], styles[`size-${size}`], className);

  return (
    <Component className={classes} {...rest}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.content}>{children}</span>
    </Component>
  );
}
