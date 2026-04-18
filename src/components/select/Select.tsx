import * as React from "react";
import { cx } from "../../utils/cx";
import "./select.module.css";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, placeholder, className, ...rest }, ref) => {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx("select", className)}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  },
);

Select.displayName = "Select";
