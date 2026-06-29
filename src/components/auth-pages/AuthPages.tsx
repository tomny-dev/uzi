import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./auth-pages.module.css";

// ── Eye icon (show/hide password) ──
function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.eyeIcon}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.eyeIcon}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// ── Internal reusable field ──
interface FieldProps {
  label: string;
  id: string;
  children: React.ReactNode;
  error?: string;
}

function Field({ label, id, children, error }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

// ── Password input with visibility toggle ──
interface PasswordFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

function PasswordField({ id, label, placeholder, value, onChange, error }: PasswordFieldProps) {
  const [show, setShow] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Field label={label ?? "Password"} id={id} error={error}>
      <div className={styles.passwordWrapper}>
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles.input}
        />
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setShow((s) => !s)}
          className={styles.toggle}
          aria-label={show ? "Hide password" : "Show password"}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </Field>
  );
}

// ── Checkbox row ──
interface CheckboxRowProps {
  label?: string;
  linkText: string;
  linkHref?: string;
}

interface CheckboxRowPropsExtended extends CheckboxRowProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

function CheckboxRow({ label, linkText, linkHref, checked, onChange }: CheckboxRowPropsExtended) {
  if (!label) return null;
  return (
    <div className={styles.checkboxRow}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span>{label}</span>
      </label>
      {linkHref && (
        <a href={linkHref} className={styles.forgotLink}>
          {linkText}
        </a>
      )}
    </div>
  );
}

// ── Shared props ──
interface BaseAuthPageProps {
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** Footer content (e.g., "No account? Sign up") */
  footer?: React.ReactNode;
  /** Called with form data on valid submit */
  onSubmit?: (data: Record<string, string | boolean>) => void;
  /** Loading state for the submit button */
  loading?: boolean;
  /** Optional brand/logo element */
  brand?: React.ReactNode;
  /** Extra class for the outer wrapper */
  className?: string;
}

// ── Sign In Page ──
export interface SignInPageProps extends BaseAuthPageProps {
  /** Email placeholder (default "Email address") */
  emailPlaceholder?: string;
  /** Password placeholder (default "Password") */
  passwordPlaceholder?: string;
  /** "Remember me" checkbox label */
  rememberLabel?: string;
  /** "Forgot password" link text */
  forgotLinkText?: string;
  /** "Forgot password" link href */
  forgotLinkHref?: string;
}

export function SignInPage({
  title = "Sign in",
  subtitle,
  footer,
  onSubmit,
  loading = false,
  brand,
  className,
  emailPlaceholder = "Email address",
  passwordPlaceholder = "Password",
  rememberLabel = "Remember me",
  forgotLinkText = "Forgot password?",
  forgotLinkHref,
}: SignInPageProps) {
  const id = React.useId();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;
    onSubmit?.({ email, password, rememberMe });
  };

  return (
    <div className={cx(styles.authLayout, className)}>
      <div className={styles.authCard}>
        {brand && <div className={styles.authBrand}>{brand}</div>}
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>{title}</h1>
          {subtitle && <p className={styles.authSubtitle}>{subtitle}</p>}
        </div>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Field label={emailPlaceholder} id={id + "-email"} error={submitted ? errors.email : undefined}>
            <input
              id={id + "-email"}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              autoComplete="email"
              autoFocus
            />
          </Field>
          <PasswordField
            label={passwordPlaceholder}
            id={id + "-password"}
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (submitted) setSubmitted(false); }}
            error={submitted ? errors.password : undefined}
          />
          <CheckboxRow
            label={rememberLabel}
            linkText={forgotLinkText}
            linkHref={forgotLinkHref}
            checked={rememberMe}
            onChange={(c) => { setRememberMe(c); if (submitted) setSubmitted(false); }}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
        {footer && (
          <>
            <hr className={styles.divider} />
            <p className={styles.authFooter}>{footer}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sign Up Page ──
export interface SignUpPageProps extends BaseAuthPageProps {
  /** Email placeholder */
  emailPlaceholder?: string;
  /** Password placeholder */
  passwordPlaceholder?: string;
  /** Confirm password placeholder */
  confirmPasswordPlaceholder?: string;
  /** Checkbox label (e.g., "I agree to the Terms of Service") */
  checkboxLabel?: string;
  /** Checkbox href */
  checkboxLinkText?: string;
  /** Checkbox href */
  checkboxLinkHref?: string;
}

export function SignUpPage({
  title = "Create an account",
  subtitle,
  footer,
  onSubmit,
  loading = false,
  brand,
  className,
  emailPlaceholder = "Email address",
  passwordPlaceholder = "Password",
  confirmPasswordPlaceholder = "Confirm password",
  checkboxLabel,
  checkboxLinkText,
  checkboxLinkHref,
}: SignUpPageProps) {
  const id = React.useId();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "At least 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!agreed) newErrors.agreed = "You must agree to continue";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;
    onSubmit?.({ email, password, agreed });
  };

  return (
    <div className={cx(styles.authLayout, className)}>
      <div className={styles.authCard}>
        {brand && <div className={styles.authBrand}>{brand}</div>}
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>{title}</h1>
          {subtitle && <p className={styles.authSubtitle}>{subtitle}</p>}
        </div>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Field label={emailPlaceholder} id={id + "-email"} error={submitted ? errors.email : undefined}>
            <input
              id={id + "-email"}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (submitted) setSubmitted(false); }}
              className={styles.input}
              autoComplete="email"
              autoFocus
            />
          </Field>
          <PasswordField
            label={passwordPlaceholder}
            id={id + "-password"}
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (submitted) setSubmitted(false); }}
            error={submitted ? errors.password : undefined}
          />
          <PasswordField
            label={confirmPasswordPlaceholder}
            id={id + "-confirm"}
            placeholder={confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if (submitted) setSubmitted(false); }}
            error={submitted ? errors.confirmPassword : undefined}
          />
          {checkboxLabel && (
            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel}>
                <input
                  id={id + "-agreed"}
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); if (submitted) setSubmitted(false); }}
                  className={styles.checkbox}
                />
                <span>
                  {checkboxLinkText ? (
                    <>
                      I agree to the{" "}
                      <a href={checkboxLinkHref} className={styles.checkboxLink}>
                        {checkboxLinkText}
                      </a>
                    </>
                  ) : (
                    checkboxLabel
                  )}
                </span>
              </label>
            </div>
          )}
          {submitted && errors.agreed && <span className={styles.error}>{errors.agreed}</span>}
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>
        {footer && (
          <>
            <hr className={styles.divider} />
            <p className={styles.authFooter}>{footer}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Forgot Password Page ──
export interface ForgotPasswordPageProps extends BaseAuthPageProps {
  /** Email placeholder */
  emailPlaceholder?: string;
  /** Button text */
  buttonText?: string;
  /** Back to sign in link text */
  backLinkText?: string;
  /** Back to sign in link href */
  backLinkHref?: string;
}

export function ForgotPasswordPage({
  title = "Reset password",
  subtitle = "Enter your email and we'll send a reset link",
  footer,
  onSubmit,
  loading = false,
  brand,
  className,
  emailPlaceholder = "Email address",
  buttonText = "Send reset link",
  backLinkText = "Back to sign in",
  backLinkHref = "/signin",
}: ForgotPasswordPageProps) {
  const id = React.useId();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email"); return; }
    onSubmit?.({ email });
    setSent(true);
  };

  return (
    <div className={cx(styles.authLayout, className)}>
      <div className={styles.authCard}>
        {brand && <div className={styles.authBrand}>{brand}</div>}
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>{title}</h1>
          {subtitle && <p className={styles.authSubtitle}>{subtitle}</p>}
        </div>
        {sent ? (
          <div className={styles.sentMessage}>
            <p className={styles.sentText}>
              If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
            </p>
            <a href={backLinkHref} className={styles.backLink}>
              {backLinkText}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <Field label={emailPlaceholder} id={id + "-email"} error={error}>
              <input
                id={id + "-email"}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={styles.input}
                autoComplete="email"
                autoFocus
              />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Sending...
                </>
              ) : (
                buttonText
              )}
            </button>
          </form>
        )}
        {footer && (
          <>
            <hr className={styles.divider} />
            <p className={styles.authFooter}>{footer}</p>
          </>
        )}
      </div>
    </div>
  );
}
