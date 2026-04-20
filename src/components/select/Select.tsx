"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cx } from "../../utils/cx";
import "./select.module.css";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowEmptyOption?: boolean;
  fullWidth?: boolean;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  form?: string;
  title?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
};

const EMPTY_OPTION_VALUE = "__uzi_select_empty__";

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder,
      allowEmptyOption = false,
      fullWidth = true,
      className,
      id,
      name,
      disabled,
      required,
      autoComplete,
      form,
      title,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      onBlur,
      onFocus,
    },
    ref,
  ) => {
    const internalValue =
      value === "" && allowEmptyOption ? EMPTY_OPTION_VALUE : value;

    return (
      <div
        className={cx(
          "uziSelectWrapper",
          fullWidth && "uziSelectWrapperFullWidth",
          className,
        )}
      >
        <SelectPrimitive.Root
          value={internalValue}
          onValueChange={(nextValue: string) =>
            onChange(nextValue === EMPTY_OPTION_VALUE ? "" : nextValue)
          }
          name={name}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={id}
            className="uziSelectTrigger"
            form={form}
            title={title}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            onBlur={onBlur}
            onFocus={onFocus}
          >
            <SelectPrimitive.Value
              className="uziSelectValue"
              placeholder={placeholder}
            />
            <SelectPrimitive.Icon
              className="uziSelectChevron"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="uziSelectContent"
              position="popper"
              sideOffset={4}
              align="start"
            >
              <SelectPrimitive.Viewport className="uziSelectViewport">
                {placeholder && allowEmptyOption ? (
                  <SelectPrimitive.Item
                    value={EMPTY_OPTION_VALUE}
                    className="uziSelectItem"
                  >
                    <span className="uziSelectIndicator">
                      <SelectPrimitive.ItemIndicator>
                        <svg
                          viewBox="0 0 16 16"
                          width="16"
                          height="16"
                          aria-hidden="true"
                          className="uziSelectIndicatorIcon"
                        >
                          <path
                            d="M3.5 8.5 6.5 11.5 12.5 4.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{placeholder}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ) : null}

                {options.map((opt) => (
                  <SelectPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="uziSelectItem"
                  >
                    <span className="uziSelectIndicator">
                      <SelectPrimitive.ItemIndicator>
                        <svg
                          viewBox="0 0 16 16"
                          width="16"
                          height="16"
                          aria-hidden="true"
                          className="uziSelectIndicatorIcon"
                        >
                          <path
                            d="M3.5 8.5 6.5 11.5 12.5 4.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    );
  },
);

Select.displayName = "Select";
