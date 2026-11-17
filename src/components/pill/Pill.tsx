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
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./pill.module.css";

export type PillTone = "neutral" | "success" | "warning" | "info" | "danger";
export type PillSize = "sm" | "md";

type PillElement = "span" | "div" | "button";

type PillBaseProps = {
  /** Visual tone; adjusts color and border. */
  tone?: PillTone;
  /** Size preset. */
  size?: PillSize;
  /** Leading icon node (not focusable). */
  icon?: ReactNode;
};

/** Static labels are spans/divs; interactive pills use native button props. */
export type PillProps = PillBaseProps & (
  | ({ as?: "span" | "div" } & HTMLAttributes<HTMLElement>)
  | ({ as: "button" } & ButtonHTMLAttributes<HTMLButtonElement>)
);

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
  const classes = cx(styles.pill, styles[`tone-${tone}`], styles[`size-${size}`], as === "button" && styles.interactive, className);
  const content = (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">{icon}</span>
      ) : null}
      <span className={styles.content}>{children}</span>
    </>
  );

  if (as === "button") {
    return <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{content}</button>;
  }

  return (
    <Component className={classes} {...(rest as HTMLAttributes<HTMLElement>)}>
      {content}
    </Component>
  );
}
