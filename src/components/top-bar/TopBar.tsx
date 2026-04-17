"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import {
  ThemeToggleButton,
  type ThemeToggleButtonProps,
} from "../theme-toggle-button/ThemeToggleButton";
import "./top-bar.module.css";

export type TopBarProps = HTMLAttributes<HTMLElement> & {
  leading?: ReactNode;
  brand?: ReactNode;
  brandHref?: string;
  brandingLocation?: "left" | "center";
  /** Content rendered after the brand in the left region (e.g. breadcrumbs, search). */
  start?: ReactNode;
  /** Content rendered in the center region. */
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
  start,
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
    <a href={brandHref} className={"topBarBrand"}>
      <span className={"topBarBrandContent"}>{brand}</span>
    </a>
  ) : (
    <div className={"topBarBrand"}>
      <span className={"topBarBrandContent"}>{brand}</span>
    </div>
  );

  return (
    <header
      className={cx("topBar", !shouldStick && "topBarStatic", className)}
      {...rest}
    >
      <div className={cx("topBarInner", innerClassName)}>
        <div className={"topBarStart"}>
          {leading}
          {brandingLocation === "left" && brandNode}
          {start}
        </div>
        {(brandNode && brandingLocation === "center") || center || children ? (
          <div className={"topBarCenter"}>
            <div className={"topBarCenterGroup"}>
              {brandingLocation === "center" && brandNode}
              {center ?? children}
            </div>
          </div>
        ) : null}
        <div className={"topBarActions"}>
          {showThemeToggle && <ThemeToggleButton {...themeToggleProps} />}
          {actions}
        </div>
      </div>
    </header>
  );
}
