import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./stat.module.css";

export type StatProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
};

export function Stat({ label, value, detail, className, ...rest }: StatProps) {
  return (
    <div className={cx(styles.stat, className)} {...rest}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {detail && <div className={styles.detail}>{detail}</div>}
    </div>
  );
}

export type StatGroupProps = HTMLAttributes<HTMLDivElement> & {
  columns?: 1 | 2 | 3 | 4;
};

export function StatGroup({ columns = 3, className, children, ...rest }: StatGroupProps) {
  return (
    <div
      className={cx(styles.group, styles[`columns-${columns}`], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
