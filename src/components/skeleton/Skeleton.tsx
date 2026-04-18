import type { HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./skeleton.module.css";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** Width as a CSS value. */
  width?: string;
  /** Height as a CSS value. */
  height?: string;
  /** Border radius preset. Defaults to "md". */
  radius?: "sm" | "md" | "lg" | "full";
};

export function Skeleton({
  width,
  height,
  radius = "md",
  className,
  style,
  ...rest
}: SkeletonProps) {
  return (
    <div
      className={cx("skeleton", `radius-${radius}`, className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
