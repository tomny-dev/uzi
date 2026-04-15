import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
};

type AsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };

type AsAnchor = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" };

export type ButtonProps = AsButton | AsAnchor;

export function Button({
  as,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cx(
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    className,
  );

  if (as === "a") {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
