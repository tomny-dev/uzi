import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cx } from "../../utils/cx";
import styles from "./button.module.css";

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";
export type ButtonSize = "default" | "sm" | "md" | "lg" | "icon";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
};

type AsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };

type AsAnchor = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" };

export type ButtonProps = AsButton | AsAnchor;

const variantClass: Record<ButtonVariant, string> = {
  default: styles["variant-primary"],
  primary: styles["variant-primary"],
  secondary: styles["variant-secondary"],
  outline: styles["variant-outline"],
  ghost: styles["variant-ghost"],
  destructive: styles["variant-destructive"],
  link: styles["variant-link"],
};

const sizeClass: Record<ButtonSize, string> = {
  default: styles["size-md"],
  sm: styles["size-sm"],
  md: styles["size-md"],
  lg: styles["size-lg"],
  icon: styles["size-icon"],
};

export function Button({
  as,
  variant = "default",
  size = "default",
  className,
  children,
  asChild = false,
  ...rest
}: ButtonProps) {
  const classes = cx(
    styles.button,
    variantClass[variant],
    sizeClass[size],
    className,
  );

  if (asChild) {
    return (
      <Slot className={classes} {...rest}>
        {children}
      </Slot>
    );
  }

  if (as === "a") {
    return (
      <a
        className={classes}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
