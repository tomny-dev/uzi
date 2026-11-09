import * as React from "react";
import { AuthCard } from "../auth-card/AuthCard";
import { AuthField, AuthForm, AuthModeSwitch, type AuthMode } from "../auth-form/AuthForm";
import { Input } from "../input/Input";
import { Button } from "../button/Button";
import styles from "./auth-page.module.css";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthPageProps {
  /** Brand/logo above the form. */
  brand?: React.ReactNode;
  /** Title for each mode. */
  signInTitle?: string;
  signUpTitle?: string;
  signInSubtitle?: string;
  signUpSubtitle?: string;
  /** Initial tab; changes to this prop after mount do not reset the selected tab. */
  defaultMode?: AuthMode;
  /** Optional controlled tab, e.g. when sign-in and sign-up use separate routes. */
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  /** App-specific auth callbacks; throwing an Error displays an inline failure. */
  onSignIn?: (credentials: AuthCredentials) => Promise<unknown> | unknown;
  onSignUp?: (credentials: AuthCredentials) => Promise<unknown> | unknown;
  onError?: (error: unknown, mode: AuthMode) => void;
  /** Prefill email without ever populating a password. */
  initialEmail?: string;
  /** Prevent submission until the app's authentication provider is ready. */
  disabled?: boolean;
  /** Minimum password length for account creation; default 8. */
  minPasswordLength?: number;
  /** Optional terms requirement for sign-up only. */
  signUpOptions?: {
    requireTerms?: boolean;
    termsHref?: string;
    termsLabel?: string;
  };
  /** Optional app-owned password recovery route. */
  forgotPasswordHref?: string;
  className?: string;
}

/**
 * Complete app-neutral authentication UX. Uzi owns UI state and validation;
 * the consuming application owns credentials, sessions, API calls and redirects.
 */
export function AuthPage({
  brand,
  signInTitle = "Welcome back",
  signUpTitle = "Create your account",
  signInSubtitle,
  signUpSubtitle,
  defaultMode = "signin",
  mode: controlledMode,
  onModeChange,
  onSignIn,
  onSignUp,
  onError,
  initialEmail = "",
  disabled = false,
  minPasswordLength = 8,
  signUpOptions,
  forgotPasswordHref,
  className,
}: AuthPageProps) {
  const [internalMode, setInternalMode] = React.useState<AuthMode>(defaultMode);
  const mode = controlledMode ?? internalMode;
  const [email, setEmail] = React.useState(initialEmail);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const pendingRef = React.useRef(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState("");
  const id = React.useId();
  const emailId = id + "-email";
  const passwordId = id + "-password";
  const confirmId = id + "-confirm";
  const termsId = id + "-terms";
  const signup = mode === "signup";
  const termsRequired = signup && !!signUpOptions?.requireTerms;
  const canSwitch = !!onModeChange || (!!onSignIn && !!onSignUp);

  React.useEffect(() => {
    // Changes from an authenticated account may prefill the email after hydration.
    if (initialEmail) setEmail((previous) => previous || initialEmail);
  }, [initialEmail]);

  const switchMode = (next: AuthMode) => {
    if (pendingRef.current || next === mode) return;
    setInternalMode(next);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setErrors({});
    setServerError("");
    onModeChange?.(next);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pendingRef.current || disabled) return;
    const nextErrors: Record<string, string> = {};
    const normalizedEmail = email.trim();
    if (!normalizedEmail) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = "Enter a valid email address";
    if (!password) nextErrors.password = "Password is required";
    else if (signup && password.length < minPasswordLength) nextErrors.password = `Use at least ${minPasswordLength} characters`;
    if (signup && password !== confirmPassword) nextErrors.confirm = "Passwords do not match";
    if (termsRequired && !acceptedTerms) nextErrors.terms = "Accept the terms to continue";
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length) return;

    pendingRef.current = true;
    setPending(true);
    try {
      const credentials = { email: normalizedEmail, password };
      if (signup) {
        if (!onSignUp) return;
        await onSignUp(credentials);
      } else {
        if (!onSignIn) return;
        await onSignIn(credentials);
      }
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setServerError(error instanceof Error && error.message ? error.message : "Unable to complete the request. Try again.");
      onError?.(error, mode);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  return (
    <AuthCard
      className={className}
      brand={brand}
      title={signup ? signUpTitle : signInTitle}
      subtitle={signup ? signUpSubtitle : signInSubtitle}
    >
      {canSwitch && <AuthModeSwitch mode={mode} onModeChange={switchMode} />}
      <AuthForm onSubmit={submit} noValidate aria-busy={pending}>
        <AuthField htmlFor={emailId} label="Email" error={errors.email}>
          <Input
            id={emailId} type="email" placeholder="you@example.com" value={email}
            autoComplete="email" required disabled={disabled || pending}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? emailId + "-error" : undefined}
            onChange={(event) => { setEmail(event.target.value); setErrors((old) => ({ ...old, email: "" })); }}
          />
        </AuthField>
        <AuthField htmlFor={passwordId} label="Password" error={errors.password}>
          <div className={styles.passwordRow}>
            <Input
              id={passwordId} type={showPassword ? "text" : "password"}
              placeholder={signup ? "At least " + minPasswordLength + " characters" : "Enter your password"}
              value={password} required disabled={disabled || pending}
              autoComplete={signup ? "new-password" : "current-password"}
              aria-invalid={!!errors.password} aria-describedby={errors.password ? passwordId + "-error" : undefined}
              onChange={(event) => { setPassword(event.target.value); setErrors((old) => ({ ...old, password: "" })); }}
            />
            <button type="button" className={styles.visibility} disabled={disabled || pending}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-controls={passwordId} aria-pressed={showPassword}
              onClick={() => setShowPassword((old) => !old)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </AuthField>
        {signup && (
          <AuthField htmlFor={confirmId} label="Confirm password" error={errors.confirm}>
            <Input id={confirmId} type="password" placeholder="Re-enter password" value={confirmPassword}
              autoComplete="new-password" required disabled={disabled || pending}
              aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? confirmId + "-error" : undefined}
              onChange={(event) => { setConfirmPassword(event.target.value); setErrors((old) => ({ ...old, confirm: "" })); }} />
          </AuthField>
        )}
        {termsRequired && (
          <div className={styles.terms}>
            <label htmlFor={termsId} className={styles.termsLabel}>
              <input id={termsId} type="checkbox" checked={acceptedTerms} disabled={disabled || pending}
                aria-invalid={!!errors.terms} aria-describedby={errors.terms ? termsId + "-error" : undefined}
                onChange={(event) => { setAcceptedTerms(event.target.checked); setErrors((old) => ({ ...old, terms: "" })); }} />
              <span>{signUpOptions?.termsLabel ?? "I agree to the "}
                {signUpOptions?.termsHref ? <a href={signUpOptions.termsHref}>Terms of Service</a> : "Terms of Service"}
              </span>
            </label>
            {errors.terms && <p className={styles.error} id={termsId + "-error"} role="alert">{errors.terms}</p>}
          </div>
        )}
        {!signup && forgotPasswordHref && <a className={styles.forgot} href={forgotPasswordHref}>Forgot password?</a>}
        {serverError && <p className={styles.error} role="alert">{serverError}</p>}
        <Button type="submit" variant="primary" size="lg" disabled={disabled || pending || (signup ? !onSignUp : !onSignIn)}>
          {pending ? (signup ? "Creating account..." : "Signing in...") : (signup ? "Create account" : "Sign in")}
        </Button>
      </AuthForm>
    </AuthCard>
  );
}
