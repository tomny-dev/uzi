import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./toolbar.module.css";

export type ToolbarDensity = "compact" | "default";

export type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  density?: ToolbarDensity;
  sticky?: boolean;
};

export function Toolbar({
  density = "compact",
  sticky = false,
  className,
  children,
  ...rest
}: ToolbarProps) {
  return (
    <div
      className={cx(styles.toolbar, styles[`density-${density}`], sticky && styles.sticky, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export type ToolbarGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  grow?: boolean;
};

export function ToolbarGroup({
  label,
  grow = false,
  className,
  children,
  ...rest
}: ToolbarGroupProps) {
  return (
    <div className={cx(styles.group, grow && styles.grow, className)} {...rest}>
      {label != null && <span className={styles.label}>{label}</span>}
      <div className={styles.controls}>{children}</div>
    </div>
  );
}
