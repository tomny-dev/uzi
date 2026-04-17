"use client";

import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./alert.module.css";

export type AlertTone = "success" | "error" | "warning" | "info";

export type AlertProps = {
  tone: AlertTone;
  children: ReactNode;
  className?: string;
};

export function Alert({ tone, children, className }: AlertProps) {
  return (
    <div className={cx(styles.alert, styles[tone], className)} role="alert">
      {children}
    </div>
  );
}
