import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./checkbox.module.css";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cx(styles.checkbox, className)}
        {...props}
      />
    );
  },
);

Checkbox.displayName = "Checkbox";
