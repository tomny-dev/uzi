"use client";

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
  allowEmptyOption?: boolean;
  fullWidth?: boolean;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder,
      allowEmptyOption = false,
      fullWidth = true,
      className,
      ...rest
    },
    ref,
  ) => {
    const isPlaceholderShown = Boolean(placeholder) && value === "";

    return (
      <div className={cx("wrapper", fullWidth && "wrapper-fullWidth", className)}>
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cx("select", isPlaceholderShown && "select-placeholder")}
          data-placeholder-shown={isPlaceholderShown ? "true" : undefined}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled={!allowEmptyOption}>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="chevron" aria-hidden="true">
          <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    );
  },
);

Select.displayName = "Select";
