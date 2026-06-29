import * as React from "react";
import { cx } from "../../utils/cx";
import styles from "./auth-card.module.css";

export interface AuthCardProps {
  /** Title displayed at the top of the card. */
  title: React.ReactNode;
  /** Subtitle displayed below the title. */
  subtitle?: React.ReactNode;
  /** Primary form content rendered in the card body. */
  children: React.ReactNode;
  /** Footer links rendered below the divider (e.g., "No account? Sign up"). */
  footer?: React.ReactNode;
  /** Optional brand/logo element rendered above the title. */
  brand?: React.ReactNode;
  /** Additional class name for the outer wrapper. */
  className?: string;
}

/**
 * AuthCard — a centered card layout for auth pages.
 *
 * - Centered vertically and horizontally on screen
 * - Brand → title → subtitle → form → divider → footer
 * - No auth logic — just the visual template
 */
export const AuthCard = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ title, subtitle, children, footer, brand, className }, ref) => {
    return (
      <div className={cx(styles.authLayout, className)} ref={ref}>
        <div className={styles.authCard}>
          {brand && <div className={styles.authBrand}>{brand}</div>}
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>{title}</h1>
            {subtitle && <p className={styles.authSubtitle}>{subtitle}</p>}
          </div>
          <div className={styles.authBody}>{children}</div>
          {footer && (
            <>
              <hr className={styles.divider} />
              <p className={styles.authFooter}>{footer}</p>
            </>
          )}
        </div>
      </div>
    );
  },
);

AuthCard.displayName = "AuthCard";
