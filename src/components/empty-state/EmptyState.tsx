import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./empty-state.module.css";

export type EmptyStateSize = "compact" | "default";
export type EmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  visual?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  size?: EmptyStateSize;
  headingLevel?: EmptyStateHeadingLevel;
};

export function EmptyState({
  title,
  description,
  visual,
  primaryAction,
  secondaryAction,
  size = "default",
  headingLevel = 2,
  className,
  ...rest
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as `h${EmptyStateHeadingLevel}`;

  return (
    <div
      className={cx(styles.root, size === "compact" && styles.compact, className)}
      {...rest}
    >
      {visual != null && <div className={styles.visual}>{visual}</div>}
      <div className={styles.content}>
        <Heading className={styles.title}>{title}</Heading>
        {description != null && <div className={styles.description}>{description}</div>}
      </div>
      {(primaryAction != null || secondaryAction != null) && (
        <div className={styles.actions}>
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
