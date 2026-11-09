import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./auth-form.module.css";

export type AuthMode = "signin" | "signup";

export interface AuthModeSwitchProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  signInLabel?: string;
  signUpLabel?: string;
  className?: string;
}

/** An accessible pair of mode buttons; the host app owns navigation and form state. */
export function AuthModeSwitch({
  mode,
  onModeChange,
  signInLabel = "Sign in",
  signUpLabel = "Create account",
  className,
}: AuthModeSwitchProps) {
  return (
    <div className={cx(styles.modeSwitch, className)} role="group" aria-label="Account action">
      <button type="button" className={styles.modeButton} aria-pressed={mode === "signin"} onClick={() => onModeChange("signin")}>
        {signInLabel}
      </button>
      <button type="button" className={styles.modeButton} aria-pressed={mode === "signup"} onClick={() => onModeChange("signup")}>
        {signUpLabel}
      </button>
    </div>
  );
}

export type AuthFormProps = React.ComponentPropsWithoutRef<"form">;

/** Consistent form rhythm and full-width submit controls, without owning credentials. */
export const AuthForm = React.forwardRef<HTMLFormElement, AuthFormProps>(
  ({ className, ...props }, ref) => <form ref={ref} className={cx(styles.form, className)} {...props} />,
);
AuthForm.displayName = "AuthForm";

export interface AuthFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/** Associates inline errors with a field; consumers pass the error ID to aria-describedby. */
export function AuthField({ label, htmlFor, error, children, className }: AuthFieldProps) {
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={htmlFor} className={styles.label}>{label}</label>
      {children}
      {error && <p id={htmlFor + "-error"} role="alert" className={styles.error}>{error}</p>}
    </div>
  );
}
