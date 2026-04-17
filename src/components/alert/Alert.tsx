"use client";

import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import "./alert.module.css";

export type AlertTone = "success" | "error" | "warning" | "info";

export type AlertProps = {
  tone: AlertTone;
  children: ReactNode;
  className?: string;
};

const TONE_CLASS: Record<AlertTone, string> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

export function Alert({ tone, children, className }: AlertProps) {
  return (
    <div className={cx("alert", TONE_CLASS[tone], className)} role="alert">
      {children}
    </div>
  );
}
