import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./input.module.css";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cx(styles.input, className)}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
