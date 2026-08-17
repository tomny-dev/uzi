import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./empty-state.module.css";

export type EmptyStateSize = "compact" | "default";

export type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  visual?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  size?: EmptyStateSize;
};

export function EmptyState({
  title,
  description,
  visual,
  primaryAction,
  secondaryAction,
  size = "default",
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cx(styles.root, size === "compact" && styles.compact, className)}
      {...rest}
    >
      {visual && <div className={styles.visual}>{visual}</div>}
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        {description && <div className={styles.description}>{description}</div>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className={styles.actions}>
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
