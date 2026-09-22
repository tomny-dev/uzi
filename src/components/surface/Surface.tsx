import type { HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./surface.module.css";

export type SurfaceLevel = "base" | "subtle" | "raised" | "selected";
export type SurfacePadding = "none" | "sm" | "md" | "lg";
export type SurfaceRadius = "none" | "sm" | "md" | "lg";

type SurfaceElement = "div" | "section" | "article" | "aside";

export type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: SurfaceElement;
  level?: SurfaceLevel;
  padding?: SurfacePadding;
  radius?: SurfaceRadius;
  bordered?: boolean;
};

export function Surface({
  as,
  level = "base",
  padding = "md",
  radius = "md",
  bordered = false,
  className,
  children,
  ...rest
}: SurfaceProps) {
  const Component: SurfaceElement = as ?? "div";

  return (
    <Component
      className={cx(
        styles.surface,
        styles[`level-${level}`],
        styles[`padding-${padding}`],
        styles[`radius-${radius}`],
        bordered && styles.bordered,
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
