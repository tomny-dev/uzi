"use client";

import { useState, useRef, useEffect } from "react";
import { cx } from "../../utils/cx";
import "./dropdown.module.css";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  /** List of options to display in the menu. */
  options: DropdownOption[];
  /** Currently selected value. Use empty string for "no selection". */
  value: string;
  /** Called when the user selects an option. */
  onChange: (value: string) => void;
  /** Label shown when no option is selected. Defaults to "All". */
  placeholder?: string;
  /** Additional class name for the wrapper element. */
  className?: string;
  /** Whether to show the placeholder as a clearable option. Defaults to true. */
  allowClear?: boolean;
  /** Associates the trigger button with an external label element via its id. */
  "aria-labelledby"?: string;
  /** Provides an accessible label directly on the trigger button. */
  "aria-label"?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "All",
  className,
  allowClear = true,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const isActive = allowClear && value !== "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cx("wrapper", className)} ref={ref}>
      <button
        type="button"
        className={cx("trigger", isActive && "trigger-active")}
        onClick={() => setOpen((o) => !o)}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
      >
        {selected ? selected.label : placeholder}
        <span className={cx("chevron", open && "chevron-open")}>
          <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className={"menu"}>
          {allowClear && (
            <button
              type="button"
              className={cx("option", value === "" && "option-selected")}
              onClick={() => { onChange(""); setOpen(false); }}
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cx("option", value === opt.value && "option-selected")}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
