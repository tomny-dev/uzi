import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cx } from "../../utils/cx";
import styles from "./surface.module.css";

export type SurfaceLevel = "base" | "subtle" | "raised" | "selected";
export type SurfacePadding = "none" | "sm" | "md" | "lg";
export type SurfaceRadius = "none" | "sm" | "md" | "lg";

type SurfaceElement = "div" | "section" | "article" | "aside";

type SurfaceOwnProps<T extends SurfaceElement> = {
  as?: T;
  level?: SurfaceLevel;
  padding?: SurfacePadding;
  radius?: SurfaceRadius;
  bordered?: boolean;
};

export type SurfaceProps<T extends SurfaceElement = "div"> =
  SurfaceOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SurfaceOwnProps<T>>;

export function Surface<T extends SurfaceElement = "div">({
  as,
  level = "base",
  padding = "md",
  radius = "md",
  bordered = false,
  className,
  children,
  ...rest
}: SurfaceProps<T>) {
  const Component = (as ?? "div") as ElementType;

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
