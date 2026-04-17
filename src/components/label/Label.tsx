import * as React from "react";
import { cx } from "../../utils/cx";
import "./label.module.css";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cx("label", className)} {...props} />
  ),
);

Label.displayName = "Label";
