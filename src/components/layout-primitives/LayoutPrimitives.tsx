import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./layout-primitives.module.css";

export type LayoutGap = "xs" | "sm" | "md" | "lg" | "xl";
export type InlineAlign = "start" | "center" | "end" | "baseline";
export type InlineJustify = "start" | "center" | "end" | "between";

const GAP_CLASS: Record<LayoutGap, string> = {
  xs: "gap-xs",
  sm: "gap-sm",
  md: "gap-md",
  lg: "gap-lg",
  xl: "gap-xl",
};

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  gap?: LayoutGap;
};

export function Stack({ gap = "md", className, children, ...rest }: StackProps) {
  return (
    <div className={cx(styles.stack, styles[GAP_CLASS[gap]], className)} {...rest}>
      {children}
    </div>
  );
}

export type InlineProps = HTMLAttributes<HTMLDivElement> & {
  gap?: LayoutGap;
  align?: InlineAlign;
  justify?: InlineJustify;
  wrap?: boolean;
};

export function Inline({
  gap = "md",
  align = "center",
  justify = "start",
  wrap = true,
  className,
  children,
  style,
  ...rest
}: InlineProps) {
  const inlineStyle: CSSProperties = {
    ...style,
    alignItems: align === "start" ? "flex-start" : align === "end" ? "flex-end" : align,
    justifyContent:
      justify === "between" ? "space-between" : justify === "start" ? "flex-start" : justify === "end" ? "flex-end" : justify,
  };

  return (
    <div
      className={cx(styles.inline, styles[GAP_CLASS[gap]], !wrap && styles.nowrap, className)}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </div>
  );
}
