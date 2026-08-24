import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./error-page.module.css";

export interface ErrorPageProps {
  /** HTTP status code (e.g., 404, 500, 503) */
  statusCode?: number;
  /** Descriptive message for the error */
  message?: React.ReactNode;
  /** Subtitle providing additional context */
  subtitle?: React.ReactNode;
  /** Action button rendered below the message */
  action?: React.ReactNode;
  /** Whether to render a large decorative icon */
  showIcon?: boolean;
  /** Additional class name for the outer wrapper */
  className?: string;
}

/**
 * ErrorPage — a generic error page with configurable status code, message, and action.
 *
 * Layout:
 *   Full-viewport centered card with
 *     Icon (optional) -> status code -> message -> subtitle -> action
 */
export function ErrorPage({
  statusCode = 500,
  message = "Something went wrong",
  subtitle,
  action,
  showIcon = true,
  className,
}: ErrorPageProps) {
  return (
    <div className={cx(styles.layout, className)}>
      <div className={styles.card}>
        {showIcon && (
          <div className={styles.icon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className={styles.iconSvg}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="0.5" fill="currentColor" />
            </svg>
          </div>
        )}
        <div className={styles.content}>
          <span className={styles.statusCode}>{statusCode}</span>
          <h1 className={styles.title}>{message}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * NotFoundPage — a 404 variant of ErrorPage.
 */
export function NotFoundPage({
  action,
  className,
}: Omit<ErrorPageProps, "statusCode" | "message" | "subtitle" | "showIcon">) {
  return (
    <ErrorPage
      statusCode={404}
      message="Page not found"
      subtitle="The page you're looking for doesn't exist or has been moved."
      action={action}
      className={className}
    />
  );
}

/**
 * MaintenancePage — a 503 variant of ErrorPage for under-maintenance sites.
 */
export function MaintenancePage({
  action,
  className,
}: Omit<ErrorPageProps, "statusCode" | "message" | "subtitle" | "showIcon">) {
  return (
    <ErrorPage
      statusCode={503}
      message="Site under maintenance"
      subtitle="We're currently performing scheduled maintenance. We'll be back shortly."
      action={action}
      className={className}
    />
  );
}
