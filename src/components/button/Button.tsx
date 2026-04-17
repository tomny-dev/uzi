import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cx } from "../../utils/cx";
import "./button.module.css";

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
  default: "variant-primary",
  primary: "variant-primary",
  secondary: "variant-secondary",
  outline: "variant-outline",
  ghost: "variant-ghost",
  destructive: "variant-destructive",
  link: "variant-link",
};

const sizeClass: Record<ButtonSize, string> = {
  default: "size-md",
  sm: "size-sm",
  md: "size-md",
  lg: "size-lg",
  icon: "size-icon",
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
    "button",
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
