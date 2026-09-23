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
  role = "toolbar",
  className,
  children,
  ...rest
}: ToolbarProps) {
  return (
    <div
      role={role}
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
  role,
  "aria-label": ariaLabel,
  className,
  children,
  ...rest
}: ToolbarGroupProps) {
  const groupLabel = ariaLabel ?? (typeof label === "string" ? label : undefined);
  const groupRole = role ?? (label != null || groupLabel != null ? "group" : undefined);

  return (
    <div
      role={groupRole}
      aria-label={groupLabel}
      className={cx(styles.group, grow && styles.grow, className)}
      {...rest}
    >
      {label != null && <span className={styles.label}>{label}</span>}
      <div className={styles.controls}>{children}</div>
    </div>
  );
}
