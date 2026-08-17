import type { HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./page-container.module.css";

export type PageContainerWidth = "sm" | "md" | "lg" | "xl" | "full";

export type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  /** Maximum content width. Defaults to `lg`. */
  maxWidth?: PageContainerWidth;
  /** Removes the responsive horizontal gutters. */
  bleed?: boolean;
};

const WIDTH_CLASS: Record<PageContainerWidth, string> = {
  sm: "width-sm",
  md: "width-md",
  lg: "width-lg",
  xl: "width-xl",
  full: "width-full",
};

export function PageContainer({
  maxWidth = "lg",
  bleed = false,
  className,
  children,
  ...rest
}: PageContainerProps) {
  return (
    <div
      className={cx(styles.container, styles[WIDTH_CLASS[maxWidth]], bleed && styles.bleed, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
