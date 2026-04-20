"use client";

import * as React from "react";
import { Select, type SelectOption, type SelectProps } from "../select/Select";

export interface DropdownOption extends SelectOption {}

export interface DropdownProps
  extends Omit<
    SelectProps,
    "allowEmptyOption" | "fullWidth" | "placeholder" | "options"
  > {
  /** List of options to display in the menu. */
  options: DropdownOption[];
  /** Label shown when no option is selected. Defaults to "All". */
  placeholder?: string;
  /** Whether to show the placeholder as a clearable option. Defaults to true. */
  allowClear?: boolean;
}

/**
 * @deprecated Use Select for value selection and DropdownMenu for action menus.
 * Dropdown remains as a compatibility alias during migration.
 */
export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "All",
      allowClear = true,
      ...rest
    },
    ref,
  ) => {
    return (
      <Select
        ref={ref}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        allowEmptyOption={allowClear}
        fullWidth={false}
        {...rest}
      />
    );
  },
);

Dropdown.displayName = "Dropdown";
