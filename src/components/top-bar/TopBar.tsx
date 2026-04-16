"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import {
  ThemeToggleButton,
  type ThemeToggleButtonProps,
} from "../theme-toggle-button/ThemeToggleButton";
import styles from "./top-bar.module.css";

export type TopBarProps = HTMLAttributes<HTMLElement> & {
  leading?: ReactNode;
  brand?: ReactNode;
  brandHref?: string;
  brandingLocation?: "left" | "center";
  center?: ReactNode;
  actions?: ReactNode;
  showThemeToggle?: boolean;
  themeToggleProps?: ThemeToggleButtonProps;
  innerClassName?: string;
  isSticky?: boolean;
  sticky?: boolean;
};

export function TopBar({
  leading,
  brand,
  brandHref,
  brandingLocation = "left",
  center,
  actions,
  showThemeToggle = false,
  themeToggleProps,
  className,
  innerClassName,
  isSticky,
  sticky = true,
  children,
  ...rest
}: TopBarProps) {
  const shouldStick = isSticky ?? sticky;
  const brandNode = !brand ? null : brandHref ? (
    <a href={brandHref} className={styles.topBarBrand}>
      <span className={styles.topBarBrandContent}>{brand}</span>
    </a>
  ) : (
    <div className={styles.topBarBrand}>
      <span className={styles.topBarBrandContent}>{brand}</span>
    </div>
  );

  return (
    <header
      className={cx(styles.topBar, !shouldStick && styles.topBarStatic, className)}
      {...rest}
    >
      <div className={cx(styles.topBarInner, innerClassName)}>
        <div className={styles.topBarStart}>
          {leading}
          {brandingLocation === "left" && brandNode}
        </div>
        {(brandNode && brandingLocation === "center") || center || children ? (
          <div className={styles.topBarCenter}>
            <div className={styles.topBarCenterGroup}>
              {brandingLocation === "center" && brandNode}
              {center ?? children}
            </div>
          </div>
        ) : null}
        <div className={styles.topBarActions}>
          {showThemeToggle && <ThemeToggleButton {...themeToggleProps} />}
          {actions}
        </div>
      </div>
    </header>
  );
}
