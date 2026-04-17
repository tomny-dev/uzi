import * as React from "react";
import { cx } from "../../utils/cx";
import "./input.module.css";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cx("input", className)}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
