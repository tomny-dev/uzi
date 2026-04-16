"use client";

import type { ButtonHTMLAttributes } from "react";
import { Button } from "../button/Button";
import { useTheme } from "../../theme/ThemeProvider";
import { cx } from "../../utils/cx";

export type ThemeToggleButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  showLabel?: boolean;
  lightLabel?: string;
  darkLabel?: string;
};

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none">
      <path
        d="M20 15.2A8.5 8.5 0 0 1 8.8 4 9 9 0 1 0 20 15.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ThemeToggleButton({
  showLabel = false,
  lightLabel = "Light mode",
  darkLabel = "Dark mode",
  className,
  onClick,
  ...rest
}: ThemeToggleButtonProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const nextThemeLabel = resolvedTheme === "dark" ? lightLabel : darkLabel;

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      className={cx(showLabel && "themeToggleWithLabel", className)}
      aria-label={`Switch to ${nextThemeLabel.toLowerCase()}`}
      title={`Switch to ${nextThemeLabel.toLowerCase()}`}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleTheme();
      }}
      {...rest}
    >
      {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
      {showLabel && <span>{nextThemeLabel}</span>}
    </Button>
  );
}
